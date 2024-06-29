import { Scene } from '../../types/Scene'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import useContentDialog from '../../hooks/useContentDialog'
import BackgroundCanvas from '../BackgroundCanvas'
import BackgroundPickerDialog from '../inputs/BackgroundPickerDialog'

type BackgroundSelectionProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function BackgroundSelection({ scene, className, updateScene }: BackgroundSelectionProps) {
    const [backgroundDialogRef, isOpen, backgroundDialogAnimation, showBackgroundDialog, hideBackgroundDialog] = useContentDialog(true);

    return (
        <div
            className={cn(className)}
            role='radiogroup'
            aria-labelledby='background-selection-legend'>
            <label htmlFor='background-selection' className='block text-sm font-medium mb-2 select-none w-fit'>Background</label>

            <Button
                id='background-selection'
                className='p-1.5'
                onClick={() => showBackgroundDialog()}>
                <BackgroundCanvas
                    className='w-8 h-8 checkered rounded-md border border-outline overflow-hidden'
                    background={scene.background}/>
            </Button>

            <BackgroundPickerDialog
                ref={backgroundDialogRef}
                currentBackground={scene.background}
                animation={backgroundDialogAnimation}
                hide={hideBackgroundDialog}
                onPick={(background) => updateScene({ background: { ...background } })} />
        </div>
    )
}