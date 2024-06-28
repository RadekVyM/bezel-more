import { ImageBackground, createImageBackground } from '../../../types/Background'
import ImageFileSelection from '../ImageFileSelection'
import BackgroundPreview from './BackgroundPreview'

type ImagePickerProps = {
    currentBackground: ImageBackground,
    onPick: (background: ImageBackground) => void,
}

export default function ImagePicker({ currentBackground, onPick }: ImagePickerProps) {
    return (
        <div
            className='flex flex-col gap-3'>
            <ImageFileSelection
                file={null}
                onFileSelect={(file) => file && onPick(createImageBackground(URL.createObjectURL(file)))}/>
            <BackgroundPreview
                canvasSize={1000}
                background={currentBackground} />
        </div>
    )
}