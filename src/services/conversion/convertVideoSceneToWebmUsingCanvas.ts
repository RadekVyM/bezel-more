import { supportedVideoFormats } from '../../supportedFormats'
import { VideoScene } from '../../types/VideoScene'
import { getMediumRectInScene, getSceneSize } from '../../types/DrawableScene'
import { createBezelImagesList } from '../images'
import { Video } from '../../types/Video'
import { BezelImages } from '../../types/BezelImages'
import { Size } from '../../types/Size'
import { drawMedia } from '../drawing/media'
import { drawSceneBackground } from '../drawing/background'
import { ArrayBufferTarget, Muxer } from 'webm-muxer'
import { roundToEven } from '../../utils/numbers'
import { ConversionProgress } from '../../types/ConversionProgress'

export async function convertVideoSceneToWebmUsingCanvas(scene: VideoScene, onProgressChange: React.Dispatch<Partial<ConversionProgress>>) {
    onProgressChange({ state: 'Loading assets' });
    const { clonedScene, bezelImages } = await loadAssets(scene);

    return await renderVideo(clonedScene, bezelImages, onProgressChange);
}

async function renderVideo(scene: VideoScene, bezelImages: Array<BezelImages>, onProgressChange: React.Dispatch<Partial<ConversionProgress>>) {
    const fileName = `result${supportedVideoFormats[scene.formatKey].suffix}`;

    if (!('VideoEncoder' in window)) {
        throw new Error('VideoEncoder is not supported');
    }

    const { width: sceneWidth, height: sceneHeight } = getSceneSize(scene);
    const width = roundToEven(sceneWidth);
    const height = roundToEven(sceneHeight);
    const framerate = scene.fps;
    const totalLength = scene.endTime - scene.startTime;
    const framesCount = Math.ceil(totalLength * framerate);
    const config: VideoEncoderConfig = {
        codec: 'vp09.00.10.08', // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter#vp9
        width: width,
        height: height,
        displayWidth: width,
        displayHeight: height,
        bitrate: 1e6,
        framerate: framerate,
        // TODO: Alpha is not supported even though the API is already prepared for that: https://github.com/w3c/webcodecs/issues/672
        // alpha: 'keep' // https://github.com/w3c/webcodecs/issues/207
    };

    if (!await VideoEncoder.isConfigSupported(config)) {
        throw new Error('This configuration is not supported');
    }

    const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
            codec: 'V_VP9',
            width: width,
            height: height,
            //alpha: true
        }
    });
    
    const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e: any) => console.log(e),
    });
    encoder.configure(config);

    let previousTime = new Date().getTime();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const offscreenCanvas = canvas.transferControlToOffscreen();

    for (let i = 0; i < framesCount; i++) {
        const context = offscreenCanvas.getContext('2d')!;
        context.clearRect(0, 0, width, height);

        const timestampSeconds = i * (1 / framerate);
        const timestampMicroseconds = timestampSeconds * 1000000;

        const now = new Date().getTime();
        const speed = (1 / framerate) / ((now - previousTime) / 1000);
        previousTime = now;

        onProgressChange({
            state: 'Rendering scene',
            frame: `${i}`,
            progress: i / framesCount,
            speed: `${speed.toFixed(3)}x`
        });

        await seekVideos(scene, timestampSeconds);
        drawScene(context, scene, bezelImages, { width, height });

        const frameFromCanvas = new VideoFrame(offscreenCanvas, {
            timestamp: timestampMicroseconds,
            // alpha: 'keep'
        });

        const keyFrame = i % 30 === 0;
        encoder.encode(frameFromCanvas, { keyFrame });
        frameFromCanvas.close();
    }

    onProgressChange({ state: 'Encoding and muxing' });

    await encoder.flush();
    muxer.finalize();

    const { buffer } = muxer.target;

    encoder.close();

    return new File([
        buffer
    ], fileName, { type: 'video/webm' });
}

async function seekVideos(scene: VideoScene, timestamp: number) {
    await Promise.all(scene.media.map((video) => new Promise((resolve) => {
        const offsetCurrentTime = timestamp - video.sceneOffset;
        const newCurrentTime = offsetCurrentTime < video.startTime ?
            video.startTime :
            (offsetCurrentTime > video.endTime ?
                video.endTime : 
                offsetCurrentTime);

        video.htmlVideo.currentTime = newCurrentTime;
        video.htmlVideo.pause();
        video.htmlVideo.addEventListener('seeked', () => resolve(undefined), { once: true });
    })));
}

function drawScene(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, scene: VideoScene, bezelImages: Array<BezelImages>, size: Size) {
    const sceneSize = getSceneSize(scene);
    const scale = Math.min(size.width / sceneSize.width, size.height / sceneSize.height);

    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, size.width, size.height);

    drawMedia(context, scene, bezelImages, 0, 0, size.width, size.height, scale, (context, medium, left, top, width, height) => {
        const video = scene.media[medium.index];

        if (!video) {
            throw new Error('Video is lost');
        }

        context.drawImage(video.htmlVideo, left, top, width, height);
    });

    context.globalCompositeOperation ='destination-over';
    drawSceneBackground(context, scene, 0, 0, size, true, bezelImages.map((bi) => bi.maskImage));
}

async function loadAssets(scene: VideoScene) {
    const bezelImages = await createBezelImagesList(scene);
    const videos: Array<Video> = await Promise.all(scene.media.map((video) => createVideo(video, scene)));
    const clonedScene: VideoScene = {
        ...scene,
        media: videos
    };

    return {
        clonedScene,
        bezelImages
    };
}

function createVideo(video: Video, scene: VideoScene): Promise<Video> {
    if (!video.file) {
        throw new Error('Video file is missing');
    }
    
    const { mediumWidth, mediumHeight } = getMediumRectInScene(video, scene);
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(video.file);
    videoElement.width = mediumWidth;
    videoElement.height = mediumHeight;

    videoElement.load();

    return new Promise((resolve) => videoElement.onloadedmetadata = () => {
        videoElement.onloadedmetadata = null;
        resolve({
            ...video,
            htmlVideo: videoElement
        });
    });
}