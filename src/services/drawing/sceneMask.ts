import { bezelMask, getBezel } from '../../bezels';
import { Scene, getSceneSize, getVideoRectInScene } from '../../types/Scene'
import { Size } from '../../types/Size'

export async function generateSceneMask(scene: Scene): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
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
    context.fillStyle = 'black';
    context.fillRect(0, 0, size.width, size.height);

    for (const video of scene.videos) {
        const { videoWidth, videoHeight, videoX, videoY } = getVideoRectInScene(video, scene);

        context.save();

        if (video.withBezel) {
            const bezel = getBezel(video.bezelKey);
            const maskSrc = bezelMask(bezel.modelKey);
            const maskImage = new Image(bezel.width, bezel.height);

            maskImage.src = maskSrc;
            await new Promise((resolve) => maskImage.onload = () => resolve(undefined));

            context.drawImage(maskImage, videoX, videoY, videoWidth, videoHeight);
        }
        else {
            context.fillStyle = 'white';
            context.fillRect(videoX, videoY, videoWidth, videoHeight);
        }

        context.restore();
    }
}
