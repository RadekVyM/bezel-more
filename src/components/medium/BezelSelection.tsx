import { BEZELS } from '../../bezels'
import { Medium } from '../../types/Medium'
import { MediumOrientation } from '../../types/MediumOrientation'
import { cn } from '../../utils/tailwind'
import BezelThumbnail from '../BezelThumbnail'
import RadioCircle from '../RadioCircle'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'
import { BsPhone } from 'react-icons/bs'
import { LuCircleX } from 'react-icons/lu'
import { useMemo, useState } from 'react'

export default function BezelSelection(props: {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
}) {
    return (
        <>
            <div
                className='mb-6'>
                <CheckInput
                    id='use-bezel-check'
                    className='rounded'
                    type='checkbox'
                    defaultChecked={props.medium.withBezel}
                    onChange={(e) => props.updateMedium({ withBezel: e.target.checked })} />
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
                onCardClick={(o) => props.updateMedium({ orientation: o })}
                selectedKey={props.medium.orientation} />

            <h4 className='mb-2 font-semibold'>Bezel</h4>

            <BezelCardSelection
                medium={props.medium}
                updateMedium={props.updateMedium} />
        </>
    )
}

function BezelCardSelection(props: {
    medium: Medium,
    updateMedium: (medium: Partial<Medium>) => void,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const bezels = useMemo(() => {
        const terms = searchTerm
            .split(' ')
            .filter((t) => t.trim().length > 0)
            .map((t) => t.trim().toLowerCase());

        return terms.length > 0 ?
            Object.values(BEZELS).filter((b) => terms.every((t) => b.title.toLowerCase().includes(t))) :
            Object.values(BEZELS);
    }, [searchTerm]);

    return (
        <>
            <div
                className='
                    grid grid-cols-[1fr_auto] mb-4
                    border border-outline rounded-md bg-surface-container text-on-surface-container disabled:text-on-surface-muted overflow-clip
                    focus-within:outline focus-within:outline-2'>
                <input
                    className='border-0 px-2 py-1.5 border-transparent'
                    type='text'
                    placeholder='Search...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
                
                <button
                    className='px-2 text-on-surface-container hover:text-on-surface-container-muted'
                    onClick={() => setSearchTerm('')}>
                    <LuCircleX />
                </button>
            </div>

            <CardSelection
                className='grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]'
                id='bezel-selection'
                legend='Bezel Type'
                items={bezels}
                itemKey={(b) => b.key}
                itemTitle={(b) => b.title}
                itemContent={(b) => (
                    <BezelThumbnail
                        className='max-h-60 w-full h-full'
                        bezelKey={b.key}
                        modelKey={b.modelKey}
                        bezelTitle={b.title} />
                )}
                onCardClick={(b) => props.updateMedium({ bezelKey: b.key })}
                selectedKey={props.medium.bezelKey} />
        </>
    )
}

function CardSelection<T>(props: {
    items: Array<T>,
    className?: string,
    legend: string,
    id: string,
    selectedKey: string,
    onCardClick: (item: T) => void,
    itemTitle: (item: T) => string,
    itemKey: (item: T) => string,
    itemContent: (item: T) => React.ReactNode
}) {
    return (
        <div
            className={cn(props.className, 'grid gap-2')}
            aria-labelledby={`${props.id}-legend`}
            role='radiogroup'>
            <legend id={`${props.id}-legend`} className='block text-sm font-medium col-start-1 col-end-[-1] sr-only'>{props.legend}</legend>

            {props.items.map((item) =>
                <article
                    key={props.itemKey(item)}
                    className='p-4 w-full
                        grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-3 gap-y-5 items-center
                        cursor-pointer isolate
                        border border-outline rounded-md
                        disabled:text-on-surface-container-muted bg-surface-container hover:bg-surface-dim-container'
                    tabIndex={0}
                    role='radio'
                    aria-checked={props.selectedKey === props.itemKey(item)}
                    onClick={() => props.onCardClick(item)}
                    onKeyUp={(e) => e.key === 'Enter' && props.onCardClick(item)}>
                    <h5
                        className='row-start-2 row-end-3 col-start-2 col-end-3 text-xs text-on-surface-container'>
                        {props.itemTitle(item)}
                    </h5>

                    <div
                        className='row-start-1 row-end-2 col-start-1 col-end-3 w-full h-full'>
                        {props.itemContent(item)}
                    </div>

                    <RadioCircle
                        className='row-start-2 row-end-3 col-start-1 col-end-2'
                        checked={props.selectedKey === props.itemKey(item)} />
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