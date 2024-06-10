import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { bezelImage, bezelMask, getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { SupportedFormat, supportedFormats } from '../../supportedFormats'
import { Scene, getFirstVideo, getSceneSize, getTotalSceneDuration, getVideoSizeInScene } from '../../types/Scene'
import { Video } from '../../types/Video'
import { roundToEven } from '../../utils/numbers'
import { generateBackground } from './background'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

export async function convertScene(ffmpeg: FFmpeg, scene: Scene) {
    // TODO: This is just temporary solution
    if (scene.videos.length === 1) {
        return await convertJustOne(ffmpeg, scene);
    }
}

async function convertJustOne(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);
    return video.withBezel ?
        await convertWithBezel(ffmpeg, scene) :
        await convertWithoutBezel(ffmpeg, scene);
}

async function convertWithBezel(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);
    
    if (!video.file)
        throw new Error('No file selected');
    
    const background = await generateBackground(scene);
    if (!background)
        throw new Error('Background could not be generated');

    const bezel = getBezel(video.bezelKey);
    const videoFile = video.file;
    const videoName = videoFile.name;
    const bezelName = 'bezel.png';
    const backgroundName = 'background.png';
    const bezelMaskName = bezelMask(bezel.modelKey).split('/').slice(0, -1)[0];
    const fileName = createFileName(videoName, scene.formatKey);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(bezelName, await fetchFile(bezelImage(bezel.key)));
    await ffmpeg.writeFile(bezelMaskName, await fetchFile(bezelMask(bezel.modelKey)));
    await ffmpeg.writeFile(backgroundName, await fetchFile(background));

    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const { videoWidth, videoHeight } = getVideoSizeInScene(video, scene);

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndTpad(scene, video);

    await ffmpeg.exec([
        ...bezelFfmpegArgs(
            videoName,
            bezelName,
            bezelMaskName,
            backgroundName,
            sceneWidth,
            sceneHeight,
            videoWidth,
            videoHeight,
            bezel.contentScale,
            videoStart,
            videoEnd,
            videoStartPadDuration,
            videoEndPadDuration,
            scene
        ),
        ...(scene.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName) :
            scene.formatKey === supportedFormats.mp4.key ?
                mp4Output(fileName, [sceneWidth, sceneHeight]) :
                webpOutput(fileName, [sceneWidth, sceneHeight]))
    ]);

    return await ffmpeg.readFile(fileName);
}

async function convertWithoutBezel(ffmpeg: FFmpeg, scene: Scene) {
    const video = getFirstVideo(scene);
    
    if (!video.file)
        throw new Error('No file selected');
    
    const background = await generateBackground(scene);
    if (!background)
        throw new Error('Background could not be generated');

    const videoFile = video.file;
    const videoName = videoFile.name;
    const backgroundName = 'background.png';
    const fileName = createFileName(videoName, scene.formatKey);

    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));
    await ffmpeg.writeFile(backgroundName, await fetchFile(background));

    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const { videoWidth, videoHeight } = getVideoSizeInScene(video, scene);

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndTpad(scene, video);

    await ffmpeg.exec([
        ...ffmpegArgs(
            videoName,
            backgroundName,
            videoStart,
            videoEnd,
            videoStartPadDuration,
            videoEndPadDuration,
            sceneWidth,
            sceneHeight,
            videoWidth,
            videoHeight,
            scene),
        ...(scene.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName) :
            scene.formatKey === supportedFormats.mp4.key ?
                mp4Output(fileName, [sceneWidth, sceneHeight]) :
                webpOutput(fileName, [sceneWidth, sceneHeight]))
    ]);

    return await ffmpeg.readFile(fileName);
}

