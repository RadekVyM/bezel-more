import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'
import { Medium } from '../../types/Medium'

type MediumSizeConfigurationProps = {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
    className?: string
}

export default function MediumSizeConfiguration({ medium, className, updateMedium }: MediumSizeConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Corner radius'
                id='video-corner-radius'
                unit='px'
                inputClassName='pr-8'
                min={0}
                value={medium.cornerRadius}
                onChange={(e) => updateMedium({ cornerRadius: parseFloat(e.target.value) })} />
        </div>
    )
}