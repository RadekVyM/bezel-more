import { DrawableScene, getSceneSize, getVideoRectInScene } from '../../types/DrawableScene'
import { Scene } from '../../types/Scene'
import { createBezelImages } from '../images'

export async function generateBezelsImage(scene: Scene): Promise<File | null> {
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
    for (let i = 0; i < scene.videos.length; i++) {
        const image = bezelImages[i];
        const video = scene.videos[i];

        if (!image || !video.withBezel) {
            continue;
        }

        const { videoWidth, videoHeight, videoX, videoY } = getVideoRectInScene(video, scene);

        context.drawImage(image, videoX, videoY, videoWidth, videoHeight);
    }
}