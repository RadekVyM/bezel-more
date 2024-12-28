import { useEffect, useRef } from 'react'
import { Background } from '../types/Background'
import { drawBackground } from '../services/drawing/background'

export default function BackgroundCanvas(props: {
    background: Background,
    canvasSize?: number,
    className?: string
}) {
    const size = props.canvasSize || 100;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');

        if (canvasRef.current && context) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            drawBackground(context, props.background, 0, 0, { width: size, height: size });
        }
    }, [props.background, size]);

    return (
        <canvas
            ref={canvasRef}
            className={props.className}
            height={size}
            width={size}/>
    )
}