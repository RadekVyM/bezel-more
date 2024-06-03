import { BEZELS, getBezel } from '../bezels'
import { Point } from './Point'
import { Size } from './Size'

export type Video = {
    /** Offset from the start of a scene. */
    index: number,
    sceneOffset: number,
    startTime: number,
    endTime: number,
    requestedMaxSize: number,
    position: Point,
    withBezel: boolean,
    bezelKey: string,
    file: File | null | undefined,
    totalDuration: number,
    naturalVideoDimensions?: Size,
    readonly htmlVideo: HTMLVideoElement,
}

export function createVideo(index: number, file?: File): Video {
    const htmlVideo = document.createElement('video');
    if (file) {
        htmlVideo.src = URL.createObjectURL(file);
    }
    htmlVideo.disablePictureInPicture = true;
    htmlVideo.disableRemotePlayback = true;
    htmlVideo.muted = true;
    htmlVideo.playsInline = true;
    htmlVideo.preload = 'auto';
    htmlVideo.style.display = 'none';
    
    return {
        index,
        file,
        sceneOffset: 0,
        startTime: 0,
        endTime: 0,
        totalDuration: 0,
        position: { x: 0, y: 0 },
        withBezel: true,
        bezelKey: BEZELS.iphone_15_black.key,
        requestedMaxSize: 480,
        htmlVideo
    };
}

export function getVideoSize(video: Video): Size | undefined {
    if (video.naturalVideoDimensions && !video.withBezel) {
        const scale = Math.max(video.naturalVideoDimensions.width / video.requestedMaxSize, video.naturalVideoDimensions.height / video.requestedMaxSize);
        return {
            width: video.naturalVideoDimensions.width / scale,
            height: video.naturalVideoDimensions.height / scale,
        };
    }
    if (video.withBezel) {
        const bezel = getBezel(video.bezelKey);
        const scale = Math.max(bezel.width / video.requestedMaxSize, bezel.height / video.requestedMaxSize);
        return {
            width: bezel.width / scale,
            height: bezel.height / scale,
        };
    }

    return undefined;
}