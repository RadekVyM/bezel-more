import { LuFileImage } from 'react-icons/lu'
import FileSelection from './FileSelection'

type ImageFileSelectionProps = {
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}

export default function ImageFileSelection({ file, onFileSelect }: ImageFileSelectionProps) {
    return (
        <FileSelection
            onFileSelect={onFileSelect}
            accept='image/*'>
            <LuFileImage
                className='w-4 h-4'/>
                {file?.name || 'Choose file'}
        </FileSelection>
    )
}