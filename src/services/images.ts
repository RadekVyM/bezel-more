import { bezelTransparentMask, getBezel } from '../bezels'
import { DrawableScene } from '../types/DrawableScene'

export async function createMaskImages(scene: DrawableScene) {
    const maskImages = scene.videos.map((video) => {
        if (!video.withShadow || !video.withBezel) {
            return null;
        }

        const bezel = getBezel(video.bezelKey);
        const maskSrc = bezelTransparentMask(bezel.modelKey);
        const maskImage = new Image(bezel.width, bezel.height);
        maskImage.src = maskSrc;

        return maskImage;
    });

    await Promise.allSettled(maskImages.map((m) => {
        return new Promise((resolve) => {
            if (!m || m.complete) {
                resolve(undefined);
            }
            else {
                m.onload = () => resolve(undefined);
            }
        })
    }));

    return maskImages;
}