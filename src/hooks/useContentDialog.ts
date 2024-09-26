import useDialog from './useDialog'
import { DialogState } from '../types/DialogState'

export default function useContentDialog(slideInFromBottom?: boolean): DialogState {
    return useDialog(
        slideInFromBottom ? 'backdrop:animate-fadeIn animate-slideUpIn' : 'backdrop:animate-fadeIn animate-slideLeftIn',
        slideInFromBottom ? 'backdrop:animate-fadeOut animate-slideDownOut' : 'backdrop:animate-fadeOut animate-slideRightOut')
}