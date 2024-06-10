import { Size } from '../types/Size'

export function getBezelSize(bezel: Size, size: number): Size {
    const width = bezel.width <= bezel.height ? bezel.width * (size / bezel.height) : size;
    const height = bezel.width <= bezel.height ? size : bezel.height * (size / bezel.width);
    return { width: Math.round(width), height: Math.round(height) };
}