import { DrawableScene, getSceneSize, getMediumRectInScene } from '../../types/DrawableScene'
import { VideoScene } from '../../types/VideoScene'
import { drawRotatedImage } from '../../utils/canvas';
import { createBezelImages } from '../images'

export async function generateBezelsImage(scene: VideoScene): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas context not found');
    }

    if (Number.isFinite(size.width) && Number.isFinite(size.height) && size.width !== 0 && size.height !== 0) {
        const bezelImages = await createBezelImages(scene);
        drawBezelsImage(context, scene, bezelImages);
    }

    return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return resolve(null);
            }

            resolve(new File([blob], 'bezels-image.png', { type: 'image/png' }));
        }, 'image/png');
    });
}

function drawBezelsImage(context: CanvasRenderingContext2D, scene: DrawableScene, bezelImages: Array<HTMLImageElement | null>) {
    for (let i = 0; i < scene.media.length; i++) {
        const image = bezelImages[i];
        const medium = scene.media[i];

        if (!image || !medium.withBezel) {
            continue;
        }

        const { mediumWidth, mediumHeight, mediumX, mediumY } = getMediumRectInScene(medium, scene);

        drawRotatedImage(context, image, mediumX, mediumY, mediumWidth, mediumHeight, medium.orientation);
    }
}