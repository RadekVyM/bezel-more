import { BEZELS, bezelMask, bezelSmallImage } from '../bezels'
import { ConversionConfig } from '../services/video/ConversionConfig'
import { cn } from '../utils/tailwind'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'

type BezelSelectionProps = {
    conversionConfig: ConversionConfig,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
    className?: string
}

export default function BezelSelection({ className, conversionConfig, updateConversionConfig }: BezelSelectionProps) {
    return (
        <>
            <div
                className='mb-6'>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={conversionConfig.withBezel}
                    onChange={(e) => updateConversionConfig({ withBezel: e.target.checked })} />
                <CheckInputLabel htmlFor='use-bezel-check' className='pl-3'>Use bezel</CheckInputLabel>
            </div>

            <div
                className={cn(className, 'grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-2')}
                aria-labelledby='bezel-selection-legend'
                role='radiogroup'>
                <p id='bezel-selection-legend' className='block text-sm font-medium col-start-1 col-end-[-1] sr-only'>Bezel Type</p>

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
        </>
    )
}