import { Bezel } from './Bezel'
import { Point } from './Point'
import { Size } from './Size'

export type Video = {
    /** Offset from the start of a scene. */
    index: number,
    sceneOffset: number,
    startTime: number,
    endTime: number,
    requestedMaxSize?: number,
    position: Point,
    bezel: Bezel | null | undefined,
    file: File | null | undefined,
    htmlVideo: HTMLVideoElement | undefined,
}

export function createVideo(index: number, file: File): Video {
    const htmlVideo = document.createElement('video');
    htmlVideo.src = URL.createObjectURL(file);
    htmlVideo.disablePictureInPicture = true;
    htmlVideo.disableRemotePlayback = true;
    htmlVideo.muted = true;
    htmlVideo.playsInline = true;
    htmlVideo.preload = 'metadata';
    htmlVideo.style.display = 'none';
    
    return {
        index,
        file,
        sceneOffset: 0,
        startTime: 0,
        endTime: 0,
        position: { x: 0, y: 0 },
        bezel: undefined,
        htmlVideo
    };
}

export function videoSize(video: Video): Size | undefined {
    if (!video.htmlVideo) {
        return undefined;
    }
}