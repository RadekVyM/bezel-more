import { LuFileImage } from 'react-icons/lu'
import FileSelection from './FileSelection'

export default function ImageFileSelection(props: {
    file: File | null | undefined,
    onFileSelect: (file: File | null | undefined) => void,
}) {
    return (
        <FileSelection
            onFileSelect={props.onFileSelect}
            accept='image/*'>
            <LuFileImage
                className='w-4 h-4'/>
                {props.file?.name || 'Choose file'}
        </FileSelection>
    )
}