import { SupportedFormat } from '../supportedFormats'
import { DrawableScene } from './DrawableScene'
import { Video } from './Video'

export type Scene = {
    videos: Array<Video>,
    startTime: number,
    endTime: number,
    formatKey: SupportedFormat,
    fps: number,
    maxColors: number,
    isPrerenderingEnabled: boolean
} & DrawableScene

export function getFirstVideo(scene: Scene): Video {
    return scene.videos[0];
}

export function getTotalSceneDuration(scene: Scene): number {
    return Math.max(scene.endTime, ...scene.videos.map((v) => v.totalDuration + v.sceneOffset));
}