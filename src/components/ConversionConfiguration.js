import NumberInput from './NumberInput'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'
import { bezels } from '../bezels'
import { supportedFormats } from '../supportedFormats'
import { cn } from '../utils/tailwind'

export default function ConversionConfiguration({
    filterConfig,
    setFilterConfig,
    format,
    setFormat,
    bezel,
    setBezel,
    withBezel,
    setWithBezel,
    className
}) {
    return (
        <div
            className={cn('flex flex-col gap-4', className)}>
            <div
                className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <NumberInput
                    label='Start'
                    id='start'
                    unit='seconds'
                    inputClassName='pr-[4.5rem]'
                    min={0} step={0.1}
                    value={filterConfig.start}
                    onChange={(e) => setFilterConfig((old) => ({ ...old, start: e.target.value }))}/>
                <NumberInput
                    label='End'
                    id='end'
                    unit='seconds'
                    inputClassName='pr-[4.5rem]'
                    min={0} step={0.1}
                    value={filterConfig.end}
                    onChange={(e) => setFilterConfig((old) => ({ ...old, end: e.target.value }))}/>
                <NumberInput
                    label='FPS'
                    id='fps'
                    min={5} max={60} step={1}
                    value={filterConfig.fps}
                    onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                    onChange={(e) => setFilterConfig((old) => ({ ...old, fps: e.target.value }))}/>
                <NumberInput
                    label='Max Colors'
                    id='max-colors'
                    min={32} max={255} step={1}
                    value={filterConfig.maxColors}
                    disabled={format == supportedFormats.webp.key}
                    onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                    onChange={(e) => setFilterConfig((old) => ({ ...old, maxColors: e.target.value }))}/>
                <NumberInput
                    label='Size'
                    id='size'
                    unit='px'
                    inputClassName='pr-8'
                    min={1}
                    value={filterConfig.size}
                    onChange={(e) => setFilterConfig((old) => ({ ...old, size: e.target.value }))}/>
            </div>

            <div>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={withBezel}
                    onChange={(e) => setWithBezel(e.target.checked)}/>
                <CheckInputLabel htmlFor='use-bezel-check' className='pl-3'>Use bezel</CheckInputLabel>
            </div>

            <fieldset>
                <legend className='block text-sm font-medium mb-2'>Bezel Type</legend>

                {Object.values(bezels).map(b =>
                    <div
                        key={b.key}
                        className='mb-2'>
                        <CheckInput
                            type='radio'
                            name='bezel'
                            id={b.key}
                            value={b.key}
                            checked={bezel === b.key}
                            onChange={(e) => setBezel(e.currentTarget.value)}/>
                        <CheckInputLabel
                            htmlFor={b.key}>
                            {b.title}
                        </CheckInputLabel>
                    </div>)}
            </fieldset>
            
            <fieldset>
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
                            checked={format === f.key}
                            onChange={(e) => setFormat(e.currentTarget.value)}/>
                        <CheckInputLabel
                            htmlFor={f.key}>
                            {f.title}
                        </CheckInputLabel>
                    </div>)}
            </fieldset>
        </div>
    )
}