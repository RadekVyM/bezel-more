import { createPortal } from 'react-dom'
import { forwardRef } from 'react'
import { cn } from '../utils/tailwind'
import { DialogState } from '../types/DialogState'

export type DialogProps = {
    state: DialogState,
    children?: React.ReactNode,
    className?: string,
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(({ state, className, children }, ref) => {
    return (
        createPortal(
            state.isOpen &&
            <dialog
                ref={ref}
                onCancel={(e) => {
                    e.preventDefault();
                    state.hide();
                }}
                className={cn(className, state.animationClass, 'backdrop:bg-[rgba(15,23,42,0.5)] dark:backdrop:bg-[rgba(15,23,42,0.85)] border border-outline')}>
                {children}
            </dialog>,
            document.querySelector('body') as Element)
    )
});

Dialog.displayName = 'Dialog';