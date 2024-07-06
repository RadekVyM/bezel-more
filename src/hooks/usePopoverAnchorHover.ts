import { PointerEvent, useCallback, useRef, useState } from 'react'
import { clamp } from '../utils/numbers'
import { Point } from '../types/Point'

export default function usePopoverAnchorHover(containerRef?: React.RefObject<HTMLDivElement>) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const onPointerMove = useCallback((e: PointerEvent<Element>) => {
        const container = containerRef?.current || document.getElementById('popover-container');
        setIsHovered(true);

        if (!popoverRef.current || !container) {
            return;
        }

        const popoverRect = popoverRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const idealX = mouseX;
        const idealY = mouseY - popoverRect.height;
        const x = clamp(idealX, 0, containerRect.width - popoverRect.width);
        const y = clamp(idealY, 0, containerRect.height - popoverRect.height);

        setPosition({ x, y });
    }, [setPosition, setIsHovered, popoverRef.current, containerRef?.current]);

    const onPointerLeave = useCallback((e: PointerEvent<Element>) => {
        setIsHovered(false);
    }, [setIsHovered]);

    return {
        popoverRef,
        position,
        isHovered,
        onPointerMove,
        onPointerLeave
    };
}