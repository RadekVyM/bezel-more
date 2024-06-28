import { cn } from '../../../utils/tailwind'
import Button from '../Button'
import { MdClose } from 'react-icons/md'
import { Hue, Saturation, equalHex, hexToHsva, hsvaToHexa } from '@uiw/react-color'
import { Background, SolidBackground, createSolidBackground } from '../../../types/Background'
import useSolidBackgrounds from '../../../hooks/useSolidBackgrounds'
import BackgroundCanvas from '../../BackgroundCanvas'
import { FaSave } from 'react-icons/fa'

type SolidColorPickerProps = {
    currentBackground: SolidBackground,
    onPick: (background: Background) => void,
}

type SolidColorsListProps = {
    className?: string,
    currentBackground: SolidBackground,
    onPick: (background: Background) => void,
}

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

export default function SolidColorPicker({ currentBackground, onPick }: SolidColorPickerProps) {
    const { addSolidBackground } = useSolidBackgrounds();

    return (
        <div
            className='grid grid-rows-[10rem_auto] gap-x-3 gap-y-5'>
            <div
                className='grid grid-rows-[1fr_auto] grid-cols-[1fr_auto] gap-3'>
                <Saturation
                    className='border border-outline'
                    style={{ borderRadius: '0.4rem', height: '100%', width: '100%' }}
                    hsva={currentBackground.color}
                    onChange={(newColor) => onPick(createSolidBackground({ ...newColor, a: 1 }))}/>
                
                <div
                    className='group relative col-start-2 col-end-3'>
                    <BackgroundCanvas
                        background={currentBackground}
                        className='checkered w-full h-full rounded-[0.4rem] border border-outline'/>
                    
                    <Button
                        className='opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bottom-0 p-1 m-2'
                        onClick={() => addSolidBackground(currentBackground.color)}>
                        <FaSave />
                    </Button>
                </div>

                <Hue
                    className='row-start-2 row-end-3 col-start-1 col-end-3'
                    height='16px'
                    width='100%'
                    radius='0.4rem'
                    direction='horizontal'
                    hue={currentBackground.color.h}
                    onChange={(newHue) => onPick(createSolidBackground({ ...currentBackground.color, ...newHue, a: 1 }))}/>
            </div>

            <SolidColorsList
                currentBackground={currentBackground}
                onPick={onPick}/>
        </div>
    )
}

function SolidColorsList({ className, currentBackground, onPick }: SolidColorsListProps) {
    const { solidBackgrounds, removeSolidBackground } = useSolidBackgrounds();
    const backgrounds = [...PREDEFINED_SOLID_BACKGROUNDS.map((bg) => ({ bg, isPredefined: true })), ...solidBackgrounds.map((bg) => ({ bg, isPredefined: false }))];

    function onRemoveClick(bg: SolidBackground) {
        removeSolidBackground(bg);
    }

    return (
        <div
            className={cn('flex flex-wrap gap-2 isolate', className)}>
            {backgrounds.map((bg, index) => {
                const isSelected = equalHex(hsvaToHexa(currentBackground.color), hsvaToHexa(bg.bg.color));

                return (
                    <div
                        key={index}
                        className='relative'>
                        <div
                            className='grid w-8 h-8 rounded-xl shadow-md cursor-pointer peer'
                            tabIndex={0}
                            role='radio'
                            aria-checked={isSelected}
                            onClick={() => onPick(bg.bg)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(bg.bg)}>
                            <BackgroundCanvas
                                className='row-start-1 row-end-2 col-start1 col-end-2 w-full h-full checkered rounded-xl border border-outline overflow-hidden'
                                background={bg.bg}/>
                            {isSelected &&
                                <div
                                    className='row-start-1 row-end-2 col-start1 col-end-2 place-self-center w-4 h-4 rounded-md bg-white border border-outline shadow-md'/>}
                        </div>

                        {!bg.isPredefined &&
                            <button
                                className='opacity-0 peer-focus-within:opacity-100 peer-hover:opacity-100 hover:opacity-100 focus:opacity-100
                                    transition-opacity
                                    z-20 w-4 h-4 absolute right-[-15%] top-[-15%] grid place-content-center bg-danger rounded-md'
                                onClick={(e) => onRemoveClick(bg.bg)}>
                                <MdClose className='w-3 h-3 text-on-danger' />
                            </button>}
                    </div>
                )
            })}
        </div>
    )
}