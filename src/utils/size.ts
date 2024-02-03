export function getBezelSize(bezel: { width: number, height: number }, size: number): [number, number] {
    const width = bezel.width <= bezel.height ? bezel.width * (size / bezel.height) : size;
    const height = bezel.width <= bezel.height ? size : bezel.height * (size / bezel.width);
    return [Math.round(width), Math.round(height)];
}