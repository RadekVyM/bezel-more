import { HsvaColor } from '@uiw/react-color'
import { getBezel } from '../bezels'
import { Size } from './Size'

export type DrawableMedium = {
    index: number,
    withBezel: boolean,
    bezelKey: string,
    withShadow?: boolean,
    shadowColor: HsvaColor,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    cornerRadius: number,
    naturalDimensions?: Size,
    file: File | null | undefined,
}

export function getMediumSize(medium: DrawableMedium, requestedMaxSize: number): Size {
    if (medium.naturalDimensions && !medium.withBezel) {
        const scale = Math.max(medium.naturalDimensions.width / requestedMaxSize, medium.naturalDimensions.height / requestedMaxSize);
        return {
            width: medium.naturalDimensions.width / scale,
            height: medium.naturalDimensions.height / scale,
        };
    }

    const bezel = getBezel(medium.bezelKey);
    const scale = Math.max(bezel.width / requestedMaxSize, bezel.height / requestedMaxSize);

    return {
        width: bezel.width / scale,
        height: bezel.height / scale,
    };
}