import { HsvaColor } from '@uiw/react-color'
import { getBezel } from '../bezels'
import { Size } from './Size'

export type DrawableVideo = {
    index: number,
    withBezel: boolean,
    bezelKey: string,
    withShadow?: boolean,
    shadowColor: HsvaColor,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    cornerRadius: number,
    naturalVideoDimensions?: Size,
}

export function getVideoSize(video: DrawableVideo, requestedMaxSize: number): Size {
    if (video.naturalVideoDimensions && !video.withBezel) {
        const scale = Math.max(video.naturalVideoDimensions.width / requestedMaxSize, video.naturalVideoDimensions.height / requestedMaxSize);
        return {
            width: video.naturalVideoDimensions.width / scale,
            height: video.naturalVideoDimensions.height / scale,
        };
    }

    const bezel = getBezel(video.bezelKey);
    const scale = Math.max(bezel.width / requestedMaxSize, bezel.height / requestedMaxSize);

    return {
        width: bezel.width / scale,
        height: bezel.height / scale,
    };
}