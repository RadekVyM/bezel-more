import { BEZELS, bezelMask, bezelSmallImage } from '../bezels'
import { Video } from '../types/Video'
import { cn } from '../utils/tailwind'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'

type BezelSelectionProps = {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
}

export default function BezelSelection({ className, video, updateVideo }: BezelSelectionProps) {
    return (
        <>
            <div
                className='mb-6'>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={video.withBezel}
                    onChange={(e) => updateVideo({ withBezel: e.target.checked })} />
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
                            border border-outline rounded-md
                            disabled:text-on-surface-container-muted bg-surface-container hover:bg-surface-dim-container'
                        tabIndex={0}
                        role='radio'
                        aria-checked={video.bezelKey === b.key}
                        onClick={() => updateVideo({ bezelKey: b.key })}
                        onKeyUp={(e) => e.key === 'Enter' && updateVideo({ bezelKey: b.key })}>
                        <h4
                            className='row-start-2 row-end-3 col-start-2 col-end-3 text-xs text-on-surface-container'>
                            {b.title}
                        </h4>
                        <div
                            className='row-start-1 row-end-2 col-start-1 col-end-3 justify-self-center
                            max-h-60 w-full h-full
                            bg-[linear-gradient(0deg,var(--secondary)_0%,var(--primary)_100%)]'
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
                                'rounded-full border border-outline',
                                video.bezelKey === b.key ?
                                    'bg-on-surface-container-muted before:content-[""] before:block before:w-2 before:h-2 before:aspect-square before:bg-white before:rounded-full' :
                                    'bg-surface-container')}>
                        </div>
                    </article>)}
            </div>
        </>
    )
}