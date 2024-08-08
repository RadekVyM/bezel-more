import { LuFileVideo } from 'react-icons/lu'
import FileSelection from './FileSelection'
import { cn } from '../../utils/tailwind'

type VideoFileSelectionProps = {
    className?: string,
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}

type LargeVideoFileSelectionProps = {
    label: string
} & VideoFileSelectionProps

export function VideoFileSelection({ className, file, onFileSelect }: VideoFileSelectionProps) {
    return (
        <FileSelection
            className={className}
            onFileSelect={onFileSelect}
            accept='video/*'
            fileType='video'>
            <LuFileVideo
                className='w-4 h-4'/>
            {file?.name || 'Choose file'}
        </FileSelection>
    )
}

export function LargeVideoFileSelection({ className, file, label, onFileSelect }: LargeVideoFileSelectionProps) {
    return (
        <FileSelection
            className={cn('grid-flow-row justify-items-center gap-y-4 p-12 border-dashed text-on-surface-container-muted hover:text-on-surface-container-muted', className)}
            onFileSelect={onFileSelect}
            accept='video/*'
            fileType='video'>
            <LuFileVideo
                className='w-10 h-10'/>
            <span className='font-semibold'>{file?.name || label}</span>
        </FileSelection>
    )
}