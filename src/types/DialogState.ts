import { RefObject } from 'react'

export type DialogState = {
    dialogRef: RefObject<HTMLDialogElement | null>,
    isOpen: boolean,
    animationClass: string,
    show: () => void,
    hide: () => void
}