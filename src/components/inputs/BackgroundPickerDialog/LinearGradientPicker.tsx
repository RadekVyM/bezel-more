import { Background, LinearGradientBackground, createLinearGradientBackground, linearGradientBackgroundsEqual } from '../../../types/Background'
import useLinearGradientBackground from '../../../hooks/useLinearGradientBackgrounds'
import NumberInput from '../NumberInput'
import BackgroundsList from './BackgroundsList'
import TwoColorsPicker from './TwoColorsPicker'

const PREDEFINED_LINEAR_GRADIENT_BACKGROUNDS: Array<LinearGradientBackground> = [
    createLinearGradientBackground({h: 254.53125, s: 0, v: 63.671875, a: 1}, {h: 209.53125, s: 0, v: 87.109375, a: 1}, 90),
    createLinearGradientBackground({h: 254.53125, s: 39.625850340136054, v: 45.703125, a: 1}, {h: 209.53125, s: 67.17687074829932, v: 56.640625, a: 1}, 45),
    createLinearGradientBackground({h: 136.40625, s: 38.945578231292515, v: 41.015625, a: 1}, {h: 139.21875, s: 56.292517006802726, v: 80.859375, a: 1}, 135),
    createLinearGradientBackground({h: 49.21875, s: 58.333333333333336, v: 65.234375, a: 1}, {h: 54.84375, s: 39.285714285714285, v: 96.484375, a: 1}, 80),
    createLinearGradientBackground({h: 12.65625, s: 58.333333333333336, v: 65.234375, a: 1}, {h: 32.34375, s: 39.285714285714285, v: 96.484375, a: 1}, 70),
];

export default function LinearGradientPicker(props: {
    currentBackground: LinearGradientBackground,
    onPick: (background: Background) => void,
}) {
    const { linearGradientBackgrounds, addLinearGradientBackground, removeLinearGradientBackground } = useLinearGradientBackground();

    return (
        <div
            className='grid grid-rows-[1fr_auto_auto] gap-3'>
            <TwoColorsPicker
                firstColor={props.currentBackground.startColor}
                secondColor={props.currentBackground.endColor}
                background={props.currentBackground}
                onAddClick={() => addLinearGradientBackground(props.currentBackground.startColor, props.currentBackground.endColor, props.currentBackground.angle)}
                onFirstColorChange={(newColor) => props.onPick(createLinearGradientBackground({ ...newColor, a: 1 }, props.currentBackground.endColor, props.currentBackground.angle))}
                onFirstColorHueChange={(newHue) => props.onPick(createLinearGradientBackground({ ...props.currentBackground.startColor, h: newHue.h, a: 1 }, props.currentBackground.endColor, props.currentBackground.angle))}
                onSecondColorChange={(newColor) => props.onPick(createLinearGradientBackground(props.currentBackground.startColor, { ...newColor, a: 1 }, props.currentBackground.angle))}
                onSecondColorHueChange={(newHue) => props.onPick(createLinearGradientBackground(props.currentBackground.startColor, { ...props.currentBackground.endColor, h: newHue.h, a: 1 }, props.currentBackground.angle))} />
            
            <NumberInput
                inputClassName='pr-6'
                label='Angle'
                id='linear-angle'
                min={0} max={360} step={0.1}
                variant='sm'
                unit='°'
                value={props.currentBackground.angle}
                onChange={(e) => props.onPick(createLinearGradientBackground(props.currentBackground.startColor, props.currentBackground.endColor, parseFloat(e.target.value)))} />

            <BackgroundsList
                backgrounds={linearGradientBackgrounds}
                predefinedBackgrounds={PREDEFINED_LINEAR_GRADIENT_BACKGROUNDS}
                backgroundsEqual={linearGradientBackgroundsEqual}
                removeBackground={removeLinearGradientBackground}
                currentBackground={props.currentBackground}
                onPick={props.onPick}/>
        </div>
    )
}