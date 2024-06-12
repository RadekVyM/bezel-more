import { useLocalStorage } from 'usehooks-ts'
import { Background, SolidBackground } from '../types/Background'
import { useCallback } from 'react'
import { shallowEqual } from '../utils/objects'

const SOLID_COLORS_KEY = 'SOLID_COLORS_KEY';

export default function useSolidBackgrounds() {
    const [solidBackgrounds, setSolidBackgrounds] = useLocalStorage<Array<SolidBackground>>(SOLID_COLORS_KEY, []);

    const addSolidBackground = useCallback((color: string) => {
        const newBackground: SolidBackground = { type: 'solid', color };
        setSolidBackgrounds((old) => old.some((bg) => shallowEqual(bg, newBackground)) ? [...old] : [...old, newBackground]);
        return newBackground;
    }, [setSolidBackgrounds]);

    const removeSolidBackground = useCallback((background: Background) => {
        setSolidBackgrounds((old) => [...old.filter((bg) => !shallowEqual(bg, background))])
    }, [setSolidBackgrounds]);

    return {
        solidBackgrounds,
        addSolidBackground,
        removeSolidBackground
    };
}