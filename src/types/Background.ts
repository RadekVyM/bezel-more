export type BackgroundType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image'

export type Background = {
    type: BackgroundType
}

export type SolidBackground = {
    color: string
} & Background

export type LinearGradientBackground = {
    startColor: string,
    endColor: string,
    angle: number
} & Background

export type RadialGradientBackground = {
    innerColor: string,
    outerColor: string,
    innerRadius: number
} & Background

export type ImageBackground = {
    imageUrl: string
} & Background

export function createSolidBackground(color: string): SolidBackground {
    return {
        type: 'solid',
        color
    };
}

export function createLinearGradientBackground(startColor: string, endColor: string, angle: number): LinearGradientBackground {
    return {
        type: 'solid',
        startColor,
        endColor,
        angle
    };
}

export function createRadialGradientBackground(innerColor: string, outerColor: string, innerRadius: number): RadialGradientBackground {
    return {
        type: 'solid',
        innerColor,
        outerColor,
        innerRadius
    };
}

export function createImageBackground(imageUrl: string): ImageBackground {
    return {
        type: 'solid',
        imageUrl
    };
}