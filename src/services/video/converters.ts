import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getBezelSize } from '../../utils/size'
import { bezelImage, bezelMask, getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { SupportedFormat, supportedFormats } from '../../supportedFormats'
import { Scene, getFirstVideo, getTotalSceneDuration } from '../../types/Scene'
import { Video } from '../../types/Video'

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

    return video.withBezel ?
        await convertWithBezel(ffmpeg, scene) :
        await convertWithoutBezel(ffmpeg, scene);
}

async function convertWithBezel(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);
    
    if (!video.file)
        throw new Error('No file selected');
    
    const bezel = getBezel(video.bezelKey);
    const videoFile = video.file;
    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const bezelMaskName = bezelMask(bezel.modelKey).split('/').slice(0, -1)[0];
    const fileName = createFileName(videoName, scene.formatKey);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezelImage(bezel.key)));
    await ffmpeg.writeFile(bezelMaskName, await fetchFile(bezelMask(bezel.modelKey)));

    const [width, height] = getBezelSize(bezel, video.requestedMaxSize);
    const videoScale = bezel.contentScale;

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndTpad(scene, video);

    await ffmpeg.exec([
        ...bezelFfmpegArgs(
            videoName,
            bezelName,
            bezelMaskName,
            width,
            height,
            videoScale,
            videoStart,
            videoEnd,
            videoStartPadDuration,
            videoEndPadDuration,
            scene
        ),
        ...(scene.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName, scene.startTime, scene.endTime - scene.startTime) :
            webpOutput(fileName, scene.startTime, scene.endTime - scene.startTime, [width, height]))
    ]);

    return await ffmpeg.readFile(fileName);
}

async function convertWithoutBezel(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);
    
    if (!video.file)
        throw new Error('No file selected');
    
    const videoFile = video.file;
    const videoName = videoFile.name;
    const fileName = createFileName(videoName, scene.formatKey);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndTpad(scene, video);

    await ffmpeg.exec([
        ...ffmpegArgs(
            videoName,
            videoStart,
            videoEnd,
            videoStartPadDuration,
            videoEndPadDuration,
            video.requestedMaxSize,
            scene),
        ...(scene.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName, scene.startTime, scene.endTime - scene.startTime) :
            webpOutput(fileName, scene.startTime, scene.endTime - scene.startTime))
    ]);

    return await ffmpeg.readFile(fileName);
}

function calculateTrimAndTpad(scene: Scene, video: Video) {
    const videoStart = video.startTime <= 0 ? null : video.startTime;
    const videoEnd = video.endTime >= video.totalDuration ? null : video.endTime;

    const totalDuration = getTotalSceneDuration(scene);

    return {
        videoStart: videoStart,
        videoEnd: videoEnd,
        videoStartPadDuration: video.startTime + video.sceneOffset,
        videoEndPadDuration: totalDuration - (video.endTime + video.sceneOffset),
    };
}

function bezelFfmpegArgs(
    videoName: string,
    bezelName: string,
    bezelMaskName: string,
    width: number,
    height: number,
    videoScale: number,
    videoStart: number | null,
    videoEnd: number | null,
    videoStartPadDuration: number,
    videoEndPadDuration: number,
    scene: Scene
) {
    return [
        '-i', videoName,
        '-i', bezelName,
        '-i', bezelMaskName,
        '-filter_complex',
        fc.compose(
            fc.trimAndTpad({
                input: ['0:v'],
                output: ['trimmed-video'],
                startPadDuration: videoStartPadDuration,
                endPadDuration: videoEndPadDuration,
                startTrimTime: videoStart,
                endTrimTime: videoEnd
            }),
            fc.scale({
                input: ['trimmed-video'],
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
                output: scene.formatKey === supportedFormats.gif.key ? ['fpsed'] : undefined,
                fps: scene.fps
            }),
            ...(scene.formatKey === supportedFormats.gif.key ? [
                fc.split({
                    input: ['fpsed'],
                    output: ['s0', 's1']
                }),
                fc.palettegen({
                    input: ['s0'],
                    output: ['p'],
                    maxColors: scene.maxColors
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
    videoStart: number | null,
    videoEnd: number | null,
    videoStartPadDuration: number,
    videoEndPadDuration: number,
    size: number,
    scene: Scene
) {
    return [
        '-i', videoName,
        '-filter_complex',
        fc.compose(
            fc.rgba({
                input: ['0:v'],
                output: ['rgba-video']
            }),
            fc.trimAndTpad({
                input: ['rgba-video'],
                output: ['trimmed-video'],
                startPadDuration: videoStartPadDuration,
                endPadDuration: videoEndPadDuration,
                startTrimTime: videoStart,
                endTrimTime: videoEnd
            }),
            fc.scale({
                input: ['trimmed-video'],
                output: ['scaled-video'],
                width: size,
                height: size
            }),
            fc.fps({
                input: ['scaled-video'],
                output: scene.formatKey === supportedFormats.gif.key ? ['fpsed'] : undefined,
                fps: scene.fps
            }),
            ...(scene.formatKey === supportedFormats.gif.key ? [
                fc.split({
                    input: ['fpsed'],
                    output: ['s0', 's1']
                }),
                fc.palettegen({
                    input: ['s0'],
                    output: ['p'],
                    maxColors: scene.maxColors
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

function createFileName(videoName: string, formatKey: SupportedFormat) {
    return videoName.split('.').slice(0, -1).join('.') + supportedFormats[formatKey].suffix
}
