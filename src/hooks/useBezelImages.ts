import { useEffect, useRef } from 'react'
import { BezelImages } from '../types/BezelImages'
import { DrawableScene } from '../types/DrawableScene'
import { bezelImage, bezelSmallImage, bezelTransparentMask, getBezel } from '../bezels'

export default function useBezelImages(scene: DrawableScene, onLoad: () => void, small?: boolean) {
    const bezelImagesRef = useRef<Array<BezelImages>>([]);

    useEffect(() => {
        for (const video of scene.videos) {
            const bezel = getBezel(video.bezelKey);
            const currentImageSrc = small ? bezelSmallImage(bezel.key) : bezelImage(bezel.key);
            const currentMaskSrc = bezelTransparentMask(bezel.modelKey);
            const bezelImages = bezelImagesRef.current[video.index];

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

            bezelImagesRef.current[video.index] = {
                bezel,
                showBezel: video.withBezel,
                image,
                maskImage: mask,
            };

            onLoad();
        }
    }, [scene.videos]);

    return bezelImagesRef;
}