import { hexToHsva, HsvaColor } from '@uiw/react-color'
import { Video } from './Video'
import { BEZELS } from '../bezels'
import { VideoLayout } from './VideoLayout'

export type VideoTemplate = {
    index: number,
    withShadow?: boolean,
    shadowColor: HsvaColor,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    cornerRadius: number,
} & VideoLayout

export function createVideoTemplate(video: Video): VideoTemplate {
    return {
        index: video.index,
        withBezel: video.withBezel,
        bezelKey: video.bezelKey,
        withShadow: video.withShadow,
        shadowColor: video.shadowColor,
        shadowBlur: video.shadowBlur,
        shadowOffsetX: video.shadowOffsetX,
        shadowOffsetY: video.shadowOffsetY,
        cornerRadius: video.cornerRadius,
    };
}

export function createDefaultVideoTemplate(index: number, bezelKey?: string): VideoTemplate {
    return {
        index: index,
        withBezel: true,
        bezelKey: bezelKey || BEZELS.iphone_15_black.key,
        withShadow: false,
        shadowColor: hexToHsva('#000000ff'),
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        cornerRadius: 0,
    };
}