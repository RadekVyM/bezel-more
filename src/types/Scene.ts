import { SupportedFormat } from '../supportedFormats'
import { Size } from './Size'
import { Video, getVideoSize } from './Video'

export type Scene = {
    videos: Array<Video>,
    requestedSize?: Size,
    requestedMaxSize: number,
    horizontalPadding: number,
    verticalPadding: number,
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

export function getTotalSceneDuration(scene: Scene): number {
    return Math.max(scene.endTime, ...scene.videos.map((v) => v.totalDuration + v.sceneOffset));
}

export function getSceneSize(scene: Scene): Size {
    if (scene.requestedSize) {
        return { width: Math.round(scene.requestedSize.width), height: Math.round(scene.requestedSize.height) };
    }

    let width = 0;
    let height = 0;

    for (const video of scene.videos) {
        const size = getVideoSize(video, Math.max(0, scene.requestedMaxSize - scene.horizontalPadding, scene.requestedMaxSize - scene.verticalPadding));

        if (!size) {
            continue;
        }

        const w = size.width;
        const h = size.height;
        const scale = Math.max(1, w / Math.max(1, scene.requestedMaxSize - scene.horizontalPadding), h / Math.max(1, scene.requestedMaxSize - scene.verticalPadding));
        width = Math.max(width, (w / scale) + scene.horizontalPadding);
        height = Math.max(height, (h / scale) + scene.verticalPadding);
    }

    return { width: Math.round(width), height: Math.round(height) };
}

export function getVideoSizeInScene(video: Video, scene: Scene) {
    const sceneSize = getSceneSize(scene);
    const videoSize = getVideoSize(video, scene.requestedMaxSize);
    if (!videoSize)
        throw new Error('Video size could not be loaded');
    const maxVideoWidth = sceneSize.width - scene.horizontalPadding;
    const maxVideoHeight = sceneSize.height - scene.verticalPadding;
    const scale = Math.max(videoSize.width / maxVideoWidth, videoSize.height / maxVideoHeight);
    const videoWidth = Math.round(videoSize.width / scale);
    const videoHeight = Math.round(videoSize.height / scale);

    return { videoWidth: Math.max(1, videoWidth), videoHeight: Math.max(1, videoHeight) };
}

export function getMaxPadding(scene: Scene) {
    return Math.round(scene.requestedMaxSize * 0.95);;
}