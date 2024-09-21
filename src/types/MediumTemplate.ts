import { hexToHsva } from '@uiw/react-color'
import { BEZELS } from '../bezels'
import { DrawableMedium } from './DrawableMedium'
import { MediumOrientation } from './MediumOrientation';

export type MediumTemplate = {
} & DrawableMedium

export function createMediumTemplate(medium: DrawableMedium): MediumTemplate {
    return {
        index: medium.index,
        withBezel: medium.withBezel,
        bezelKey: medium.bezelKey,
        orientation: medium.orientation,
        withShadow: medium.withShadow,
        shadowColor: medium.shadowColor,
        shadowBlur: medium.shadowBlur,
        shadowOffsetX: medium.shadowOffsetX,
        shadowOffsetY: medium.shadowOffsetY,
        cornerRadius: medium.cornerRadius,
        file: null,
    };
}

export function createDefaultMediumTemplate(index: number, bezelKey?: string): MediumTemplate {
    return {
        index: index,
        withBezel: true,
        bezelKey: bezelKey || BEZELS.iphone_15_black.key,
        orientation: MediumOrientation.topUp,
        withShadow: false,
        shadowColor: hexToHsva('#000000ff'),
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        cornerRadius: 0,
        file: null,
    };
}