import { Background, ImageBackground, LinearGradientBackground, RadialGradientBackground, SolidBackground } from '../../types/Background'
import { Scene, getSceneSize } from '../../types/Scene'
import { Size } from '../../types/Size'

export async function generateBackground(scene: Scene): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    drawSceneBackground(context, scene, 0, 0, size);

    return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return resolve(null);
            }

            resolve(new File([blob], 'background.png', { type: 'image/png' }));
        }, 'image/png');
    });
}

export function drawSceneBackground(context: CanvasRenderingContext2D, scene: Scene, left: number, top: number, size: Size) {
    drawBackground(context, scene.background, left, top, size);
}

export function drawBackground(context: CanvasRenderingContext2D, background: Background, left: number, top: number, size: Size) {
    switch (background.type) {
        case 'solid':
            drawSolidBackground(context, background as SolidBackground, left, top, size);
            break;
        case 'linear-gradient':
            drawLinearBackground(context, background as LinearGradientBackground, left, top, size);
            break;
        case 'radial-gradient':
            drawRadialBackground(context, background as RadialGradientBackground, left, top, size);
            break;
        case 'image':
            drawImageBackground(context, background as ImageBackground, left, top, size);
            break;
    }
}

function drawSolidBackground(context: CanvasRenderingContext2D, background: SolidBackground, left: number, top: number, size: Size) {
    context.fillStyle = background.color;
    context.fillRect(left, top, size.width, size.height);
}

function drawLinearBackground(context: CanvasRenderingContext2D, background: LinearGradientBackground, left: number, top: number, size: Size) {
    // TODO: Implement this
    context.fillStyle = background.startColor;
    context.fillRect(left, top, size.width, size.height);
}

function drawRadialBackground(context: CanvasRenderingContext2D, background: RadialGradientBackground, left: number, top: number, size: Size) {
    // TODO: Implement this
    context.fillStyle = background.innerColor;
    context.fillRect(left, top, size.width, size.height);
}

function drawImageBackground(context: CanvasRenderingContext2D, background: ImageBackground, left: number, top: number, size: Size) {
    // TODO: Implement this properly
    const image = new Image();
    image.src = background.imageUrl;
    context.drawImage(image, left, top, size.width, size.height);
}