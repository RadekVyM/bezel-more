import { Scene, getSceneSize } from '../../types/Scene'
import { Size } from '../../types/Size';

export async function generateBackground(scene: Scene): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    renderBackground(context, scene, size);

    return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return resolve(null);
            }

            resolve(new File([blob], 'background.png', { type: 'image/png' }));
        }, 'image/png');
    });
}

function renderBackground(context: CanvasRenderingContext2D, scene: Scene, size: Size) {
    context.fillStyle = scene.background;
    context.fillRect(0, 0, size.width, size.height);
}