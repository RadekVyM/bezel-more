import { LuFileVideo } from 'react-icons/lu'
import FileSelection from './FileSelection'

type VideoFileSelectionProps = {
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}

export default function VideoFileSelection({ file, onFileSelect }: VideoFileSelectionProps) {
    return (
        <FileSelection
            onFileSelect={onFileSelect}
            accept='video/*'>
            <LuFileVideo
                className='w-4 h-4'/>
                {file?.name || 'Choose file'}
        </FileSelection>
    )
}