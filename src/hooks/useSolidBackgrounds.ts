import { useLocalStorage } from 'usehooks-ts'
import { SolidBackground } from '../types/Background'
import { useCallback } from 'react'
import { HsvaColor, equalHex, hsvaToHexa } from '@uiw/react-color'

const SOLID_COLORS_KEY = 'SOLID_COLORS_KEY';

export default function useSolidBackgrounds() {
    const [solidBackgrounds, setSolidBackgrounds] = useLocalStorage<Array<SolidBackground>>(SOLID_COLORS_KEY, []);

    const addSolidBackground = useCallback((color: HsvaColor) => {
        const newBackground: SolidBackground = { type: 'solid', color };
        setSolidBackgrounds((old) => old.some((bg) => equalHex(hsvaToHexa(bg.color), hsvaToHexa(newBackground.color)))
            ? [...old] :
            [...old, newBackground]);
        return newBackground;
    }, [setSolidBackgrounds]);

    const removeSolidBackground = useCallback((background: SolidBackground) => {
        setSolidBackgrounds((old) => [...old.filter((bg) => !equalHex(hsvaToHexa(bg.color), hsvaToHexa(background.color)))])
    }, [setSolidBackgrounds]);

    return {
        solidBackgrounds,
        addSolidBackground,
        removeSolidBackground
    };
}