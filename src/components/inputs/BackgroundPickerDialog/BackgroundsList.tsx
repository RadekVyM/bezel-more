import { MdClose } from 'react-icons/md'
import { Background } from '../../../types/Background'
import BackgroundCanvas from '../../BackgroundCanvas'
import { cn } from '../../../utils/tailwind'

type BackgroundsListProps = {
    className?: string,
    backgrounds: Array<Background>,
    predefinedBackgrounds: Array<Background>,
    currentBackground: Background,
    removeBackground?: (background: any) => void,
    onPick: (background: Background) => void,
    backgroundsEqual: (first: any, second: any) => boolean,
}

export default function BackgroundsList({ className, backgrounds, predefinedBackgrounds, currentBackground, onPick, backgroundsEqual, removeBackground }: BackgroundsListProps) {
    const allBackgrounds = [...predefinedBackgrounds.map((bg) => ({ bg, isPredefined: true })), ...backgrounds.map((bg) => ({ bg, isPredefined: false }))];

    return (
        <div
            className={cn('flex flex-wrap gap-2 isolate', className)}>
            {allBackgrounds.map((bg, index) => {
                const isSelected = backgroundsEqual(currentBackground, bg.bg);

                return (
                    <div
                        key={index}
                        className='relative'>
                        <div
                            className='grid w-8 h-8 rounded-xl shadow-md cursor-pointer peer'
                            tabIndex={0}
                            role='radio'
                            aria-checked={isSelected}
                            onClick={() => onPick(bg.bg)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(bg.bg)}>
                            <BackgroundCanvas
                                className='row-start-1 row-end-2 col-start1 col-end-2 w-full h-full checkered rounded-xl border border-outline overflow-hidden'
                                background={bg.bg}/>
                            {isSelected &&
                                <div
                                    className='row-start-1 row-end-2 col-start1 col-end-2 place-self-center w-4 h-4 rounded-md bg-white border border-outline shadow-md'/>}
                        </div>

                        {removeBackground && !bg.isPredefined &&
                            <button
                                className='opacity-0 peer-focus-within:opacity-100 peer-hover:opacity-100 hover:opacity-100 focus:opacity-100
                                    transition-opacity
                                    z-20 w-4 h-4 absolute right-[-15%] top-[-15%] grid place-content-center bg-danger rounded-md'
                                onClick={() => removeBackground(bg.bg)}>
                                <MdClose className='w-3 h-3 text-on-danger' />
                            </button>}
                    </div>
                )
            })}
        </div>
    )
}