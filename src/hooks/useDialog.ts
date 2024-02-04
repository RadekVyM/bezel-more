import { RefObject, useRef, useState } from 'react'

export default function useDialog(
    openAnimation: string,
    hideAnimation: string
):
    [RefObject<HTMLDialogElement>, boolean, string, () => void, () => void] {
    const [dialogAnimationClass, setDialogAnimationClass] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const showDialog = () => {
        setDialogAnimationClass(openAnimation);
        dialogRef.current?.showModal();
        setIsDialogOpen(true);
    }

    const hideDialog = () => {
        setDialogAnimationClass(hideAnimation);
        const timeout = setTimeout(() => {
            dialogRef.current?.close();
            setIsDialogOpen(false);
            clearTimeout(timeout);
        }, 150);
    }

    return [dialogRef, isDialogOpen, dialogAnimationClass, showDialog, hideDialog];
}