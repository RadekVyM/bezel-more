import NumberInput from './NumberInput'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'
import { BEZELS, bezelSmallImage, bezelMask } from '../bezels'
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

type BezelSelectionProps = {
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

            <h3 className='font-bold text-xl'>Bezel</h3>

            <div>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={conversionConfig.withBezel}
                    onChange={(e) => updateConversionConfig({ withBezel: e.target.checked })} />
                <CheckInputLabel htmlFor='use-bezel-check' className='pl-3'>Use bezel</CheckInputLabel>
            </div>

            <BezelSelection
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />
        </div>
    )
}

function BezelSelection({ className, conversionConfig, updateConversionConfig }: BezelSelectionProps) {
    return (
        <div
            className={cn(className, 'grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2')}
            aria-labelledby='bezel-selection-legend'
            role='radiogroup'>
            <p id='bezel-selection-legend' className='block text-sm font-medium col-start-1 col-end-[-1]'>Bezel Type</p>

            {Object.values(BEZELS).map(b =>
                <article
                    key={b.key}
                    className='p-4 w-full
                        grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-3 gap-y-5 items-center
                        cursor-pointer isolate
                        border border-gray-200 rounded-md
                        disabled:text-gray-500 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:border-gray-700 dark:hover:bg-gray-800'
                    tabIndex={0}
                    role='radio'
                    aria-checked={conversionConfig.bezelKey === b.key}
                    onClick={() => updateConversionConfig({ bezelKey: b.key })}
                    onKeyUp={(e) => e.key === 'Enter' && updateConversionConfig({ bezelKey: b.key })}>
                    <h4
                        className='row-start-2 row-end-3 col-start-2 col-end-3 text-xs dark:text-gray-100'>
                        {b.title}
                    </h4>
                    <div
                        className='row-start-1 row-end-2 col-start-1 col-end-3 justify-self-center
                            max-h-60 w-full h-full
                            bg-[linear-gradient(0deg,rgba(34,193,195,1)_0%,rgba(253,187,45,1)_100%)]'
                        style={{
                            maskImage: `url("${bezelMask(b.modelKey)}")`,
                            WebkitMaskImage: `url("${bezelMask(b.modelKey)}")`,
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            maskSize: 'contain',
                            maskMode: 'luminance'
                        }} />
                    <img
                        className='row-start-1 row-end-2 col-start-1 col-end-3 justify-self-center max-h-60 z-10'
                        loading='lazy'
                        src={bezelSmallImage(b.key)}
                        alt={`${b.title} bezel`} />
                    <div
                        aria-hidden
                        className={cn('w-5 h-5 flex justify-center items-center',
                            'row-start-2 row-end-3 col-start-1 col-end-2',
                            'rounded-full bg-black',
                            conversionConfig.bezelKey === b.key ?
                                'bg-black dark:bg-gray-700 before:content-[""] before:block before:w-2 before:h-2 before:aspect-square before:bg-white before:rounded-full' :
                                'border bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600')}>
                    </div>
                </article>)}
        </div>
    )
}

function NumberInputs({ className, updateConversionConfig, conversionConfig }: NumberInputsProps) {
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