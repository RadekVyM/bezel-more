import { cn } from '../../../utils/tailwind'
import { HsvaColor, Hue, Saturation } from '@uiw/react-color'
import { Background } from '../../../types/Background'
import BackgroundPreview from './BackgroundPreview'
import HexColorInput from '../HexColorInput'

type TwoColorsPickerProps = {
    className?: string,
    firstColor: HsvaColor,
    secondColor: HsvaColor,
    background: Background,
    onAddClick: () => void,
    onFirstColorChange: (newColor: HsvaColor) => void,
    onFirstColorHueChange: (newHue: { h: number }) => void,
    onSecondColorChange: (newColor: HsvaColor) => void,
    onSecondColorHueChange: (newHue: { h: number }) => void,
}

type ColorPickerProps = {
    className?: string,
    color: HsvaColor,
    onChange: (newColor: HsvaColor) => void,
    onHueChange: (newHue: { h: number }) => void
}

export default function TwoColorsPicker({ className, firstColor, secondColor, background, onAddClick, onFirstColorChange, onFirstColorHueChange, onSecondColorChange, onSecondColorHueChange }: TwoColorsPickerProps) {
    return (
        <div
            className={cn('grid grid-rows-[10rem_10rem] grid-cols-[1fr_auto] gap-3', className)}>
            <ColorPicker
                color={firstColor}
                onChange={onFirstColorChange}
                onHueChange={onFirstColorHueChange}
                className='row-start-1 row-end-2 col-start-1 col-end-2' />

            <ColorPicker
                color={secondColor}
                onChange={onSecondColorChange}
                onHueChange={onSecondColorHueChange}
                className='row-start-2 row-end-3 col-start-1 col-end-2' />

            <BackgroundPreview
                className='row-start-1 row-end-3 col-start-2 col-end-3 max-w-32'
                background={background}
                onAddClick={onAddClick} />
        </div>
    )
}

function ColorPicker({ className, color, onChange, onHueChange }: ColorPickerProps) {
    return (
        <div
            className={cn('grid grid-rows-[1fr_auto] grid-cols-[1fr_auto] gap-2', className)}>
            <Saturation
                className='border border-outline'
                style={{ borderRadius: '0.4rem', height: '100%', width: '100%' }}
                hsva={color}
                onChange={onChange}/>
            
            <Hue
                height='100%'
                width='16px'
                radius='0.4rem'
                direction='vertical'
                hue={color.h}
                onChange={onHueChange}/>
                
            <HexColorInput
                className='col-start-1 col-end-3'
                color={color}
                onColorChange={onChange} />
        </div>
    )
}