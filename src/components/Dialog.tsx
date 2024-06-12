import { createPortal } from 'react-dom'
import { forwardRef } from 'react'
import { cn } from '../utils/tailwind'

export type DialogProps = {
    animation: string,
    children?: React.ReactNode,
    className?: string
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(({ animation, className, children }, ref) => {
    return (
        createPortal(
            <dialog
                ref={ref}
                className={cn(className, animation, 'backdrop:bg-[rgba(15,23,42,0.5)] dark:backdrop:bg-[rgba(15,23,42,0.85)] border border-outline')}>
                {children}
            </dialog>,
            document.querySelector('body') as Element)
    )
});