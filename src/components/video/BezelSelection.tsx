import { BEZELS } from '../../bezels'
import { Video } from '../../types/Video'
import { cn } from '../../utils/tailwind'
import BezelThumbnail from '../BezelThumbnail'
import RadioCircle from '../RadioCircle'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'

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
                <legend id='bezel-selection-legend' className='block text-sm font-medium col-start-1 col-end-[-1] sr-only'>Bezel Type</legend>

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

                        <BezelThumbnail
                            className='row-start-1 row-end-2 col-start-1 col-end-3 max-h-60 w-full h-full'
                            bezelKey={b.key}
                            modelKey={b.modelKey}
                            bezelTitle={b.title} />

                        <RadioCircle
                            className='row-start-2 row-end-3 col-start-1 col-end-2'
                            checked={video.bezelKey === b.key} />
                    </article>)}
            </div>
        </>
    )
}