import { RefObject } from 'react'
import useDialog from './useDialog'

export default function useContentDialog(slideInFromBottom?: boolean):
    [RefObject<HTMLDialogElement>, boolean, string, () => void, () => void] {
    return useDialog(
        slideInFromBottom ? 'backdrop:animate-fadeIn animate-slideUpIn' : 'backdrop:animate-fadeIn animate-slideLeftIn',
        slideInFromBottom ? 'backdrop:animate-fadeOut animate-slideDownOut' : 'backdrop:animate-fadeOut animate-slideRightOut')
}