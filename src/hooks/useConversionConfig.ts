import { useReducer } from 'react'
import { supportedFormats } from '../supportedFormats'
import { BEZELS } from '../bezels'
import { ConversionConfig } from '../services/video/ConversionConfig'

export default function useConversionConfig() {
    return useReducer(
        (state: ConversionConfig, newState: Partial<ConversionConfig>) => ({
            ...state,
            ...newState,
        }),
        {
            fps: 20,
            scale: 480,
            maxColors: 255,
            size: 480,
            start: 0,
            end: 10,
            withBezel: true,
            formatKey: supportedFormats.webp.key,
            bezelKey: BEZELS.iphone_15_black.key
        }
    );
}