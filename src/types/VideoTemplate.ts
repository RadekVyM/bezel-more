import { Video } from './Video'
import { DrawableMedium } from './DrawableMedium'
import { createDefaultMediumTemplate, createMediumTemplate } from './MediumTemplate'

export type VideoTemplate = {
    mediumType: 'video'
} & DrawableMedium

export function createVideoTemplate(video: Video): VideoTemplate {
    return {
        mediumType: 'video',
        ...createMediumTemplate(video)
    };
}

export function createDefaultVideoTemplate(index: number, bezelKey?: string): VideoTemplate {
    return {
        mediumType: 'video',
        ...createDefaultMediumTemplate(index, bezelKey)
    };
}