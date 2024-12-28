import { FaSave } from 'react-icons/fa'
import { Background } from '../../../types/Background'
import BackgroundCanvas from '../../BackgroundCanvas'
import Button from '../Button'
import { cn } from '../../../utils/tailwind'

export default function BackgroundPreview(props: {
    className?: string,
    background: Background,
    canvasSize?: number,
    onAddClick?: () => void
}) {
    return (
        <div
            className={cn('group relative', props.className)}>
            <BackgroundCanvas
                background={props.background}
                canvasSize={props.canvasSize}
                className='checkered w-full h-full rounded-[0.4rem] border border-outline'/>

            {props.onAddClick &&
                <Button
                    className='opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bottom-0 p-1 m-2'
                    onClick={props.onAddClick}>
                    <FaSave />
                </Button>}
        </div>
    )
}