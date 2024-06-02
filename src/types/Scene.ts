import { SupportedFormat } from '../supportedFormats'
import { Size } from './Size'
import { Video } from './Video'

export type Scene = {
    videos: Array<Video>,
    requestedSize?: Size,
    background: string,
    startTime: number,
    endTime: number,
    formatKey: SupportedFormat,
    fps: number,
    maxColors: number,
    readonly firstVideo?: Video
    readonly size: Size
}