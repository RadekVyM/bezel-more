import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getBezelSize } from '../../utils/size'
import { bezelImage, bezelMask } from '../../bezels'
import * as fc from './filterComplex'
import { ConversionConfig } from './ConversionConfig'
import { supportedFormats } from '../../supportedFormats'
import { Bezel } from '../../types/Bezel'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

export async function convertWithBezel(ffmpeg: FFmpeg, videoFile: File, bezel: Bezel, config: ConversionConfig) {
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

export async function convertWithoutBezel(ffmpeg: FFmpeg, videoFile: File, config: ConversionConfig) {
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
