import { PREDEFINED_IMAGE_BACKGROUND_PATHS } from '../../../backgrounds'
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
                predefinedBackgrounds={getPredefinedBackgrounds()}
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

const predefinedBackgroundsCache: Array<ImageBackground> = [];

function getPredefinedBackgrounds() {
    if (predefinedBackgroundsCache.length === 0) {
        predefinedBackgroundsCache.push(...PREDEFINED_IMAGE_BACKGROUND_PATHS.map((p) => createImageBackground(p, true)));
    }

    return predefinedBackgroundsCache;
}