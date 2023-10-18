export function getBezelSize(bezel, size) {
    const width = bezel.width <= bezel.height ? bezel.width * (size / bezel.height) : size;
    const height = bezel.width <= bezel.height ? size : bezel.height * (size / bezel.width);
    return [Math.round(width), Math.round(height)];
}