import NumberInput from '../inputs/NumberInput'
import CheckInput from '../inputs/CheckInput'
import CheckInputLabel from '../inputs/CheckInputLabel'
import { supportedImageFormats, SupportedVideoFormat, supportedVideoFormats } from '../../supportedFormats'
import { cn } from '../../utils/tailwind'
import { VideoScene } from '../../types/VideoScene'
import usePopoverAnchorHover from '../../hooks/usePopoverAnchorHover'
import Popover from '../Popover'
import { FaQuestionCircle } from 'react-icons/fa'
import { Scene } from '../../types/Scene'

export default function ConversionConfiguration(props: {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}) {
    return (
        <div
            className={cn('flex flex-col gap-4', props.className)}>
            <FormatSelection
                scene={props.scene}
                updateScene={props.updateScene} />
            {props.scene.sceneType === 'video' &&
                <VideoInputs
                    scene={props.scene}
                    updateScene={props.updateScene} />}
        </div>
    )
}

function VideoInputs(props: {
    scene: VideoScene,
    updateScene: (scene: Partial<VideoScene>) => void,
    className?: string
}) {
    const prerenderingPopoverState = usePopoverAnchorHover();

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', props.className)}>
            <NumberInput
                label='FPS'
                id='fps'
                min={5} max={60} step={1}
                value={props.scene.fps}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => props.updateScene({ fps: parseFloat(e.target.value) })} />
            <NumberInput
                label='Max colors'
                id='max-colors'
                min={32} max={255} step={1}
                value={props.scene.maxColors}
                disabled={props.scene.formatKey !== supportedVideoFormats.gif.key}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => props.updateScene({ maxColors: parseFloat(e.target.value) })} />

            <div
                className='w-fit sm:col-span-2'>
                <CheckInput
                    id='use-canvas-checkbox'
                    className='rounded'
                    type='checkbox'
                    checked={!!props.scene.useCanvas}
                    onChange={(e) => props.updateScene({ useCanvas: e.currentTarget.checked })} />
                <CheckInputLabel htmlFor='use-canvas-checkbox' className='pl-3'>
                    Use canvas <span className='text-xs text-on-surface-container-muted'>(experimental)</span>
                </CheckInputLabel>
            </div>

            {!props.scene.useCanvas &&
                <>
                    <div
                        className='w-fit sm:col-span-2'>
                        <CheckInput
                            id='prerendering-checkbox'
                            className='rounded'
                            type='checkbox'
                            checked={props.scene.isPrerenderingEnabled}
                            onChange={(e) => props.updateScene({ isPrerenderingEnabled: e.currentTarget.checked })} />
                        <CheckInputLabel htmlFor='prerendering-checkbox' className='pl-3'>Use prerendering</CheckInputLabel>
                        <FaQuestionCircle
                            className='inline-block ml-2 w-[0.85rem] h-[0.85rem] text-on-surface-container'
                            onPointerMove={prerenderingPopoverState.onPointerMove}
                            onPointerLeave={prerenderingPopoverState.onPointerLeave} />
                    </div>

                    <Popover
                        ref={prerenderingPopoverState.popoverRef}
                        isDisplayed={prerenderingPopoverState.isHovered}
                        position={prerenderingPopoverState.position}
                        className='py-1.5 px-2 max-w-64 text-xs'>
                        If checked, all input videos will be rendered first and then combined into the final result.
                        This ensures that there are no missing frames and leads to the expected result. However, it takes much longer to render the video.
                    </Popover>
                </>}
                
            <div
                className='w-fit sm:col-span-2'>
                <CheckInput
                    id='use-unpkg-checkbox'
                    className='rounded'
                    type='checkbox'
                    checked={!!props.scene.useUnpkg}
                    onChange={(e) => props.updateScene({ useUnpkg: e.currentTarget.checked })} />
                <CheckInputLabel htmlFor='use-unpkg-checkbox' className='pl-3'>
                    Download ffmpeg from unpkg
                </CheckInputLabel>
            </div>
        </div>
    )
}

function FormatSelection(props: {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}) {
    const formats = props.scene.sceneType === 'video' ?
        supportedVideoFormats :
        supportedImageFormats;

    return (
        <fieldset
            className={props.className}>
            <legend className='block text-sm font-medium mb-2'>Output format</legend>

            {Object.values(formats).map(f =>
                <div
                    key={f.key}
                    className='mb-2'>
                    <CheckInput
                        type='radio'
                        name='format'
                        id={f.key}
                        value={f.key}
                        checked={props.scene.formatKey === f.key}
                        onChange={(e) => props.updateScene({ formatKey: e.currentTarget.value as SupportedVideoFormat })} />
                    <CheckInputLabel
                        htmlFor={f.key}>
                        {f.title}
                    </CheckInputLabel>
                </div>)}
        </fieldset>
    )
}