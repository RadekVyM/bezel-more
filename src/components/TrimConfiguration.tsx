import { ConversionConfig } from '../services/video/ConversionConfig'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'

type CutConfigurationProps = {
    conversionConfig: ConversionConfig,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    className?: string
}

export default function TrimConfiguration({ className, conversionConfig, updateConversionConfig }: CutConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Start'
                id='start'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                min={0} step={0.1}
                value={conversionConfig.start}
                onChange={(e) => updateConversionConfig({ start: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                min={0} step={0.1}
                value={conversionConfig.end}
                onChange={(e) => updateConversionConfig({ end: parseFloat(e.target.value) })} />
        </div>
    )
}