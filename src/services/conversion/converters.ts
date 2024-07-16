import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { supportedFormats } from '../../supportedFormats'
import { Scene, getTotalSceneDuration } from '../../types/Scene'
import { Video } from '../../types/Video'
import { roundToEven } from '../../utils/numbers'
import { generateBackground } from '../drawing/background'
import { generateSceneMask } from '../drawing/sceneMask'
import { getSceneSize, getVideoRectInScene } from '../../types/DrawableScene'
import { generateBezelsImage } from '../drawing/bezels'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

type VideoFileInputs = {
    videoInput: string,
}

export async function convertScene(ffmpeg: FFmpeg, scene: Scene, onProgressStateChange: (state: string) => void) {
    const fileName = `result${supportedFormats[scene.formatKey].suffix}`;
    const {
        inputs,
        backgroundInputName,
        sceneMaskInputName,
        bezelsImageInputName,
        videoInputNamesMap,
        fileNames
    } = await loadVideos(ffmpeg, scene, onProgressStateChange);
    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const mergedVideosOutputName = 'merged-videos';

    const complexFilter = fc.compose(
        videosFfmpegArgs(scene, videoInputNamesMap, mergedVideosOutputName),
        fc.alphamerge({
            input: [mergedVideosOutputName, sceneMaskInputName],
            output: ['alphamerged-videos']
        }),
        fc.overlay({
            input: [backgroundInputName, 'alphamerged-videos'],
            output: ['background-merged']
        }),
        fc.overlay({
            input: ['background-merged', bezelsImageInputName],
            output: ['bezels-merged']
        }),
        fc.fps({
            input: ['bezels-merged'],
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
    );

    onProgressStateChange('Rendering scene');
    await ffmpeg.exec([
        ...inputs,
        '-avoid_negative_ts', 'make_zero', // https://superuser.com/questions/1167958/video-cut-with-missing-frames-in-ffmpeg
        '-filter_complex',
        complexFilter,
        ...(scene.formatKey === supportedFormats.gif.key ?
            gifOutput(fileName) :
            scene.formatKey === supportedFormats.mp4.key ?
                mp4Output(fileName, [sceneWidth, sceneHeight]) :
                webpOutput(fileName, [sceneWidth, sceneHeight]))
    ]);

    const data = await ffmpeg.readFile(fileName);

    onProgressStateChange('Removing old files');
    await removeFiles(ffmpeg, fileNames);

    return data;
}

function videosFfmpegArgs(scene: Scene, inputNamesMap: Map<Video, VideoFileInputs>, outputName: string) {
    if (scene.videos.length === 1) {
        const video = scene.videos[0];
        const inputNames = inputNamesMap.get(video);
        if (!inputNames)
            throw new Error('Error occured during conversion');

        return videoFfmpegArgs(scene, video, inputNames, outputName);
    }

    const outputNamesStack: Array<string> = [];
    const videoArgs: Array<string> = [];
    const overlayArgs: Array<string> = [];

    for (const video of scene.videos) {
        const inputNames = inputNamesMap.get(video);
        if (!inputNames)
            throw new Error('Error occured during conversion');

        const outputName = generateOutputName('output', video);
        videoArgs.push(videoFfmpegArgs(scene, video, inputNames, outputName));
        outputNamesStack.push(outputName);
    }

    let index = 0;
    let lastOverlayedOutput = outputNamesStack.pop();

    while (lastOverlayedOutput && outputNamesStack.length > 0) {
        const name = outputNamesStack.pop();

        if (name) {
            const overlayOutputName = outputNamesStack.length > 0 ? `video-overlay_${index++}` : outputName;

            overlayArgs.push(fc.overlay({
                input: [lastOverlayedOutput, name],
                output: [overlayOutputName]
            }));

            lastOverlayedOutput = overlayOutputName;
        }
    }

    return fc.compose(...videoArgs, ...overlayArgs);
}

function videoFfmpegArgs(scene: Scene, video: Video, inputNames: VideoFileInputs, outputName: string) {
    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const { videoWidth, videoHeight, videoX, videoY } = getVideoRectInScene(video, scene);

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndTpad(scene, video);

    if (video.withBezel) {
        const bezel = getBezel(video.bezelKey);

        return fc.compose(
            fc.trimAndTpad({
                input: [inputNames.videoInput],
                output: [generateOutputName('trimmed-video', video)],
                startPadDuration: videoStartPadDuration,
                endPadDuration: videoEndPadDuration,
                startTrimTime: videoStart,
                endTrimTime: videoEnd
            }),
            fc.scale({
                input: [generateOutputName('trimmed-video', video)],
                output: [generateOutputName('scaled-video', video)],
                width: videoWidth * bezel.contentScale,
                height: videoHeight * bezel.contentScale
            }),
            fc.pad({
                input: [generateOutputName('scaled-video', video)],
                output: [generateOutputName('padded-video', video)],
                width: videoWidth,
                height: videoHeight
            }),
            fc.pad({
                input: [generateOutputName('padded-video', video)],
                output: [outputName],
                width: sceneWidth,
                height: sceneHeight,
                x: videoX,
                y: videoY
            })
        );
    }

    return fc.compose(
        fc.yuv({
            input: [inputNames.videoInput],
            output: [generateOutputName('yuv-video', video)]
        }),
        fc.trimAndTpad({
            input: [generateOutputName('yuv-video', video)],
            output: [generateOutputName('trimmed-video', video)],
            startPadDuration: videoStartPadDuration,
            endPadDuration: videoEndPadDuration,
            startTrimTime: videoStart,
            endTrimTime: videoEnd
        }),
        fc.scale({
            input: [generateOutputName('trimmed-video', video)],
            output: [generateOutputName('scaled-video', video)],
            width: videoWidth,
            height: videoHeight
        }),
        fc.pad({
            input: [generateOutputName('scaled-video', video)],
            output: [outputName],
            width: sceneWidth,
            height: sceneHeight,
            x: videoX,
            y: videoY
        })
    );
}

async function loadVideos(ffmpeg: FFmpeg, scene: Scene, onProgressStateChange: (state: string) => void) {
    const videoInputNamesMap = new Map<Video, VideoFileInputs>();
    const inputs: Array<string> = [];
    const fileNames: Array<string> = [];
    let index = 0;

    onProgressStateChange('Loading videos');

    for (const video of scene.videos) {
        const videoName = await loadVideo(ffmpeg, scene, video, onProgressStateChange);
        const videoInput = `${index++}:v`;
        
        inputs.push('-i', videoName);
        fileNames.push(videoName);
        videoInputNamesMap.set(video, { videoInput: videoInput });
    }
    
    onProgressStateChange(`Generating background`);
    const background = await generateBackground(scene);
    if (!background)
        throw new Error('Background could not be generated');

    let backgroundInputName;
    ({ imageInputName: backgroundInputName, index } = await writeImageFile(ffmpeg, index, inputs, fileNames, 'background.png', background));

    onProgressStateChange(`Generating scene mask`);
    const sceneMask = await generateSceneMask(scene);
    if (!sceneMask)
        throw new Error('Scene mask could not be generated');

    let sceneMaskInputName;
    ({ imageInputName: sceneMaskInputName, index } = await writeImageFile(ffmpeg, index, inputs, fileNames, 'scene-mask.png', sceneMask));

    onProgressStateChange(`Generating bezels`);
    const bezelsImage = await generateBezelsImage(scene);
    if (!bezelsImage)
        throw new Error('Bezels image could not be generated');

    let bezelsImageInputName;
    ({ imageInputName: bezelsImageInputName, index } = await writeImageFile(ffmpeg, index, inputs, fileNames, 'bezels-image.png', bezelsImage));

    return {
        inputs,
        backgroundInputName,
        sceneMaskInputName,
        bezelsImageInputName,
        videoInputNamesMap,
        fileNames
    };
}

async function writeImageFile(ffmpeg: FFmpeg, index: number, inputs: Array<string>, fileNames: Array<string>, imageFileName: string, imageFile: File) {
    const imageInputName = `${index++}:v`;
    inputs.push('-i', imageFileName);
    fileNames.push(imageFileName);

    await ffmpeg.writeFile(imageFileName, await fetchFile(imageFile));

    return { imageInputName, index };
}

async function loadVideo(ffmpeg: FFmpeg, scene: Scene, video: Video, onProgressStateChange: (state: string) => void) {
    if (!video.file)
        throw new Error('No video file selected');

    const videoFile = video.file;
    const extension = videoFile.name.split('.').at(-1);
    const videoName = `${videoFile.name.split('.').slice(0, -1).join('.')}_${video.index}.${extension}`;
    
    onProgressStateChange(`Loading video #${video.index + 1}`);
    await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

    if (!scene.isPrerenderingEnabled) {
        return videoName;
    }

    const prerenderedVideoName = `prerendered_${videoName}`;
    const { videoWidth, videoHeight } = getVideoRectInScene(video, scene);
    /*
    const { videoStart, videoEnd } = calculateTrim(scene, video);
    */

    onProgressStateChange(`Prerendering video #${video.index + 1}`);
    await ffmpeg.exec([
        '-i', videoName,
        '-filter_complex',
        fc.scale({
            input: ['0:v'],
            width: roundToEven(videoWidth),
            height: roundToEven(videoHeight)
        }),
        /*
        // When I trim the video, there may be some missing frames
        // I was not able to solve this problem
        // However, if I manage to figure this problem out, it could reduce the rendering time
        ...(videoStart ? ['-ss', videoStart.toString()] : []),
        ...(videoEnd ? ['-to', videoEnd.toString()] : []),
        */
        '-an', '-sn', '-c:v', 'libx264',
        '-avoid_negative_ts', 'make_zero', // https://superuser.com/questions/1167958/video-cut-with-missing-frames-in-ffmpeg
        prerenderedVideoName
    ]);

    ffmpeg.deleteFile(videoName);
    return prerenderedVideoName;
}

function calculateTrimAndTpad(scene: Scene, video: Video) {
    const trim = calculateTrim(scene, video);

    return {
        videoStart: trim.videoStart,
        videoEnd: trim.videoEnd,
        /*
        videoStart: scene.isPrerenderingEnabled ? null : trim.videoStart,
        videoEnd: scene.isPrerenderingEnabled ? null : trim.videoEnd,
        */
        videoStartPadDuration: Math.max(0, trim.calculatedVideoStart + video.sceneOffset - scene.startTime),
        videoEndPadDuration: Math.max(0, scene.endTime - (trim.calculatedVideoEnd + video.sceneOffset)),
    };
}

function calculateTrim(scene: Scene, video: Video) {
    const videoStart = Math.max(video.startTime, scene.startTime - video.sceneOffset);
    const videoEnd = Math.min(video.endTime, scene.endTime - video.sceneOffset);
    const totalDuration = getTotalSceneDuration(scene);

    return {
        calculatedVideoStart: videoStart,
        calculatedVideoEnd: videoEnd,
        videoStart: videoStart <= 0 ? null : videoStart,
        videoEnd: videoEnd >= totalDuration ? null : videoEnd
    };
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
    ];
}

function gifOutput(fileName: string) {
    return [
        '-f', 'gif', fileName
    ];
}

function mp4Output(fileName: string, size?: [number, number]) {
    return [
        '-an', '-sn', '-c:v', 'libx264',
        ...(size ? ['-s', `${roundToEven(size[0])}:${roundToEven(size[1])}`] : []), // size has to be divisible by 2
        fileName
    ];
}

function generateOutputName(output: string, video: Video) {
    return `${output}_${video.index}`;
}

async function removeFiles(ffmpeg: FFmpeg, fileNames: Array<string>) {
    // TODO: May this be done in parallel and not sequentially?
    for (const file of fileNames) {
        await ffmpeg.deleteFile(file);
    }
}