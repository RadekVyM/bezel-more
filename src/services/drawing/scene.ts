import { getSceneSize } from '../../types/DrawableScene'
import { Medium } from '../../types/Medium'
import { Scene } from '../../types/Scene'
import { createBezelImagesList } from '../images'
import { drawSceneBackground } from './background'
import { drawMedia } from './media'

export async function generateScene(scene: Scene, imageTitle: string, imageType: string): Promise<File | null> {
    const canvas = document.createElement('canvas');
    const size = getSceneSize(scene);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Canvas context could not be loaded'); 
    }

    const bezelImages = await createBezelImagesList(scene);

    context.globalCompositeOperation = 'source-over';
    drawMedia(context, scene, bezelImages, 0, 0, size.width, size.height, 1,
        (context, drawableMedium, x, y, width, height) => {
            const medium = drawableMedium as Medium;
            
            if (medium.mediumType === 'video') {
                context.drawImage(medium.htmlVideo, x, y, width, height);
            }
            else if (medium.mediumType === 'image') {
                context.drawImage(medium.htmlImage, x, y, width, height);
            }
        });

    context.globalCompositeOperation ='destination-over';
    drawSceneBackground(context, scene, 0, 0, size, true, bezelImages.map((bi) => bi.maskImage));

    return new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                return resolve(null);
            }

            resolve(new File([blob], imageTitle, { type: imageType }));
        }, imageType);
    });
}