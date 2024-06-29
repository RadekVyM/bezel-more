import { hsvaToHexa } from '@uiw/react-color'
import useContentDialog from '../../hooks/useContentDialog'
import { Video } from '../../types/Video'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'
import { ColorPickerDialog } from '../inputs/ColorPickerDialog'
import NumberInput from '../inputs/NumberInput'

type VideoShadowConfigurationProps = {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
}

export default function VideoShadowConfiguration({ className, video, updateVideo }: VideoShadowConfigurationProps) {
    const [colorDialogRef, isOpen, colorDialogAnimation, showColorDialog, hideColorDialog] = useContentDialog(true);

    return (
        <>
            <div
                className='mb-4'>
                <CheckInput
                    id='use-shadow-checkbox'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={video.withShadow}
                    onChange={(e) => updateVideo({ withShadow: e.target.checked })} />
                <CheckInputLabel htmlFor='use-shadow-checkbox' className='pl-3'>Use shadow</CheckInputLabel>
            </div>
            <div
                className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
                <NumberInput
                    label='Horizontal offset'
                    id='shadow-horizontal-offset'
                    unit='px'
                    inputClassName='pr-8'
                    step={0.1}
                    disabled={!video.withShadow}
                    value={video.shadowOffsetX}
                    onChange={(e) => updateVideo({ shadowOffsetX: parseFloat(e.target.value) })} />
                <NumberInput
                    label='Vertical offset'
                    id='shadow-vertical-offset'
                    unit='px'
                    inputClassName='pr-8'
                    step={0.1}
                    disabled={!video.withShadow}
                    value={video.shadowOffsetY}
                    onChange={(e) => updateVideo({ shadowOffsetY: parseFloat(e.target.value) })} />
                <NumberInput
                    label='Blur'
                    id='shadow-blur'
                    step={0.1}
                    min={0}
                    disabled={!video.withShadow}
                    value={video.shadowBlur}
                    onChange={(e) => updateVideo({ shadowBlur: parseFloat(e.target.value) })} />

                <div
                    className='flex flex-col'>
                    <label
                        htmlFor='shadow-color-selection'
                        className='block text-sm font-medium mb-2 select-none w-fit'>
                        Color
                    </label>

                    <Button
                        id='shadow-color-selection'
                        className='p-1.5 flex-1 place-content-stretch'
                        disabled={!video.withShadow}
                        onClick={() => showColorDialog()}>
                        <div
                            className='checkered rounded-md w-full h-full overflow-hidden'>
                            <div
                                style={{ background: hsvaToHexa(video.shadowColor) }}
                                className='w-full h-full'/>
                        </div>
                    </Button>
                </div>
            </div>

            <ColorPickerDialog
                ref={colorDialogRef}
                color={video.shadowColor}
                animation={colorDialogAnimation}
                hide={hideColorDialog}
                onPick={(color) => updateVideo({ shadowColor: { ...color } })} />
        </>
    )
}