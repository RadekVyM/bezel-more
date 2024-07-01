import { Background, ImageBackground, createImageBackground, imageBackgroundsEqual } from '../../../types/Background'
import CheckInput from '../CheckInput'
import CheckInputLabel from '../CheckInputLabel'
import ImageFileSelection from '../ImageFileSelection'
import BackgroundPreview from './BackgroundPreview'
import BackgroundsList from './BackgroundsList'

type ImagePickerProps = {
    currentBackground: ImageBackground,
    onPick: (background: Background) => void,
}

const PREDEFINED_IMAGE_BACKGROUNDS: Array<ImageBackground> = [
    createImageBackground('images/backgrounds/04.jpg', true),
    createImageBackground('images/backgrounds/07.jpg', true),
    createImageBackground('images/backgrounds/05.jpg', true),
    createImageBackground('images/backgrounds/01.jpg', true),
    createImageBackground('images/backgrounds/02.jpg', true),
    createImageBackground('images/backgrounds/03.jpg', true),
    createImageBackground('images/backgrounds/09.jpg', true),
    createImageBackground('images/backgrounds/08.jpg', true),
    createImageBackground('images/backgrounds/11.jpg', true),
    createImageBackground('images/backgrounds/13.jpg', true),
    createImageBackground('images/backgrounds/14.jpg', true),
    createImageBackground('images/backgrounds/15.jpg', true),
    createImageBackground('images/backgrounds/16.jpg', true),
    createImageBackground('images/backgrounds/17.jpg', true),
    createImageBackground('images/backgrounds/06.jpg', true),
    createImageBackground('images/backgrounds/10.jpg', true),
    createImageBackground('images/backgrounds/12.jpg', true),
];

export default function ImagePicker({ currentBackground, onPick }: ImagePickerProps) {
    return (
        <div
            className='flex flex-col gap-3'>
            <ImageFileSelection
                file={null}
                onFileSelect={(file) => file && onPick(createImageBackground(URL.createObjectURL(file), currentBackground.aspectFill))}/>
            <BackgroundPreview
                canvasSize={1000}
                background={currentBackground} />

            <div>
                <CheckInput
                    id='aspect-fill-checkbox'
                    className='rounded'
                    type='checkbox'
                    checked={currentBackground.aspectFill}
                    onChange={(e) => onPick(createImageBackground(currentBackground.image, e.currentTarget.checked))} />
                <CheckInputLabel htmlFor='aspect-fill-checkbox' className='pl-3'>Keep aspect ratio</CheckInputLabel>
            </div>

            <BackgroundsList
                backgrounds={[]}
                predefinedBackgrounds={PREDEFINED_IMAGE_BACKGROUNDS}
                backgroundsEqual={imageBackgroundsEqual}
                currentBackground={currentBackground}
                onPick={onPick}/>
            
            <span
                className='self-end text-xs text-on-surface-container-muted'>
                Images by <a className='text-secondary' href='https://www.freepik.com'>Freepik</a>
            </span>
        </div>
    )
}