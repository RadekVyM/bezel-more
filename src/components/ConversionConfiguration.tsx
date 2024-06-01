import NumberInput from './NumberInput'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'
import { SupportedFormat, supportedFormats } from '../supportedFormats'
import { cn } from '../utils/tailwind'
import { ConversionConfig } from '../services/video/ConversionConfig'

type ConversionConfigurationProps = {
    conversionConfig: ConversionConfig,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    className?: string
}

type NumberInputsProps = {
    conversionConfig: ConversionConfig,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    className?: string
}

type FormatSelectionProps = {
    conversionConfig: ConversionConfig,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    className?: string
}

export default function ConversionConfiguration({
    conversionConfig,
    updateConversionConfig,
    className
}: ConversionConfigurationProps) {
    return (
        <div
            className={cn('flex flex-col gap-4', className)}>
            <NumberInputs
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />

            <FormatSelection
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />
        </div>
    )
}

function NumberInputs({ className, updateConversionConfig, conversionConfig }: NumberInputsProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='FPS'
                id='fps'
                min={5} max={60} step={1}
                value={conversionConfig.fps}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => updateConversionConfig({ fps: parseFloat(e.target.value) })} />
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={conversionConfig.size}
                onChange={(e) => updateConversionConfig({ size: parseFloat(e.target.value) })} />
            <NumberInput
                label='Max Colors'
                id='max-colors'
                min={32} max={255} step={1}
                value={conversionConfig.maxColors}
                disabled={conversionConfig.formatKey === supportedFormats.webp.key}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => updateConversionConfig({ maxColors: parseFloat(e.target.value) })} />
        </div>
    )
}

function FormatSelection({ className, updateConversionConfig, conversionConfig }: FormatSelectionProps) {
    return (
        <fieldset
            className={className}>
            <legend className='block text-sm font-medium mb-2'>Output Format</legend>

            {Object.values(supportedFormats).map(f =>
                <div
                    key={f.key}
                    className='mb-2'>
                    <CheckInput
                        type='radio'
                        name='format'
                        id={f.key}
                        value={f.key}
                        checked={conversionConfig.formatKey === f.key}
                        onChange={(e) => updateConversionConfig({ formatKey: e.currentTarget.value as SupportedFormat })} />
                    <CheckInputLabel
                        htmlFor={f.key}>
                        {f.title}
                    </CheckInputLabel>
                </div>)}
        </fieldset>
    )
}