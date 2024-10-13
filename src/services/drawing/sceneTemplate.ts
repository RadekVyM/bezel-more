import { getBezelSize } from '../../bezels'
import { BezelImages } from '../../types/BezelImages'
import { getSceneSize } from '../../types/DrawableScene'
import { DrawableMedium } from '../../types/DrawableMedium'
import { SceneTemplate } from '../../types/SceneTemplate'
import { Size } from '../../types/Size'
import { drawSceneBackground } from './background'
import { drawMedia } from './media'
import { MediumTemplate } from '../../types/MediumTemplate'

export async function drawSceneTemplate(context: CanvasRenderingContext2D, sceneTemplate: SceneTemplate, bezelImages: Array<BezelImages>, size: Size) {
    const clonedSceneTemplate = cloneSceneTemplateWithNaturalDimensions(sceneTemplate);
    const sceneSize = getSceneSize(clonedSceneTemplate);
    const scale = Math.min(size.width / sceneSize.width, size.height / sceneSize.height);
    const sceneWidth = sceneSize.width * scale;
    const sceneHeight = sceneSize.height * scale;
    const left = (size.width - sceneWidth) / 2;
    const top = (size.height - sceneHeight) / 2;

    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, size.width, size.height);

    drawMedia(context, clonedSceneTemplate, bezelImages, left, top, sceneWidth, sceneHeight, scale, drawVideo);

    context.globalCompositeOperation ='destination-over';
    drawSceneBackground(context, clonedSceneTemplate, left, top, { width: sceneWidth, height: sceneHeight }, true, bezelImages.map((bi) => bi.maskImage));
}

function drawVideo(context: CanvasRenderingContext2D, medium: DrawableMedium, left: number, top: number, width: number, height: number) {
    const computedStyle = getComputedStyle(context.canvas);
    const primaryColor = computedStyle.getPropertyValue('--primary');
    const secondaryColor = computedStyle.getPropertyValue('--secondary');

    const gradient = context.createLinearGradient(left, top, left, height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    context.fillStyle = gradient;
    context.fillRect(left, top, width, height);
}

function cloneSceneTemplateWithNaturalDimensions(sceneTemplate: SceneTemplate) {
    return {
        ...sceneTemplate,
        media: sceneTemplate.media.map((medium): MediumTemplate => {
            const bezelSize = getBezelSize(medium.bezelKey, medium.orientation);
            
            return {
                ...medium,
                naturalDimensions: { width: bezelSize[0], height: bezelSize[1] }
            };
        })
    };
}