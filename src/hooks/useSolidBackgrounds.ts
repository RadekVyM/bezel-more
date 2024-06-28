import { useLocalStorage } from 'usehooks-ts'
import { SolidBackground, createSolidBackground, solidBackgroundsEqual } from '../types/Background'
import { useCallback } from 'react'
import { HsvaColor } from '@uiw/react-color'

const SOLID_COLORS_KEY = 'SOLID_COLORS_KEY';

export default function useSolidBackgrounds() {
    const [solidBackgrounds, setSolidBackgrounds] = useLocalStorage<Array<SolidBackground>>(SOLID_COLORS_KEY, []);

    const addSolidBackground = useCallback((color: HsvaColor) => {
        const newBackground: SolidBackground = createSolidBackground(color);
        setSolidBackgrounds((old) => old.some((bg) => solidBackgroundsEqual(bg, newBackground))
            ? [...old] :
            [...old, newBackground]);
        return newBackground;
    }, [setSolidBackgrounds]);

    const removeSolidBackground = useCallback((background: SolidBackground) => {
        setSolidBackgrounds((old) => [...old.filter((bg) => !solidBackgroundsEqual(bg, background))])
    }, [setSolidBackgrounds]);

    return {
        solidBackgrounds,
        addSolidBackground,
        removeSolidBackground
    };
}