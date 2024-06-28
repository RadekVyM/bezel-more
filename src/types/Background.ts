import { HsvaColor, equalHex, hsvaToHexa } from '@uiw/react-color'

export type BackgroundType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image'

export type Background = {
    type: BackgroundType
}

export type SolidBackground = {
    color: HsvaColor
} & Background

export type LinearGradientBackground = {
    startColor: HsvaColor,
    endColor: HsvaColor,
    /** Gradient angle in degrees. */
    angle: number
} & Background

export type RadialGradientBackground = {
    innerColor: HsvaColor,
    outerColor: HsvaColor,
    /** Radius of the inner circle relative to the outer circle - from 0 to 1. */
    innerRadius: number
} & Background

export type ImageBackground = {
    image: HTMLImageElement
} & Background

export function createSolidBackground(color: HsvaColor): SolidBackground {
    return {
        type: 'solid',
        color
    };
}

export function createLinearGradientBackground(startColor: HsvaColor, endColor: HsvaColor, angle: number): LinearGradientBackground {
    return {
        type: 'linear-gradient',
        startColor,
        endColor,
        angle
    };
}

export function createRadialGradientBackground(innerColor: HsvaColor, outerColor: HsvaColor, innerRadius: number): RadialGradientBackground {
    return {
        type: 'radial-gradient',
        innerColor,
        outerColor,
        innerRadius
    };
}

export function createImageBackground(imageUrl: string): ImageBackground {
    const image = new Image();
    image.src = imageUrl;

    return {
        type: 'image',
        image: image
    };
}

export function solidBackgroundsEqual(first: SolidBackground, second: SolidBackground) {
    return equalHex(hsvaToHexa(first.color), hsvaToHexa(second.color));
}

export function linearGradientBackgroundsEqual(first: LinearGradientBackground, second: LinearGradientBackground) {
    return equalHex(hsvaToHexa(first.startColor), hsvaToHexa(second.startColor)) &&
        equalHex(hsvaToHexa(first.endColor), hsvaToHexa(second.endColor)) &&
        first.angle === second.angle;
}

export function radialGradientBackgroundsEqual(first: RadialGradientBackground, second: RadialGradientBackground) {
    return equalHex(hsvaToHexa(first.innerColor), hsvaToHexa(second.innerColor)) &&
        equalHex(hsvaToHexa(first.outerColor), hsvaToHexa(second.outerColor)) &&
        first.innerRadius === second.innerRadius;
}