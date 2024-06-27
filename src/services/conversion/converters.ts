import { fetchFile } from '@ffmpeg/util'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { bezelImage, bezelMask, getBezel } from '../../bezels'
import * as fc from './filterComplex'
import { supportedFormats } from '../../supportedFormats'
import { Scene, getSceneSize, getTotalSceneDuration, getVideoRectInScene } from '../../types/Scene'
import { Video } from '../../types/Video'
import { roundToEven } from '../../utils/numbers'
import { generateBackground } from '../drawing/background'
import { generateSceneMask } from '../drawing/sceneMask'

// https://gist.github.com/witmin/1edf926c2886d5c8d9b264d70baf7379

type VideoFileInputs = {
    videoInput: string,
    bezelInput?: string,
}

export async function convertScene(ffmpeg: FFmpeg, scene: Scene) {
    const fileName = `result${supportedFormats[scene.formatKey].suffix}`;
    const {
        inputs,
        backgroundInputName,
        sceneMaskInputName,
        videoInputNamesMap
    } = await loadVideos(ffmpeg, scene);
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
    );

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

    return await ffmpeg.readFile(fileName);
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

    if (video.withBezel && inputNames.bezelInput) {
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
            fc.scale({
                input: [inputNames.bezelInput],
                output: [generateOutputName('scaled-bezel', video)],
                width: videoWidth,
                height: videoHeight
            }),
            fc.overlay({
                input: [generateOutputName('padded-video', video), generateOutputName('scaled-bezel', video)],
                output: [generateOutputName('merged', video)]
            }),
            fc.pad({
                input: [generateOutputName('merged', video)],
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

async function loadVideos(ffmpeg: FFmpeg, scene: Scene) {
    const videoInputNamesMap = new Map<Video, VideoFileInputs>();
    const inputs: Array<string> = [];
    let index = 0;

    for (const video of scene.videos) {
        if (!video.file)
            throw new Error('No video file selected');
        
        const videoFile = video.file;
        const videoName = `${videoFile.name.split('.').slice(0, -1).join('.')}_${video.index}.${videoFile.name.split('.').at(-1)}`;
        const videoInput = `${index++}:v`;
        inputs.push('-i', videoName);

        await ffmpeg.writeFile(videoName, await fetchFile(videoFile));

        if (video.withBezel) {
            const bezel = getBezel(video.bezelKey);
            const bezelName = 'bezel.png';
            inputs.push('-i', bezelName);

            await ffmpeg.writeFile(bezelName, await fetchFile(bezelImage(bezel.key)));

            videoInputNamesMap.set(
                video,
                {
                    videoInput: videoInput,
                    bezelInput: `${index++}:v`
                });
        }
        else {
            videoInputNamesMap.set(video, { videoInput: videoInput });
        }
    }
    
    const background = await generateBackground(scene);
    if (!background)
        throw new Error('Background could not be generated');

    const backgroundName = 'background.png';
    const backgroundInputName = `${index++}:v`;
    inputs.push('-i', backgroundName);

    await ffmpeg.writeFile(backgroundName, await fetchFile(background));

    const sceneMask = await generateSceneMask(scene);
    if (!sceneMask)
        throw new Error('Scene mask could not be generated');

    const sceneMaskName = 'scene-mask.png';
    const sceneMaskInputName = `${index++}:v`;
    inputs.push('-i', sceneMaskName);

    await ffmpeg.writeFile(sceneMaskName, await fetchFile(sceneMask));

    return {
        inputs,
        backgroundInputName,
        sceneMaskInputName,
        videoInputNamesMap
    };
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
        '-an', '-sn','-c:v', 'libx264',
        ...(size ? ['-s', `${roundToEven(size[0])}:${roundToEven(size[1])}`] : []), // size has to be divisible by 2
        fileName
    ];
}

function generateOutputName(output: string, video: Video) {
    return `${output}_${video.index}`;
}