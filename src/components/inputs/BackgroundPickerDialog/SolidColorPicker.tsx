import { Hue, Saturation, hexToHsva } from '@uiw/react-color'
import { Background, SolidBackground, createSolidBackground, solidBackgroundsEqual } from '../../../types/Background'
import useSolidBackgrounds from '../../../hooks/useSolidBackgrounds'
import BackgroundsList from './BackgroundsList'
import BackgroundPreview from './BackgroundPreview'
import HexColorInput from '../HexColorInput'

const PREDEFINED_SOLID_BACKGROUNDS: Array<SolidBackground> = [
    createSolidBackground(hexToHsva('#00000000')),
    createSolidBackground(hexToHsva('#ffffffff')),
    createSolidBackground(hexToHsva('#eeeeeeff')),
    createSolidBackground(hexToHsva('#000000ff')),
    createSolidBackground(hexToHsva('#26355dff')),
    createSolidBackground(hexToHsva('#83B4ffff')),
    createSolidBackground(hexToHsva('#365e32ff')),
    createSolidBackground(hexToHsva('#7Aba78ff')),
    createSolidBackground(hexToHsva('#ffc55aff')),
    createSolidBackground(hexToHsva('#ffdb00ff')),
    createSolidBackground(hexToHsva('#ff6500ff')),
    createSolidBackground(hexToHsva('#a91d3aff')),
    createSolidBackground(hexToHsva('#7469b6ff')),
];

const TRANSPARENT_COLOR_PATTERN = /#00000000/;

export default function SolidColorPicker(props: {
    currentBackground: SolidBackground,
    onPick: (background: Background) => void,
}) {
    const { solidBackgrounds, addSolidBackground, removeSolidBackground } = useSolidBackgrounds();

    return (
        <div
            className='grid grid-rows-[10rem_auto_auto] gap-x-3 gap-y-5'>
            <div
                className='grid grid-rows-[1fr_auto] grid-cols-[1fr_auto] gap-3'>
                <Saturation
                    className='border border-outline'
                    style={{ borderRadius: '0.4rem', height: '100%', width: '100%' }}
                    hsva={props.currentBackground.color}
                    onChange={(newColor) => props.onPick(createSolidBackground({ ...newColor, a: 1 }))}/>

                <BackgroundPreview
                    className='col-start-2 col-end-3'
                    background={props.currentBackground}
                    onAddClick={() => addSolidBackground(props.currentBackground.color)} />

                <Hue
                    className='row-start-2 row-end-3 col-start-1 col-end-3'
                    height='16px'
                    width='100%'
                    radius='0.4rem'
                    direction='horizontal'
                    hue={props.currentBackground.color.h}
                    onChange={(newHue) => props.onPick(createSolidBackground({ ...props.currentBackground.color, ...newHue, a: 1 }))}/>
            </div>

            <HexColorInput
                customHexaPattern={TRANSPARENT_COLOR_PATTERN}
                color={props.currentBackground.color}
                onColorChange={(newColor) => props.onPick(createSolidBackground({ ...newColor }))} />

            <BackgroundsList
                backgrounds={solidBackgrounds}
                predefinedBackgrounds={PREDEFINED_SOLID_BACKGROUNDS}
                backgroundsEqual={solidBackgroundsEqual}
                removeBackground={removeSolidBackground}
                currentBackground={props.currentBackground}
                onPick={props.onPick}/>
        </div>
    )
}