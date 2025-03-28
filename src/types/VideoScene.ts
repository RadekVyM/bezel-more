import { SupportedVideoFormat } from '../supportedFormats'
import { DrawableScene } from './DrawableScene'
import { Video } from './Video'

export type VideoScene = {
    sceneType: 'video',
    media: Array<Video>,
    startTime: number,
    endTime: number,
    formatKey: SupportedVideoFormat,
    fps: number,
    maxColors: number,
    isPrerenderingEnabled: boolean,
    useCanvas?: boolean,
    useUnpkg?: boolean,
} & DrawableScene

export function getFirstVideo(scene: VideoScene): Video {
    return scene.media[0];
}

/**
 * @param scene 
 * @returns Total duration of the scene in seconds
 */
export function getTotalSceneDuration(scene: VideoScene): number {
    return Math.max(scene.endTime, ...scene.media.map((v) => v.totalDuration + v.sceneOffset));
}