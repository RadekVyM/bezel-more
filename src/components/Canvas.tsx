import { forwardRef, useEffect, useRef } from 'react'
import useDimensions from '../hooks/useDimensions'
import { cn } from '../utils/tailwind'

type CanvasProps = {
    className?: string,
    onDimensionsChanges?: (width: number, height: number) => void
} & React.ButtonHTMLAttributes<HTMLCanvasElement>

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({ className, onDimensionsChanges }, canvasRef) => {
    const outerDivRef = useRef<HTMLDivElement>(null);
    const { width, height } = useDimensions(outerDivRef);
    const ratio = Math.ceil(window?.devicePixelRatio || 1);

    useEffect(() => {
        onDimensionsChanges && onDimensionsChanges(width, height);
    }, [width, height]);

    return (
        <div
            ref={outerDivRef}
            className={cn('h-full w-full overflow-hidden', className)}>
            <canvas
                ref={canvasRef}
                className='h-full w-full'
                width={width * ratio}
                height={height * ratio} />
        </div>
    )
});

Canvas.displayName = 'Canvas';