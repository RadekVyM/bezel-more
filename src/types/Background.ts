import { HsvaColor } from '@uiw/react-color'

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
    angle: number
} & Background

export type RadialGradientBackground = {
    innerColor: HsvaColor,
    outerColor: HsvaColor,
    innerRadius: number
} & Background

export type ImageBackground = {
    imageUrl: string
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
    return {
        type: 'image',
        imageUrl
    };
}