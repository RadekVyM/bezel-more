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

export function MediumFileSelection(props: MediumFileSelectionProps) {
    return (
        <FileSelection
            className={props.className}
            onFileSelect={props.onFileSelect}
            accept={getAcceptString(props.mediumType)}
            fileType={getFileTypeString(props.mediumType)}>
            <LuFileVideo
                className='w-4 h-4'/>
            {props.file?.name || 'Choose file'}
        </FileSelection>
    )
}

export function LargeVideoFileSelection(props: LargeVideoFileSelectionProps) {
    return (
        <FileSelection
            className={cn('grid-flow-row justify-items-center gap-y-4 p-12 border-dashed text-on-surface-container-muted hover:text-on-surface-container-muted', props.className)}
            onFileSelect={props.onFileSelect}
            accept={getAcceptString(props.mediumType)}
            fileType={getFileTypeString(props.mediumType)}>
            <LuFileVideo
                className='w-10 h-10'/>
            <span className='font-semibold'>{props.file?.name || props.label}</span>
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