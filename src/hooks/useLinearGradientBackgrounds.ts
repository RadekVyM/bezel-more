import { useLocalStorage } from 'usehooks-ts'
import { LinearGradientBackground, createLinearGradientBackground, linearGradientBackgroundsEqual } from '../types/Background'
import { useCallback } from 'react'
import { HsvaColor } from '@uiw/react-color'

const LINEAR_GRADIENTS_KEY = 'LINEAR_GRADIENTS_KEY';

export default function useLinearGradientBackground() {
    const [linearGradientBackgrounds, setLinearGradientBackgrounds] = useLocalStorage<Array<LinearGradientBackground>>(LINEAR_GRADIENTS_KEY, []);

    const addLinearGradientBackground = useCallback((startColor: HsvaColor, endColor: HsvaColor, angle: number) => {
        const newBackground: LinearGradientBackground = createLinearGradientBackground(startColor, endColor, angle);
        setLinearGradientBackgrounds((old) => old.some((bg) => linearGradientBackgroundsEqual(bg, newBackground))
            ? [...old] :
            [...old, newBackground]);
        return newBackground;
    }, [setLinearGradientBackgrounds]);

    const removeLinearGradientBackground = useCallback((background: LinearGradientBackground) => {
        setLinearGradientBackgrounds((old) => [...old.filter((bg) => !linearGradientBackgroundsEqual(bg, background))])
    }, [setLinearGradientBackgrounds]);

    return {
        linearGradientBackgrounds,
        addLinearGradientBackground,
        removeLinearGradientBackground
    };
}