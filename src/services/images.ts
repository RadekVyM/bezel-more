import { bezelImage, bezelSmallImage, bezelTransparentMask, getBezel, getBezelSize } from '../bezels'
import { BezelImages } from '../types/BezelImages'
import { DrawableScene } from '../types/DrawableScene'

export async function createMaskImages(scene: DrawableScene) {
    const maskImages = scene.media.map((medium) => {
        if (!medium.withShadow || !medium.withBezel) {
            return null;
        }

        const bezel = getBezel(medium.bezelKey);
        const bezelSize = getBezelSize(medium.bezelKey, medium.orientation);
        const maskSrc = bezelTransparentMask(bezel.modelKey);
        const maskImage = new Image(bezelSize[0], bezelSize[1]);
        maskImage.src = maskSrc;

        return maskImage;
    });

    return await waitToLoad(maskImages);
}

export async function createBezelImages(scene: DrawableScene) {
    const images = scene.media.map((medium) => {
        if (!medium.withBezel) {
            return null;
        }

        const bezel = getBezel(medium.bezelKey);
        const bezelSize = getBezelSize(medium.bezelKey, medium.orientation);
        const imageSrc = bezelImage(bezel.key);
        const image = new Image(bezelSize[0], bezelSize[1]);
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
    for (const medium of scene.media) {
        const bezel = getBezel(medium.bezelKey);
        const bezelSize = getBezelSize(medium.bezelKey, medium.orientation);
        const currentImageSrc = small ? bezelSmallImage(bezel.key) : bezelImage(bezel.key);
        const currentMaskSrc = bezelTransparentMask(bezel.modelKey);
        const bezelImages = bezelImagesList[medium.index];

        if (bezelImages) {
            bezelImages.bezel = bezel;
            bezelImages.showBezel = medium.withBezel;

            if (!bezelImages.image.src.endsWith(currentImageSrc)) {
                if (bezelImages.image?.onload) {
                    bezelImages.image.onload = null;
                }
                bezelImages.image = new Image(bezelSize[0], bezelSize[1]);
                bezelImages.image.src = currentImageSrc;
                bezelImages.image.onload = () => {
                    onLoad();
                    bezelImages.image.onload = null;
                };

                if (bezelImages.maskImage?.onload) {
                    bezelImages.maskImage.onload = null;
                }
                bezelImages.maskImage = new Image(bezelSize[0], bezelSize[1]);
                bezelImages.maskImage.src = currentMaskSrc;
                bezelImages.maskImage.onload = () => {
                    onLoad();
                    bezelImages.maskImage.onload = null;
                };
            }
            else {
                onLoad();
            }

            continue;
        }

        const image = new Image(bezelSize[0], bezelSize[1]);
        image.src = currentImageSrc;
        image.onload = () => {
            onLoad();
            image.onload = null;
        };

        const mask = new Image(bezelSize[0], bezelSize[1]);
        mask.src = currentMaskSrc;
        mask.onload = () => {
            onLoad();
            mask.onload = null;
        };

        bezelImagesList[medium.index] = {
            bezel,
            showBezel: medium.withBezel,
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