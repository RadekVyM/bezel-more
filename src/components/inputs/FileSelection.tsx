import { useRef, useState } from 'react'
import Button from './Button'
import { cn } from '../../utils/tailwind'

type FileSelectionProps = {
    className?: string,
    children?: React.ReactNode,
    accept?: string,
    fileType?: string,
    onFileSelect: (file: File | null | undefined) => void,
}

export default function FileSelection({ className, children, accept, fileType, onFileSelect }: FileSelectionProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    function onDrop(e: React.DragEvent<HTMLElement>) {
        e.preventDefault();

        const file = getDragFile(e);

        if (file && (!fileType || file.type.startsWith(fileType))) {
            onFileSelect(file);
            if (inputRef.current) {
                inputRef.current.files = e.dataTransfer.files;
            }
        }
    }

    return (
        <>
            <Button
                className={cn('gap-2 px-3 py-1.5', isDragOver && 'bg-surface-dim-container', className)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}
                onPointerLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}>
                {children}
            </Button>

            <input
                ref={inputRef}
                type='file'
                accept={accept}
                className='hidden'
                onChange={(e) => {
                    const item = e.target.files?.item(0);

                    if (item) {
                        onFileSelect(item);
                    }
                }} />
        </>
    )
}

function getDragFile(e: React.DragEvent<HTMLElement>) {
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        if (item.kind === 'file') {
            return item.getAsFile();
        }
    }
    else if (e.dataTransfer.files.length > 0) {
        return e.dataTransfer.files[0];
    }
    return null;
}