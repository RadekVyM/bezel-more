import { hsvaToHexa } from '@uiw/react-color'
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

    await drawSceneBackground(context, scene, 0, 0, size);

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
    context.fillStyle = hsvaToHexa(background.color);
    context.fillRect(left, top, size.width, size.height);
}

function drawLinearBackground(context: CanvasRenderingContext2D, background: LinearGradientBackground, left: number, top: number, size: Size) {
    const angle = Number.isFinite(background.angle) ? background.angle : 0;
    const w = size.width / 2;
    const h = size.height / 2;
    const a = w * Math.tan((angle / 180) * Math.PI);
    const b = h / Math.tan((angle / 180) * Math.PI);

    const x = Math.abs(Math.abs(a) > h ? b : w) * ((angle + 90) % 360 > 180 ? -1 : 1);
    const y = Math.abs(Math.abs(a) > h ? h : a) * (angle > 180 ? 1 : -1);

    const centerX = left + w;
    const centerY = top + h;
    const secondX = centerX + x;
    const secondY = centerY + y;
    const firstX = centerX - x;
    const firstY = centerY - y;

    const gradient = context.createLinearGradient(firstX, firstY, secondX, secondY);
    gradient.addColorStop(0, hsvaToHexa(background.startColor));
    gradient.addColorStop(1, hsvaToHexa(background.endColor));
    context.fillStyle = gradient;
    context.fillRect(left, top, size.width, size.height);
}

function drawRadialBackground(context: CanvasRenderingContext2D, background: RadialGradientBackground, left: number, top: number, size: Size) {
    const innerRadius = Number.isFinite(background.innerRadius) ? background.innerRadius: 0;
    const w = size.width / 2;
    const h = size.height / 2;
    const centerX = left + w;
    const centerY = top + h;
    const radius = Math.sqrt((w * w) + (h * h));
    const gradient = context.createRadialGradient(centerX, centerY, Math.min(innerRadius, 0.9999) * radius, centerX, centerY, radius);

    gradient.addColorStop(0, hsvaToHexa(background.innerColor));
    gradient.addColorStop(1, hsvaToHexa(background.outerColor));

    context.fillStyle = gradient;
    context.fillRect(left, top, size.width, size.height);
}

function drawImageBackground(context: CanvasRenderingContext2D, background: ImageBackground, left: number, top: number, size: Size) {
    if (!background.image.complete && !(background.image as any).isLoaded) {
        background.image.addEventListener('load', onLoaded);
    }
    drawImageBackgroundInner(context, background, left, top, size);

    function onLoaded() {
        drawImageBackgroundInner(context, background, left, top, size);
        background.image.removeEventListener('load', onLoaded);
    }
}

function drawImageBackgroundInner(context: CanvasRenderingContext2D, background: ImageBackground, left: number, top: number, size: Size) {
    if (background.aspectFill) {
        const scale = Math.max(size.width / background.image.naturalWidth, size.height / background.image.naturalHeight);
        const w = background.image.naturalWidth * scale;
        const h = background.image.naturalHeight * scale;
        const x = (size.width - w) / 2;
        const y = (size.height - h) / 2;
        context.drawImage(background.image, left + x, top + y, w, h);
    }
    else {
        context.drawImage(background.image, left, top, size.width, size.height);
    }

    context.save();

    context.globalCompositeOperation = 'destination-in';
    context.fillStyle = 'white';
    context.fillRect(left, top, size.width, size.height);

    context.restore();
}
