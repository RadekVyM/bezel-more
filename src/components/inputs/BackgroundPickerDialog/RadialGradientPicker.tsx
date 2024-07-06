import { Background, RadialGradientBackground, createRadialGradientBackground, radialGradientBackgroundsEqual } from '../../../types/Background'
import useRadialGradientBackgrounds from '../../../hooks/useRadialGradientBackgrounds'
import NumberInput from '../NumberInput'
import BackgroundsList from './BackgroundsList'
import TwoColorsPicker from './TwoColorsPicker'

type RadialGradientPickerProps = {
    currentBackground: RadialGradientBackground,
    onPick: (background: Background) => void,
}

const PREDEFINED_RADIAL_GRADIENT_BACKGROUNDS: Array<RadialGradientBackground> = [
    createRadialGradientBackground({h: 209.53125, s: 0, v: 87.109375, a: 1}, {h: 254.53125, s: 0, v: 63.671875, a: 1}, 0),
    createRadialGradientBackground({h: 209.53125, s: 67.17687074829932, v: 56.640625, a: 1}, {h: 254.53125, s: 39.625850340136054, v: 45.703125, a: 1}, 0),
    createRadialGradientBackground({h: 139.21875, s: 56.292517006802726, v: 80.859375, a: 1}, {h: 136.40625, s: 38.945578231292515, v: 41.015625, a: 1}, 0),
    createRadialGradientBackground({h: 54.84375, s: 39.285714285714285, v: 96.484375, a: 1}, {h: 49.21875, s: 58.333333333333336, v: 65.234375, a: 1}, 0),
    createRadialGradientBackground({h: 32.34375, s: 39.285714285714285, v: 96.484375, a: 1}, {h: 12.65625, s: 58.333333333333336, v: 65.234375, a: 1}, 0),
];

export default function RadialGradientPicker({ currentBackground, onPick }: RadialGradientPickerProps) {
    const { radialGradientBackgrounds, addRadialGradientBackground, removeRadialGradientBackground } = useRadialGradientBackgrounds();

    return (
        <div
            className='grid grid-rows-[1fr_auto_auto] gap-3'>
            <TwoColorsPicker
                firstColor={currentBackground.innerColor}
                secondColor={currentBackground.outerColor}
                background={currentBackground}
                onAddClick={() => addRadialGradientBackground(currentBackground.innerColor, currentBackground.outerColor, currentBackground.innerRadius)}
                onFirstColorChange={(newColor) => onPick(createRadialGradientBackground({ ...newColor, a: 1 }, currentBackground.outerColor, currentBackground.innerRadius))}
                onFirstColorHueChange={(newHue) => onPick(createRadialGradientBackground({ ...currentBackground.innerColor, h: newHue.h, a: 1 }, currentBackground.outerColor, currentBackground.innerRadius))}
                onSecondColorChange={(newColor) => onPick(createRadialGradientBackground(currentBackground.innerColor, { ...newColor, a: 1 }, currentBackground.innerRadius))}
                onSecondColorHueChange={(newHue) => onPick(createRadialGradientBackground(currentBackground.innerColor, { ...currentBackground.outerColor, h: newHue.h, a: 1 }, currentBackground.innerRadius))} />
            
            <NumberInput
                inputClassName='pr-6'
                label='Inner circle radius'
                id='inner-circle-radius'
                min={0} max={100} step={0.1}
                variant='sm'
                unit='%'
                value={currentBackground.innerRadius * 100}
                onChange={(e) => onPick(createRadialGradientBackground(currentBackground.innerColor, currentBackground.outerColor, Math.max(0, Math.min(1, parseFloat(e.target.value) / 100))))} />

            <BackgroundsList
                backgrounds={radialGradientBackgrounds}
                predefinedBackgrounds={PREDEFINED_RADIAL_GRADIENT_BACKGROUNDS}
                backgroundsEqual={radialGradientBackgroundsEqual}
                removeBackground={removeRadialGradientBackground}
                currentBackground={currentBackground}
                onPick={onPick}/>
        </div>
    )
}