import { forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../utils/tailwind'
import { Point } from '../types/Point'
import { useDebounceValue } from 'usehooks-ts'

type PopoverProps = {
    isDisplayed: boolean,
    position: Point,
    className?: string,
    children?: React.ReactNode,
    containerRef?: React.RefObject<HTMLDivElement>
}

const Popover = forwardRef<HTMLDivElement, PopoverProps>(({ isDisplayed, position, className, children, containerRef }, ref) => {
    const [debouncedIsDisplayed] = useDebounceValue(isDisplayed, 150);

    return (
        <>
            {(debouncedIsDisplayed || isDisplayed) && createPortal(
                <div
                    ref={ref}
                    style={{
                        top: position.y,
                        left: position.x
                    }}
                    className={cn(
                        'absolute bg-surface-container border border-outline rounded-lg shadow-lg',
                        isDisplayed ? 'animate-fadeIn' : 'animate-fadeOut',
                        className)}>
                    {children}
                </div>,
                containerRef?.current || document.getElementById('popover-container')!)}
        </>
    )
});

Popover.displayName = 'Popover';
export default Popover