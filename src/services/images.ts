import { bezelImage, bezelTransparentMask, getBezel } from '../bezels'
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

    return await waitToLoad(maskImages);
}

export async function createBezelImages(scene: DrawableScene) {
    const images = scene.videos.map((video) => {
        if (!video.withBezel) {
            return null;
        }

        const bezel = getBezel(video.bezelKey);
        const imageSrc = bezelImage(bezel.key);
        const image = new Image(bezel.width, bezel.height);
        image.src = imageSrc;

        return image;
    });

    return await waitToLoad(images);
}

async function waitToLoad(images: Array<(HTMLImageElement | null)>) {
    await Promise.allSettled(images.map((m) => {
        return new Promise((resolve) => {
            if (!m || m.complete) {
                resolve(undefined);
            }
            else {
                m.onload = () => resolve(undefined);
            }
        });
    }));

    return images;
}