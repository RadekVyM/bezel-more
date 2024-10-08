import { bezelMask, getBezel, getBezelSize } from '../../bezels'
import { VideoScene } from '../../types/VideoScene'
import { getSceneSize, getMediumRectInScene } from '../../types/DrawableScene'
import { Size } from '../../types/Size'
import { drawRotatedImage } from '../../utils/canvas';

export async function generateSceneMask(scene: VideoScene): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas context not found');
    }

    await drawSceneMask(context, scene, size);

    return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return resolve(null);
            }

            resolve(new File([blob], 'scene-mask.png', { type: 'image/png' }));
        }, 'image/png');
    });
}

async function drawSceneMask(context: CanvasRenderingContext2D, scene: VideoScene, size: Size) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size.width;
    tempCanvas.height = size.height;
    const tempContext = tempCanvas.getContext('2d');

    if (!tempContext) {
        throw new Error('Canvas context not found');
    }

    context.fillStyle = 'black';
    context.fillRect(0, 0, size.width, size.height);
    tempContext.fillStyle = 'black';
    tempContext.fillRect(0, 0, size.width, size.height);

    for (const medium of scene.media) {
        const { mediumWidth, mediumHeight, mediumX, mediumY } = getMediumRectInScene(medium, scene);

        context.save();

        if (medium.withBezel) {
            // Corners of a video are sometimes visible outside the bezel - clipping is not perfect
            // Scaling the mask down tries to mitigate that a bit
            const maskScale = 0.999;
            const bezel = getBezel(medium.bezelKey);
            const bezelSize = getBezelSize(medium.bezelKey, medium.orientation);
            const maskSrc = bezelMask(bezel.modelKey);
            const maskImage = new Image(bezelSize[0], bezelSize[1]);
            const maskWidth = mediumWidth * maskScale;
            const maskHeight = mediumHeight * maskScale;

            maskImage.src = maskSrc;
            if (!maskImage.complete) {
                await new Promise((resolve) => maskImage.onload = () => resolve(undefined));
            }

            drawRotatedImage(context, maskImage, mediumX + ((mediumWidth - maskWidth) / 2), mediumY + ((maskHeight - maskHeight) / 2), maskWidth, maskHeight, medium.orientation);
        }
        else {
            context.fillStyle = 'white';
            context.fillRect(mediumX, mediumY, mediumWidth, mediumHeight);
        }

        tempContext.fillStyle = 'white';
        tempContext.beginPath();
        tempContext.roundRect(mediumX, mediumY, mediumWidth, mediumHeight, Math.min(medium.cornerRadius, mediumWidth / 2, mediumHeight / 2));
        tempContext.fill();
        
        context.restore();
    }

    context.save();
    context.globalCompositeOperation = 'multiply';
    context.drawImage(tempCanvas, 0, 0);
    context.restore();
}