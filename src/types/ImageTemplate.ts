import { Image } from './Image'
import { DrawableMedium } from './DrawableMedium'
import { createDefaultMediumTemplate, createMediumTemplate } from './MediumTemplate'

export type ImageTemplate = {
    mediumType: 'image',
} & DrawableMedium

export function createImageTemplate(image: Image): ImageTemplate {
    return {
        mediumType: 'image',
        ...createMediumTemplate(image)
    };
}

export function createDefaultImageTemplate(index: number, bezelKey?: string): ImageTemplate {
    return {
        mediumType: 'image',
        ...createDefaultMediumTemplate(index, bezelKey)
    };
}