import { useRef } from 'react'
import Button from './Button'
import { cn } from '../../utils/tailwind'

type FileSelectionProps = {
    className?: string,
    children?: React.ReactNode,
    accept?: string,
    onFileSelect: (file: File | null | undefined) => void,
}

export default function FileSelection({ className, children, accept, onFileSelect }: FileSelectionProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button
                className={cn('flex gap-2 items-center px-3 py-1.5', className)}
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