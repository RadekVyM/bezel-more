import NumberInput from './NumberInput'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'
import { bezels } from '../bezels'
import { cn } from '../utils/tailwind'

export default function ConversionConfiguration({ filterComplexConfig, setFilterComplexConfig, bezel, setBezel, withBezel, setWithBezel, className }) {
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
                    value={filterComplexConfig.start}
                    onChange={(e) => setFilterComplexConfig((old) => ({ ...old, start: e.target.value }))}/>
                <NumberInput
                    label='End'
                    id='end'
                    unit='seconds'
                    inputClassName='pr-[4.5rem]'
                    min={0} step={0.1}
                    value={filterComplexConfig.end}
                    onChange={(e) => setFilterComplexConfig((old) => ({ ...old, end: e.target.value }))}/>
                <NumberInput
                    label='FPS'
                    id='fps'
                    min={5} max={60} step={1}
                    value={filterComplexConfig.fps}
                    onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                    onChange={(e) => setFilterComplexConfig((old) => ({ ...old, fps: e.target.value }))}/>
                <NumberInput
                    label='Max Colors'
                    id='max-colors'
                    min={32} max={255} step={1}
                    value={filterComplexConfig.maxColors}
                    onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                    onChange={(e) => setFilterComplexConfig((old) => ({ ...old, maxColors: e.target.value }))}/>
                <NumberInput
                    label='Size'
                    id='size'
                    unit='px'
                    inputClassName='pr-8'
                    min={1}
                    value={filterComplexConfig.size}
                    onChange={(e) => setFilterComplexConfig((old) => ({ ...old, size: e.target.value }))}/>
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
                <legend className='block text-sm font-medium mb-2'>Bezel type</legend>

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
        </div>
    )
}