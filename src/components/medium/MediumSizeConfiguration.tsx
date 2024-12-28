import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'
import { Medium } from '../../types/Medium'

export default function MediumSizeConfiguration(props: {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
    className?: string
}) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', props.className)}>
            <NumberInput
                label='Corner radius'
                id='video-corner-radius'
                unit='px'
                inputClassName='pr-8'
                min={0}
                value={props.medium.cornerRadius}
                onChange={(e) => props.updateMedium({ cornerRadius: parseFloat(e.target.value) })} />
        </div>
    )
}