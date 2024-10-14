import { MediumOrientation } from '../types/MediumOrientation'

export function drawRotatedImage(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number, orientation: MediumOrientation) {
    orientation = orientation || MediumOrientation.topUp;
    const vertical = isVertical(orientation);
    const width = vertical ? dw : dh;
    const height = vertical ? dh : dw;
    
    context.save();
    context.translate(dx + dw / 2, dy + dh / 2);
    context.rotate(getAngle(orientation));
    context.drawImage(image, -width / 2, -height / 2, width, height);

    context.restore();
}

function getAngle(orientation: MediumOrientation) {
    switch (orientation) {
        case MediumOrientation.topUp:
            return 0;
        case MediumOrientation.bottomUp:
            return Math.PI;
        case MediumOrientation.leftUp:
            return Math.PI / 2;
        case MediumOrientation.rightUp:
            return -Math.PI / 2;
    }
}

function isVertical(orientation: MediumOrientation) {
    return orientation === MediumOrientation.topUp || orientation === MediumOrientation.bottomUp;
}