import { useLocalStorage } from 'usehooks-ts'
import { RadialGradientBackground, createRadialGradientBackground, radialGradientBackgroundsEqual } from '../types/Background'
import { useCallback } from 'react'
import { HsvaColor } from '@uiw/react-color'

const RADIAL_GRADIENTS_KEY = 'RADIAL_GRADIENTS_KEY';

export default function useRadialGradientBackground() {
    const [radialGradientBackgrounds, setRadialGradientBackgrounds] = useLocalStorage<Array<RadialGradientBackground>>(RADIAL_GRADIENTS_KEY, []);

    const addRadialGradientBackground = useCallback((startColor: HsvaColor, endColor: HsvaColor, angle: number) => {
        const newBackground: RadialGradientBackground = createRadialGradientBackground(startColor, endColor, angle);
        setRadialGradientBackgrounds((old) => old.some((bg) => radialGradientBackgroundsEqual(bg, newBackground))
            ? [...old] :
            [...old, newBackground]);
        return newBackground;
    }, [setRadialGradientBackgrounds]);

    const removeRadialGradientBackground = useCallback((background: RadialGradientBackground) => {
        setRadialGradientBackgrounds((old) => [...old.filter((bg) => !radialGradientBackgroundsEqual(bg, background))])
    }, [setRadialGradientBackgrounds]);

    return {
        radialGradientBackgrounds,
        addRadialGradientBackground,
        removeRadialGradientBackground
    };
}