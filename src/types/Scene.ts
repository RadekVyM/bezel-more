import { SupportedFormat } from '../supportedFormats'
import { Size } from './Size'
import { Video, getVideoSize } from './Video'

export type Scene = {
    videos: Array<Video>,
    requestedSize?: Size,
    background: string,
    startTime: number,
    endTime: number,
    formatKey: SupportedFormat,
    fps: number,
    maxColors: number
}

export function getFirstVideo(scene: Scene): Video {
    return scene.videos[0];
}

export function getSceneSize(scene: Scene): Size {
    if (scene.requestedSize) {
        return scene.requestedSize;
    }

    let width = 0;
    let height = 0;

    for (const video of scene.videos) {
        const size = getVideoSize(video);

        if (!size) {
            continue;
        }

        width = Math.max(width, size.width);
        height = Math.max(height, size.height);
    }

    return { width, height };
}