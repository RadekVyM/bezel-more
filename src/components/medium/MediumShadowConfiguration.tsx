import { hsvaToHexa } from '@uiw/react-color'
import useContentDialog from '../../hooks/useContentDialog'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'
import { ColorPickerDialog } from '../inputs/ColorPickerDialog'
import NumberInput from '../inputs/NumberInput'
import { Medium } from '../../types/Medium'

export default function MediumShadowConfiguration(props: {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
    className?: string
}) {
    const colorDialogState = useContentDialog(true);

    return (
        <>
            <div
                className='mb-4'>
                <CheckInput
                    id='use-shadow-checkbox'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={props.medium.withShadow}
                    onChange={(e) => props.updateMedium({ withShadow: e.target.checked })} />
                <CheckInputLabel htmlFor='use-shadow-checkbox' className='pl-3'>Use shadow</CheckInputLabel>
            </div>
            <div
                className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', props.className)}>
                <NumberInput
                    label='Horizontal offset'
                    id='shadow-horizontal-offset'
                    unit='px'
                    inputClassName='pr-8'
                    step={0.1}
                    disabled={!props.medium.withShadow}
                    value={props.medium.shadowOffsetX}
                    onChange={(e) => props.updateMedium({ shadowOffsetX: parseFloat(e.target.value) })} />
                <NumberInput
                    label='Vertical offset'
                    id='shadow-vertical-offset'
                    unit='px'
                    inputClassName='pr-8'
                    step={0.1}
                    disabled={!props.medium.withShadow}
                    value={props.medium.shadowOffsetY}
                    onChange={(e) => props.updateMedium({ shadowOffsetY: parseFloat(e.target.value) })} />
                <NumberInput
                    label='Blur'
                    id='shadow-blur'
                    step={0.1}
                    min={0}
                    disabled={!props.medium.withShadow}
                    value={props.medium.shadowBlur}
                    onChange={(e) => props.updateMedium({ shadowBlur: parseFloat(e.target.value) })} />

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
                        disabled={!props.medium.withShadow}
                        onClick={colorDialogState.show}>
                        <div
                            className='checkered rounded-md w-full h-full overflow-hidden min-h-7'>
                            <div
                                style={{ background: hsvaToHexa(props.medium.shadowColor) }}
                                className='w-full h-full'/>
                        </div>
                    </Button>
                </div>
            </div>

            <ColorPickerDialog
                ref={colorDialogState.dialogRef}
                color={props.medium.shadowColor}
                state={colorDialogState}
                onPick={(color) => props.updateMedium({ shadowColor: { ...color } })} />
        </>
    )
}