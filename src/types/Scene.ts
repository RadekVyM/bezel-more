import { SupportedFormat } from '../supportedFormats'
import { Background } from './Background'
import { SceneLayout } from './SceneLayout'
import { Video } from './Video'

export type Scene = {
    videos: Array<Video>,
    background: Background,
    startTime: number,
    endTime: number,
    formatKey: SupportedFormat,
    fps: number,
    maxColors: number,
    isPrerenderingEnabled: boolean
} & SceneLayout

export function getFirstVideo(scene: Scene): Video {
    return scene.videos[0];
}

export function getTotalSceneDuration(scene: Scene): number {
    return Math.max(scene.endTime, ...scene.videos.map((v) => v.totalDuration + v.sceneOffset));
}