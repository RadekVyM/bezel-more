import { bezelMask, getBezel } from '../../bezels'
import { Scene } from '../../types/Scene'
import { getSceneSize, getVideoRectInScene } from '../../types/SceneLayout'
import { Size } from '../../types/Size'

export async function generateSceneMask(scene: Scene): Promise<File | null> {
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

async function drawSceneMask(context: CanvasRenderingContext2D, scene: Scene, size: Size) {
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

    for (const video of scene.videos) {
        const { videoWidth, videoHeight, videoX, videoY } = getVideoRectInScene(video, scene);

        context.save();

        if (video.withBezel) {
            // Corners of a video are sometimes visible outside the bezel - clipping is not perfect
            // Scaling the mask down tries to mitigate that a bit
            const maskScale = 0.999;
            const bezel = getBezel(video.bezelKey);
            const maskSrc = bezelMask(bezel.modelKey);
            const maskImage = new Image(bezel.width, bezel.height);
            const maskWidth = videoWidth * maskScale;
            const maskHeight = videoHeight * maskScale;

            maskImage.src = maskSrc;
            if (!maskImage.complete) {
                await new Promise((resolve) => maskImage.onload = () => resolve(undefined));
            }

            context.drawImage(maskImage, videoX + ((videoWidth - maskWidth) / 2), videoY + ((maskHeight - maskHeight) / 2), maskWidth, maskHeight);
        }
        else {
            context.fillStyle = 'white';
            context.fillRect(videoX, videoY, videoWidth, videoHeight);
        }

        tempContext.fillStyle = 'white';
        tempContext.beginPath();
        tempContext.roundRect(videoX, videoY, videoWidth, videoHeight, Math.min(video.cornerRadius, videoWidth / 2, videoHeight / 2));
        tempContext.fill();
        
        context.restore();
    }

    context.save();
    context.globalCompositeOperation = 'multiply';
    context.drawImage(tempCanvas, 0, 0);
    context.restore();
}