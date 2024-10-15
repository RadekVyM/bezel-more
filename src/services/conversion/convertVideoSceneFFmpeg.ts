import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { supportedVideoFormats } from '../../supportedFormats'
import { VideoScene } from '../../types/VideoScene'
import { Video } from '../../types/Video'
import { roundToEven } from '../../utils/numbers'
import { generateBackground } from '../drawing/background'
import { generateSceneMask } from '../drawing/sceneMask'
import { getSceneSize, getMediumRectInScene } from '../../types/DrawableScene'
import { generateBezelsImage } from '../drawing/bezels'
import calculateTrimAndPad from './calculateTrimAndPad'
import ffmpegOutput from './ffmpegOutput'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

type VideoFileInputs = {
    videoInput: string,
}

export async function convertVideoSceneFFmpeg(ffmpeg: FFmpeg, scene: VideoScene, onProgressStateChange: (state: string) => void) {
    const fileName = `result${supportedVideoFormats[scene.formatKey].suffix}`;
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
            output: scene.formatKey === supportedVideoFormats.gif.key ? ['fpsed'] : undefined,
            fps: scene.fps
        }),
        ...(scene.formatKey === supportedVideoFormats.gif.key ? [
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
        ...(ffmpegOutput(scene.formatKey, fileName, sceneWidth, sceneHeight))
    ]);

    const data = await ffmpeg.readFile(fileName);

    onProgressStateChange('Removing old files');
    await removeFiles(ffmpeg, fileNames);

    return data;
}

function videosFfmpegArgs(scene: VideoScene, inputNamesMap: Map<Video, VideoFileInputs>, outputName: string) {
    if (scene.media.length === 1) {
        const video = scene.media[0];
        const inputNames = inputNamesMap.get(video);
        if (!inputNames)
            throw new Error('Error occured during conversion');

        return videoFfmpegArgs(scene, video, inputNames, outputName);
    }

    const outputNamesStack: Array<string> = [];
    const videoArgs: Array<string> = [];
    const overlayArgs: Array<string> = [];

    for (const video of scene.media) {
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

function videoFfmpegArgs(scene: VideoScene, video: Video, inputNames: VideoFileInputs, outputName: string) {
    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const { mediumWidth, mediumHeight, mediumX, mediumY } = getMediumRectInScene(video, scene);

    const {
        videoStart, videoEnd, videoStartPadDuration, videoEndPadDuration
    } = calculateTrimAndPad(scene, video);

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
                width: mediumWidth * bezel.contentScale,
                height: mediumHeight * bezel.contentScale
            }),
            fc.pad({
                input: [generateOutputName('scaled-video', video)],
                output: [generateOutputName('padded-video', video)],
                width: mediumWidth,
                height: mediumHeight
            }),
            fc.pad({
                input: [generateOutputName('padded-video', video)],
                output: [outputName],
                width: sceneWidth,
                height: sceneHeight,
                x: mediumX,
                y: mediumY
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
            width: mediumWidth,
            height: mediumHeight
        }),
        fc.pad({
            input: [generateOutputName('scaled-video', video)],
            output: [outputName],
            width: sceneWidth,
            height: sceneHeight,
            x: mediumX,
            y: mediumY
        })
    );
}

async function loadVideos(ffmpeg: FFmpeg, scene: VideoScene, onProgressStateChange: (state: string) => void) {
    const videoInputNamesMap = new Map<Video, VideoFileInputs>();
    const inputs: Array<string> = [];
    const fileNames: Array<string> = [];
    let index = 0;

    onProgressStateChange('Loading videos');

    for (const video of scene.media) {
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

async function loadVideo(ffmpeg: FFmpeg, scene: VideoScene, video: Video, onProgressStateChange: (state: string) => void) {
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
    const { mediumWidth: videoWidth, mediumHeight: videoHeight } = getMediumRectInScene(video, scene);
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

function generateOutputName(output: string, video: Video) {
    return `${output}_${video.index}`;
}

async function removeFiles(ffmpeg: FFmpeg, fileNames: Array<string>) {
    // TODO: May this be done in parallel and not sequentially?
    for (const file of fileNames) {
        await ffmpeg.deleteFile(file);
    }
}