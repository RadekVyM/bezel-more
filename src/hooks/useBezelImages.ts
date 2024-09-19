import { useEffect, useRef } from 'react'
import { BezelImages } from '../types/BezelImages'
import { DrawableScene } from '../types/DrawableScene'
import { prepareBezelImages } from '../services/images'

export default function useBezelImages(scene: DrawableScene, onLoad: () => void, small?: boolean) {
    const bezelImagesRef = useRef<Array<BezelImages>>([]);

    useEffect(() => {
        prepareBezelImages(bezelImagesRef.current, scene, onLoad, small);
    }, [scene.media]);

    return bezelImagesRef;
}