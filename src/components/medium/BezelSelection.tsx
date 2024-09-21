import { BEZELS } from '../../bezels'
import { Medium } from '../../types/Medium'
import { MediumOrientation } from '../../types/MediumOrientation'
import { cn } from '../../utils/tailwind'
import BezelThumbnail from '../BezelThumbnail'
import RadioCircle from '../RadioCircle'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'
import { BsPhone } from 'react-icons/bs'

type BezelSelectionProps = {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
}

type CardSelectionProps<T> = {
    items: Array<T>,
    className?: string,
    legend: string,
    id: string,
    selectedKey: string,
    onCardClick: (item: T) => void,
    itemTitle: (item: T) => string,
    itemKey: (item: T) => string,
    itemContent: (item: T) => React.ReactNode
}

export default function BezelSelection({ medium, updateMedium }: BezelSelectionProps) {
    return (
        <>
            <div
                className='mb-6'>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={medium.withBezel}
                    onChange={(e) => updateMedium({ withBezel: e.target.checked })} />
                <CheckInputLabel htmlFor='use-bezel-check' className='pl-3'>Use bezel</CheckInputLabel>
            </div>

            <h4 className='mb-2 font-semibold'>Bezel orientation</h4>

            <CardSelection
                className='mb-6 grid-cols-[repeat(2,1fr)] 2xl:grid-cols-[repeat(4,1fr)]'
                id='orientation-selection'
                legend='Bezel Orientation'
                items={Object.values(MediumOrientation)}
                itemKey={(o) => o}
                itemTitle={(o) => orientationTitle(o)}
                itemContent={(o) => (
                    <BsPhone
                        className='w-10 h-10 m-auto'
                        style={{ transform: `translate(0, 0.25rem) rotate(${orientationAngle(o)}deg)` }} />
                )}
                onCardClick={(o) => updateMedium({ orientation: o })}
                selectedKey={medium.orientation} />

            <h4 className='mb-2 font-semibold'>Bezel</h4>

            <CardSelection
                className='grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]'
                id='bezel-selection'
                legend='Bezel Type'
                items={Object.values(BEZELS)}
                itemKey={(b) => b.key}
                itemTitle={(b) => b.title}
                itemContent={(b) => (
                    <BezelThumbnail
                        className='max-h-60 w-full h-full'
                        bezelKey={b.key}
                        modelKey={b.modelKey}
                        bezelTitle={b.title} />
                )}
                onCardClick={(b) => updateMedium({ bezelKey: b.key })}
                selectedKey={medium.bezelKey} />
        </>
    )
}

function CardSelection<T>({ className, legend, id, items, selectedKey, onCardClick, itemTitle, itemKey, itemContent }: CardSelectionProps<T>) {
    return (
        <div
            className={cn(className, 'grid gap-2')}
            aria-labelledby={`${id}-legend`}
            role='radiogroup'>
            <legend id={`${id}-legend`} className='block text-sm font-medium col-start-1 col-end-[-1] sr-only'>{legend}</legend>

            {items.map((item) =>
                <article
                    key={itemKey(item)}
                    className='p-4 w-full
                        grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-3 gap-y-5 items-center
                        cursor-pointer isolate
                        border border-outline rounded-md
                        disabled:text-on-surface-container-muted bg-surface-container hover:bg-surface-dim-container'
                    tabIndex={0}
                    role='radio'
                    aria-checked={selectedKey === itemKey(item)}
                    onClick={() => onCardClick(item)}
                    onKeyUp={(e) => e.key === 'Enter' && onCardClick(item)}>
                    <h5
                        className='row-start-2 row-end-3 col-start-2 col-end-3 text-xs text-on-surface-container'>
                        {itemTitle(item)}
                    </h5>

                    <div
                        className='row-start-1 row-end-2 col-start-1 col-end-3 w-full h-full'>
                        {itemContent(item)}
                    </div>

                    <RadioCircle
                        className='row-start-2 row-end-3 col-start-1 col-end-2'
                        checked={selectedKey === itemKey(item)} />
                </article>)}
        </div>
    )
}

function orientationTitle(orientation: MediumOrientation) {
    switch (orientation) {
        case MediumOrientation.topUp:
            return 'Top up';
        case MediumOrientation.bottomUp:
            return 'Bottom up';
        case MediumOrientation.leftUp:
            return 'Left up';
        case MediumOrientation.rightUp:
            return 'Right up';
    }
}

function orientationAngle(orientation: MediumOrientation) {
    switch (orientation) {
        case MediumOrientation.topUp:
            return 0;
        case MediumOrientation.bottomUp:
            return 180;
        case MediumOrientation.leftUp:
            return 90;
        case MediumOrientation.rightUp:
            return -90;
    }
}