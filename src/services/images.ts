import { bezelImage, bezelSmallImage, bezelTransparentMask, getBezel } from '../bezels'
import { BezelImages } from '../types/BezelImages';
import { DrawableScene } from '../types/DrawableScene'

export async function createMaskImages(scene: DrawableScene) {
    const maskImages = scene.media.map((video) => {
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
    const images = scene.media.map((video) => {
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

export async function createBezelImagesList(scene: DrawableScene): Promise<Array<BezelImages>> {
    const list: Array<BezelImages> = [];

    prepareBezelImages(list, scene, () => {});
    await waitToLoad(list.flatMap((bezelImages) => [bezelImages.image, bezelImages.maskImage]));

    return list;
}

export function prepareBezelImages(bezelImagesList: Array<BezelImages>, scene: DrawableScene, onLoad: () => void, small?: boolean) {
    for (const video of scene.media) {
        const bezel = getBezel(video.bezelKey);
        const currentImageSrc = small ? bezelSmallImage(bezel.key) : bezelImage(bezel.key);
        const currentMaskSrc = bezelTransparentMask(bezel.modelKey);
        const bezelImages = bezelImagesList[video.index];

        if (bezelImages) {
            bezelImages.bezel = bezel;
            bezelImages.showBezel = video.withBezel;

            if (!bezelImages.image.src.endsWith(currentImageSrc)) {
                if (bezelImages.image?.onload) {
                    bezelImages.image.onload = null;
                }
                bezelImages.image = new Image(bezel.width, bezel.height);
                bezelImages.image.src = currentImageSrc;
                bezelImages.image.onload = () => onLoad();

                if (bezelImages.maskImage?.onload) {
                    bezelImages.maskImage.onload = null;
                }
                bezelImages.maskImage = new Image(bezel.width, bezel.height);
                bezelImages.maskImage.src = currentMaskSrc;
                bezelImages.maskImage.onload = () => onLoad();
            }
            else {
                onLoad();
            }

            continue;
        }

        const image = new Image(bezel.width, bezel.height);
        image.src = currentImageSrc;
        image.onload = () => onLoad();

        const mask = new Image(bezel.width, bezel.height);
        mask.src = currentMaskSrc;
        mask.onload = () => onLoad();

        bezelImagesList[video.index] = {
            bezel,
            showBezel: video.withBezel,
            image,
            maskImage: mask,
        };

        onLoad();
    }
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