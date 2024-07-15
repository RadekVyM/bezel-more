import { hexToHsva } from '@uiw/react-color'
import { BEZELS } from '../bezels'
import { VideoTemplate } from './VideoTemplate'
import { DrawableVideo } from './DrawableVideo'

export type Video = {
    /** Offset from the start of a scene. */
    sceneOffset: number,
    startTime: number,
    endTime: number,
    file: File | null | undefined,
    totalDuration: number,
    readonly htmlVideo: HTMLVideoElement,
} & DrawableVideo

export function createVideo(index: number, template?: VideoTemplate): Video {
    const htmlVideo = document.createElement('video');
    htmlVideo.disablePictureInPicture = true;
    htmlVideo.disableRemotePlayback = true;
    htmlVideo.muted = true;
    htmlVideo.playsInline = true;
    htmlVideo.preload = 'auto';
    htmlVideo.style.display = 'none';
    
    return {
        index,
        file: undefined,
        sceneOffset: 0,
        startTime: 0,
        endTime: 0,
        totalDuration: 0,
        withBezel: template ? template.withBezel : true,
        bezelKey: template?.bezelKey || BEZELS.iphone_15_black.key,
        htmlVideo,
        withShadow: template ? template.withShadow : true,
        shadowBlur: template?.shadowBlur || 0,
        shadowOffsetX: template?.shadowOffsetX || 0,
        shadowOffsetY: template?.shadowOffsetY || 0,
        cornerRadius: template?.cornerRadius || 0,
        shadowColor: template?.shadowColor || hexToHsva('#000000ff')
    };
}