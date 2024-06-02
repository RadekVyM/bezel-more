import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getBezelSize } from '../../utils/size'
import { bezelImage, bezelMask, getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { SupportedFormat, supportedFormats } from '../../supportedFormats'
import { Bezel } from '../../types/Bezel'
import { Scene, getFirstVideo } from '../../types/Scene'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

type ConversionConfig = {
    fps: number,
    maxColors: number,
    size: number,
    start: number,
    end: number,
    formatKey: SupportedFormat,
}

export async function convertScene(ffmpeg: FFmpeg, scene: Scene) {
    if (scene.videos.length === 1) {
        return await convertJustOne(ffmpeg, scene);
    }
}

async function convertJustOne(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);

    if (!video.file)
        throw new Error('No file selected');

    const config: ConversionConfig = {
        fps: scene.fps,
        formatKey: scene.formatKey,
        maxColors: scene.maxColors,
        start: video.sceneOffset + video.startTime - scene.startTime,
        end: video.sceneOffset + video.endTime - scene.endTime,
        size: video.requestedMaxSize
    };

    if (video.withBezel) {
        const bezel = getBezel(video.bezelKey);
        return await convertWithBezel(ffmpeg, video.file, bezel, config);
    }
    else {
        return await convertWithoutBezel(ffmpeg, video.file, config);
    }
}

async function convertWithBezel(ffmpeg: FFmpeg, videoFile: File, bezel: Bezel, config: ConversionConfig) {
    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const bezelMaskName = bezelMask(bezel.modelKey).split('/').slice(0, -1)[0];
    const fileName = createFileName(videoName, config);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezelImage(bezel.key)));
    await ffmpeg.writeFile(bezelMaskName, await fetchFile(bezelMask(bezel.modelKey)));

    const [width, height] = getBezelSize(bezel, config.size);
    const videoScale = bezel.contentScale;

    const start = config.start || 0;
    const end = config.end || 1;
    const length = end - start;

    await ffmpeg.exec([
        ...bezelFfmpegArgs(
            videoName,
            bezelName,
            bezelMaskName,
            width,
            height,
            videoScale,
            config
        ),
        ...(config.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName, start, length) :
            webpOutput(fileName, start, length, [width, height]))
    ]);

    return await ffmpeg.readFile(fileName);
}

async function convertWithoutBezel(ffmpeg: FFmpeg, videoFile: File, config: ConversionConfig) {
    const videoName = videoFile.name;
    const fileName = createFileName(videoName, config);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

    const start = config.start || 0;
    const end = config.end || 1;
    const length = end - start;

    await ffmpeg.exec([
        ...ffmpegArgs(videoName, config),
        ...(config.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName, start, length) :
            webpOutput(fileName, start, length))
    ]);

    return await ffmpeg.readFile(fileName);
}

function bezelFfmpegArgs(
    videoName: string,
    bezelName: string,
    bezelMaskName: string,
    width: number,
    height: number,
    videoScale: number,
    config: ConversionConfig
) {
    return [
        '-i', videoName,
        '-i', bezelName,
        '-i', bezelMaskName,
        '-filter_complex',
        fc.compose(
            fc.scale({
                input: ['0:v'],
                output: ['scaled-video'],
                width: width * videoScale,
                height: height * videoScale
            }),
            fc.pad({
                input: ['scaled-video'],
                output: ['padded-video'],
                width: width,
                height: height
            }),
            fc.scale({
                input: ['1:v'],
                output: ['scaled-bezel'],
                width: width,
                height: height
            }),
            fc.overlay({
                input: ['padded-video', 'scaled-bezel'],
                output: ['merged']
            }),
            fc.scale2ref({
                input: ['2:v', 'merged'],
                output: ['scaled-mask', 'merged-2']
            }),
            fc.alphamerge({
                input: ['merged-2', 'scaled-mask'],
                output: ['alphamerged']
            }),
            fc.fps({
                input: ['alphamerged'],
                output: config.formatKey === supportedFormats.gif.key ? ['fpsed'] : undefined,
                fps: config.fps
            }),
            ...(config.formatKey === supportedFormats.gif.key ? [
                fc.split({
                    input: ['fpsed'],
                    output: ['s0', 's1']
                }),
                fc.palettegen({
                    input: ['s0'],
                    output: ['p'],
                    maxColors: config.maxColors
                }),
                fc.paletteuse({
                    input: ['s1', 'p']
                })
            ] : [])
        )
    ]
}

function ffmpegArgs(
    videoName: string,
    config: ConversionConfig
) {
    return [
        '-i', videoName,
        '-filter_complex',
        fc.compose(
            fc.rgba({
                input: ['0:v'],
                output: ['rgba-video']
            }),
            fc.scale({
                input: ['rgba-video'],
                output: ['scaled-video'],
                width: config.size,
                height: config.size
            }),
            fc.fps({
                input: ['scaled-video'],
                output: config.formatKey === supportedFormats.gif.key ? ['fpsed'] : undefined,
                fps: config.fps
            }),
            ...(config.formatKey === supportedFormats.gif.key ? [
                fc.split({
                    input: ['fpsed'],
                    output: ['s0', 's1']
                }),
                fc.palettegen({
                    input: ['s0'],
                    output: ['p'],
                    maxColors: config.maxColors
                }),
                fc.paletteuse({
                    input: ['s1', 'p']
                })
            ] : [])
        )
    ]
}

function webpOutput(fileName: string, start: number, length: number, size?: [number, number]) {
    return [
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-vsync', '0',
        ...(size ? ['-s', `${size[0]}:${size[1]}`] : []),
        '-t', `${length}`, '-ss', `${start}`, fileName
    ]
}

function gifOutput(fileName: string, start: number, length: number) {
    return [
        '-t', `${length}`, '-ss', `${start}`, '-f', 'gif', fileName
    ]
}

function createFileName(videoName: string, config: ConversionConfig) {
    return videoName.split('.').slice(0, -1).join('.') + supportedFormats[config.formatKey].suffix
}
