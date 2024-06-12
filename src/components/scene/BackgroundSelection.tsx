import { useEffect, useRef } from 'react'
import { Background, createSolidBackground } from '../../types/Background'
import { Scene } from '../../types/Scene'
import { shallowEqual } from '../../utils/objects'
import { cn } from '../../utils/tailwind'
import { drawBackground } from '../../services/drawing/background'
import Button from '../inputs/Button'
import { FaPlus } from 'react-icons/fa'

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
    return (
        <div
            className={cn(className)}
            role='radiogroup'
            aria-labelledby='background-selection-legend'>
            <p id='background-selection-legend' className='block text-sm font-medium mb-2'>Background</p>

            <div
                className='flex flex-wrap gap-2'>
                {PREDEFINED_BACKGROUNDS.map((bg, index) => {
                    const isSelected = shallowEqual(scene.background, bg);

                    return (
                        <div
                            key={index}
                            className='grid w-10 h-10 rounded-xl shadow-md overflow-hidden border border-outline cursor-pointer'
                            tabIndex={0}
                            role='radio'
                            aria-checked={isSelected}
                            onClick={() => updateScene({ background: { ...bg } })}>
                            <BackgroundCanvas
                                className='row-start-1 row-end-2 col-start1 col-end-2 w-full h-full checkered'
                                background={bg}/>
                            {isSelected &&
                                <div
                                    className='row-start-1 row-end-2 col-start1 col-end-2 place-self-center w-5 h-5 rounded-md bg-white border border-outline shadow-md'/>}
                        </div>
                    )
                })}

                <Button
                    className='rounded-xl w-10 h-10'
                    title='Add new background'>
                    <FaPlus />
                </Button>
            </div>
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