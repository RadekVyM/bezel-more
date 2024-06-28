import { FaSave } from 'react-icons/fa'
import { Background } from '../../../types/Background'
import BackgroundCanvas from '../../BackgroundCanvas'
import Button from '../Button'
import { cn } from '../../../utils/tailwind'

type BackgroundPreviewProps = {
    className?: string,
    background: Background,
    canvasSize?: number,
    onAddClick?: () => void
}

export default function BackgroundPreview({ className, background, canvasSize, onAddClick }: BackgroundPreviewProps) {
    return (
        <div
            className={cn('group relative', className)}>
            <BackgroundCanvas
                background={background}
                canvasSize={canvasSize}
                className='checkered w-full h-full rounded-[0.4rem] border border-outline'/>
            
            {onAddClick &&
                <Button
                    className='opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bottom-0 p-1 m-2'
                    onClick={onAddClick}>
                    <FaSave />
                </Button>}
        </div>
    )
}