import { useEffect, useRef } from 'react'
import { Background } from '../types/Background'
import { drawBackground } from '../services/drawing/background'

type BackgroundCanvasProps = {
    background: Background,
    canvasSize?: number,
    className?: string
}

export default function BackgroundCanvas({ background, className, canvasSize }: BackgroundCanvasProps) {
    const size = canvasSize || 100;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');

        if (canvasRef.current && context) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            drawBackground(context, background, 0, 0, { width: size, height: size });
        }
    }, [background, size]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            height={size}
            width={size}/>
    )
}