function calculateTrimAndTpad(scene: Scene, video: Video) {
    const videoStart = Math.max(video.startTime, scene.startTime - video.sceneOffset);
    const videoEnd = Math.min(video.endTime, scene.endTime - video.sceneOffset);

    const totalDuration = getTotalSceneDuration(scene);

    return {
        videoStart: videoStart <= 0 ? null : videoStart,
        videoEnd: videoEnd >= totalDuration ? null : videoEnd,
        videoStartPadDuration: Math.max(0, videoStart + video.sceneOffset - scene.startTime),
        videoEndPadDuration: Math.max(0, scene.endTime - (videoEnd + video.sceneOffset)),
    };
}

function bezelFfmpegArgs(
    videoName: string,
    bezelName: string,
    bezelMaskName: string,
    backgroundName: string,
    sceneWidth: number,
    sceneHeight: number,
    videoWidth: number,
    videoHeight: number,
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
        '-i', backgroundName,
        '-avoid_negative_ts', 'make_zero', // https://superuser.com/questions/1167958/video-cut-with-missing-frames-in-ffmpeg
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
                width: videoWidth * videoScale,
                height: videoHeight * videoScale
            }),
            fc.pad({
                input: ['scaled-video'],
                output: ['padded-video'],
                width: videoWidth,
                height: videoHeight
            }),
            fc.scale({
                input: ['1:v'],
                output: ['scaled-bezel'],
                width: videoWidth,
                height: videoHeight
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
            fc.pad({
                input: ['alphamerged'],
                output: ['padded-alphamerged'],
                width: sceneWidth,
                height: sceneHeight
            }),
            fc.overlay({
                input: ['3:v', 'padded-alphamerged'],
                output: ['background-merged']
            }),
            fc.fps({
                input: ['background-merged'],
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
    backgroundName: string,
    videoStart: number | null,
    videoEnd: number | null,
    videoStartPadDuration: number,
    videoEndPadDuration: number,
    sceneWidth: number,
    sceneHeight: number,
    videoWidth: number,
    videoHeight: number,
    scene: Scene
) {
    return [
        '-i', videoName,
        '-i', backgroundName,
        '-avoid_negative_ts', 'make_zero',
        '-filter_complex',
        fc.compose(
            fc.yuv({
                input: ['0:v'],
                output: ['yuv-video']
            }),
            fc.trimAndTpad({
                input: ['yuv-video'],
                output: ['trimmed-video'],
                startPadDuration: videoStartPadDuration,
                endPadDuration: videoEndPadDuration,
                startTrimTime: videoStart,
                endTrimTime: videoEnd
            }),
            fc.scale({
                input: ['trimmed-video'],
                output: ['scaled-video'],
                width: videoWidth,
                height: videoHeight
            }),
            fc.pad({
                input: ['scaled-video'],
                output: ['padded-video'],
                width: sceneWidth,
                height: sceneHeight
            }),
            fc.overlay({
                input: ['1:v', 'padded-video'],
                output: ['background-merged']
            }),
            fc.fps({
                input: ['background-merged'],
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

function webpOutput(fileName: string, size?: [number, number]) {
    return [
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-loop', '0',
        '-preset', 'picture',
        '-an', '-fps_mode', 'auto', // https://ffmpeg.org/ffmpeg.html#:~:text=%2Dfps_mode%5B%3Astream_specifier%5D%20parameter%20(output%2Cper%2Dstream)
        ...(size ? ['-s', `${size[0]}:${size[1]}`] : []),
        fileName
    ]
}

function gifOutput(fileName: string) {
    return [
        '-f', 'gif', fileName
    ]
}

function mp4Output(fileName: string, size?: [number, number]) {
    return [
        '-an', '-sn','-c:v', 'libx264',
        ...(size ? ['-s', `${roundToEven(size[0])}:${roundToEven(size[1])}`] : []), // size has to be divisible by 2
        fileName
    ]
}

function createFileName(videoName: string, formatKey: SupportedFormat) {
    return videoName.split('.').slice(0, -1).join('.') + '_result' + supportedFormats[formatKey].suffix
}