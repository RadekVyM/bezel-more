import { HsvaColor } from '@uiw/react-color'
import { getBezel, getBezelSize } from '../bezels'
import { Size } from './Size'
import { MediumOrientation } from './MediumOrientation'

export type DrawableMedium = {
    index: number,
    withBezel: boolean,
    bezelKey: string,
    orientation: MediumOrientation,
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

    const bezelSize = getBezelSize(medium.bezelKey, medium.orientation || MediumOrientation.topUp);
    const scale = Math.max(bezelSize[0] / requestedMaxSize, bezelSize[1] / requestedMaxSize);

    return {
        width: bezelSize[0] / scale,
        height: bezelSize[1] / scale,
    };
}