import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import useContentDialog from '../../hooks/useContentDialog'
import BackgroundCanvas from '../BackgroundCanvas'
import BackgroundPickerDialog from '../inputs/BackgroundPickerDialog'
import { Scene } from '../../types/Scene'

type BackgroundSelectionProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function BackgroundSelection({ scene, className, updateScene }: BackgroundSelectionProps) {
    const backgroundDialogState = useContentDialog(true);

    return (
        <div
            className={cn(className)}
            role='radiogroup'
            aria-labelledby='background-selection-legend'>
            <label htmlFor='background-selection' className='block text-sm font-medium mb-2 select-none w-fit'>Background</label>

            <Button
                id='background-selection'
                className='p-1.5'
                onClick={backgroundDialogState.show}>
                <BackgroundCanvas
                    className='w-8 h-8 checkered rounded-md border border-outline overflow-hidden'
                    background={scene.background}/>
            </Button>

            <BackgroundPickerDialog
                ref={backgroundDialogState.dialogRef}
                currentBackground={scene.background}
                state={backgroundDialogState}
                onPick={(background) => updateScene({ background: { ...background } })} />
        </div>
    )
}