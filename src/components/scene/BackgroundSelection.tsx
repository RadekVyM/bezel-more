import { useEffect, useRef } from 'react'
import { Background, createSolidBackground } from '../../types/Background'
import { Scene } from '../../types/Scene'
import { shallowEqual } from '../../utils/objects'
import { cn } from '../../utils/tailwind'
import { drawBackground } from '../../services/drawing/background'
import Button from '../inputs/Button'
import { FaPlus } from 'react-icons/fa'
import { ColorPickerDialog } from '../inputs/ColorPickerDialog'
import useContentDialog from '../../hooks/useContentDialog'
import useSolidBackgrounds from '../../hooks/useSolidBackgrounds'
import { MdClose } from 'react-icons/md'

type BackgroundSelectionProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

type BackgroundCanvasProps = {
    background: Background,
    className?: string
}

const PREDEFINED_BACKGROUNDS: Array<Background> = [
    createSolidBackground('#00000000'),
    createSolidBackground('#FFFFFF'),
    createSolidBackground('#EEEEEE'),
    createSolidBackground('#000000'),
    createSolidBackground('#26355D'),
    createSolidBackground('#83B4FF'),
    createSolidBackground('#365E32'),
    createSolidBackground('#7ABA78'),
    createSolidBackground('#FFC55A'),
    createSolidBackground('#FFDB00'),
    createSolidBackground('#FF6500'),
    createSolidBackground('#A91D3A'),
    createSolidBackground('#7469B6'),
]

export default function BackgroundSelection({ scene, className, updateScene }: BackgroundSelectionProps) {
    const [colorDialogRef, isOpen, animation, showColorDialog, hideColorDialog] = useContentDialog(true);
    const { solidBackgrounds, addSolidBackground, removeSolidBackground } = useSolidBackgrounds();
    const backgrounds = [...PREDEFINED_BACKGROUNDS.map((bg) => ({ bg, isPredefined: true })), ...solidBackgrounds.map((bg) => ({ bg, isPredefined: false }))];

    function onPick(bg: Background) {
        updateScene({ background: { ...bg } })
    }

    function onRemoveClick(bg: Background) {
        removeSolidBackground(bg);
        if (shallowEqual(scene.background, bg)) {
            updateScene({ background: { ...backgrounds[0].bg } });
        }
    }

    return (
        <div
            className={cn(className)}
            role='radiogroup'
            aria-labelledby='background-selection-legend'>
            <p id='background-selection-legend' className='block text-sm font-medium mb-2'>Background</p>

            <div
                className='flex flex-wrap gap-2 isolate'>
                {backgrounds.map((bg, index) => {
                    const isSelected = shallowEqual(scene.background, bg.bg);

                    return (
                        <div
                            key={index}
                            className='relative'>
                            <div
                                className='grid w-10 h-10 rounded-xl shadow-md cursor-pointer peer'
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
                                        className='row-start-1 row-end-2 col-start1 col-end-2 place-self-center w-5 h-5 rounded-md bg-white border border-outline shadow-md'/>}
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

                <Button
                    className='rounded-xl w-10 h-10'
                    title='Add new background'
                    onClick={() => showColorDialog()}>
                    <FaPlus />
                </Button>
            </div>

            <ColorPickerDialog
                ref={colorDialogRef}
                animation={animation}
                hide={hideColorDialog}
                onPicked={(color) => {
                    onPick(addSolidBackground(color));
                }} />
        </div>
    )
}

function BackgroundCanvas({ background, className }: BackgroundCanvasProps) {
    const size = 100;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const context = canvasRef.current.getContext('2d');

        if (!context) {
            return;
        }

        drawBackground(context, background, 0, 0, { width: size, height: size });
    }, [background]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            height={size}
            width={size}/>
    )
}