import { LuFileVideo } from 'react-icons/lu'
import FileSelection from './FileSelection'
import { cn } from '../../utils/tailwind'

type MediumFileSelectionProps = {
    className?: string,
    file: File | null | undefined,
    mediumType: 'video' | 'image',
    onFileSelect: (file: File | null | undefined) => void,
}

type LargeVideoFileSelectionProps = {
    label: string
} & MediumFileSelectionProps

export function MediumFileSelection({ className, file, mediumType, onFileSelect }: MediumFileSelectionProps) {
    return (
        <FileSelection
            className={className}
            onFileSelect={onFileSelect}
            accept={getAcceptString(mediumType)}
            fileType={getFileTypeString(mediumType)}>
            <LuFileVideo
                className='w-4 h-4'/>
            {file?.name || 'Choose file'}
        </FileSelection>
    )
}

export function LargeVideoFileSelection({ className, file, label, mediumType, onFileSelect }: LargeVideoFileSelectionProps) {
    return (
        <FileSelection
            className={cn('grid-flow-row justify-items-center gap-y-4 p-12 border-dashed text-on-surface-container-muted hover:text-on-surface-container-muted', className)}
            onFileSelect={onFileSelect}
            accept={getAcceptString(mediumType)}
            fileType={getFileTypeString(mediumType)}>
            <LuFileVideo
                className='w-10 h-10'/>
            <span className='font-semibold'>{file?.name || label}</span>
        </FileSelection>
    )
}

function getAcceptString(mediumType: 'video' | 'image') {
    return mediumType === 'video' ?
        'video/*' :
        'image/*';
}

function getFileTypeString(mediumType: 'video' | 'image') {
    return mediumType;
}