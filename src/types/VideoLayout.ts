import { getBezel } from '../bezels'
import { Size } from './Size'

export type VideoLayout = {
    withBezel: boolean,
    bezelKey: string,
    naturalVideoDimensions?: Size,
}

export function getVideoSize(video: VideoLayout, requestedMaxSize: number): Size | undefined {
    if (video.naturalVideoDimensions && !video.withBezel) {
        const scale = Math.max(video.naturalVideoDimensions.width / requestedMaxSize, video.naturalVideoDimensions.height / requestedMaxSize);
        return {
            width: video.naturalVideoDimensions.width / scale,
            height: video.naturalVideoDimensions.height / scale,
        };
    }
    if (video.withBezel) {
        const bezel = getBezel(video.bezelKey);
        const scale = Math.max(bezel.width / requestedMaxSize, bezel.height / requestedMaxSize);
        return {
            width: bezel.width / scale,
            height: bezel.height / scale,
        };
    }

    return undefined;
}