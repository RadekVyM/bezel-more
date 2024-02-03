import { SupportedFormat } from '../../supportedFormats'

export type ConversionConfig = {
    fps: number,
    scale: number,
    maxColors: number,
    size: number,
    start: number,
    end: number,
    withBezel: boolean,
    formatKey: SupportedFormat,
    bezelKey: string
}