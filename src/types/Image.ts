import { hexToHsva } from '@uiw/react-color'
import { BEZELS } from '../bezels'
import { DrawableMedium } from './DrawableMedium'
import { ImageTemplate } from './ImageTemplate'
import { MediumOrientation } from './MediumOrientation'

export type Image = {
    mediumType: 'image',
    readonly htmlImage: HTMLImageElement,
} & DrawableMedium

export function createImage(index: number, template?: ImageTemplate): Image {
    const htmlImage = document.createElement('img');
    htmlImage.style.display = 'none';
    
    return {
        mediumType: 'image',
        index,
        file: undefined,
        withBezel: template ? template.withBezel : true,
        bezelKey: template?.bezelKey || BEZELS.iphone_15_black.key,
        orientation: template?.orientation || MediumOrientation.topUp,
        htmlImage,
        withShadow: template ? template.withShadow : true,
        shadowBlur: template?.shadowBlur || 0,
        shadowOffsetX: template?.shadowOffsetX || 0,
        shadowOffsetY: template?.shadowOffsetY || 0,
        cornerRadius: template?.cornerRadius || 0,
        shadowColor: template?.shadowColor || hexToHsva('#000000ff')
    };
}