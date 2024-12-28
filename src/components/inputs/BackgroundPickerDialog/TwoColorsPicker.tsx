import { cn } from '../../../utils/tailwind'
import { HsvaColor, Hue, Saturation } from '@uiw/react-color'
import { Background } from '../../../types/Background'
import BackgroundPreview from './BackgroundPreview'
import HexColorInput from '../HexColorInput'

export default function TwoColorsPicker(props: {
    className?: string,
    firstColor: HsvaColor,
    secondColor: HsvaColor,
    background: Background,
    onAddClick: () => void,
    onFirstColorChange: (newColor: HsvaColor) => void,
    onFirstColorHueChange: (newHue: { h: number }) => void,
    onSecondColorChange: (newColor: HsvaColor) => void,
    onSecondColorHueChange: (newHue: { h: number }) => void,
}) {
    return (
        <div
            className={cn('grid grid-rows-[10rem_10rem] grid-cols-[1fr_auto] gap-3', props.className)}>
            <ColorPicker
                color={props.firstColor}
                onChange={props.onFirstColorChange}
                onHueChange={props.onFirstColorHueChange}
                className='row-start-1 row-end-2 col-start-1 col-end-2' />

            <ColorPicker
                color={props.secondColor}
                onChange={props.onSecondColorChange}
                onHueChange={props.onSecondColorHueChange}
                className='row-start-2 row-end-3 col-start-1 col-end-2' />

            <BackgroundPreview
                className='row-start-1 row-end-3 col-start-2 col-end-3 max-w-32'
                background={props.background}
                onAddClick={props.onAddClick} />
        </div>
    )
}

function ColorPicker(props: {
    className?: string,
    color: HsvaColor,
    onChange: (newColor: HsvaColor) => void,
    onHueChange: (newHue: { h: number }) => void
}) {
    return (
        <div
            className={cn('grid grid-rows-[1fr_auto] grid-cols-[1fr_auto] gap-2', props.className)}>
            <Saturation
                className='border border-outline'
                style={{ borderRadius: '0.4rem', height: '100%', width: '100%' }}
                hsva={props.color}
                onChange={props.onChange} />

            <Hue
                height='100%'
                width='16px'
                radius='0.4rem'
                direction='vertical'
                hue={props.color.h}
                onChange={props.onHueChange} />

            <HexColorInput
                className='col-start-1 col-end-3'
                color={props.color}
                onColorChange={props.onChange} />
        </div>
    )
}