import { useEffect, useRef, useState } from "react";
import { DialogState } from "../types/DialogState";

const ANIMATION_LENGTH = 150;

/**
 * A hook to manage the state and animations of a native HTML Dialog element.
 * Handles displaying, top-layer events, and CSS animation timing.
 */
export default function useDialog(
    openAnimation?: string,
    hideAnimation?: string
): DialogState {
    const [animationClass, setAnimationClass] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        }
        else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    function show(): Promise<void> {
        setAnimationClass(openAnimation || "backdrop:animate-fadeIn animate-slideUpIn");
        setIsOpen(true);
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                clearTimeout(timeout);
                resolve(undefined);
            }, ANIMATION_LENGTH);
        });
    }

    function hide(): Promise<void> {
        setAnimationClass(hideAnimation || "backdrop:animate-fadeOut animate-slideDownOut");
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                setIsOpen(false);
                clearTimeout(timeout);
                resolve(undefined);
            }, ANIMATION_LENGTH);
        });
    }

    return {
        dialogRef,
        animationClass,
        isOpen,
        show,
        hide
    };
}