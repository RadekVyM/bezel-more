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

type ConversionConfigurationProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

type VideoInputsProps = {
    scene: VideoScene,
    updateScene: (scene: Partial<VideoScene>) => void,
    className?: string
}

type FormatSelectionProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function ConversionConfiguration({
    scene,
    updateScene,
    className
}: ConversionConfigurationProps) {
    return (
        <div
            className={cn('flex flex-col gap-4', className)}>
            <FormatSelection
                scene={scene}
                updateScene={updateScene} />
            {scene.sceneType === 'video' &&
                <VideoInputs
                    scene={scene}
                    updateScene={updateScene} />}
        </div>
    )
}

function VideoInputs({ className, updateScene, scene }: VideoInputsProps) {
    const prerenderingPopoverState = usePopoverAnchorHover();

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='FPS'
                id='fps'
                min={5} max={60} step={1}
                value={scene.fps}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => updateScene({ fps: parseFloat(e.target.value) })} />
            <NumberInput
                label='Max colors'
                id='max-colors'
                min={32} max={255} step={1}
                value={scene.maxColors}
                disabled={scene.formatKey !== supportedVideoFormats.gif.key}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => updateScene({ maxColors: parseFloat(e.target.value) })} />

            <div
                className='w-fit sm:col-span-2'>
                <CheckInput
                    id='use-canvas-checkbox'
                    className='rounded'
                    type='checkbox'
                    checked={!!scene.useCanvas}
                    onChange={(e) => updateScene({ useCanvas: e.currentTarget.checked })} />
                <CheckInputLabel htmlFor='use-canvas-checkbox' className='pl-3'>Use canvas <span className='text-xs text-on-surface-container-muted'>(experimental)</span></CheckInputLabel>
            </div>
            
            {!scene.useCanvas &&
                <>
                    <div
                        className='w-fit sm:col-span-2'>
                        <CheckInput
                            id='prerendering-checkbox'
                            className='rounded'
                            type='checkbox'
                            checked={scene.isPrerenderingEnabled}
                            onChange={(e) => updateScene({ isPrerenderingEnabled: e.currentTarget.checked })} />
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
        </div>
    )
}

function FormatSelection({ className, updateScene, scene }: FormatSelectionProps) {
    const formats = scene.sceneType === 'video' ?
        supportedVideoFormats :
        supportedImageFormats;

    return (
        <fieldset
            className={className}>
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
                        checked={scene.formatKey === f.key}
                        onChange={(e) => updateScene({ formatKey: e.currentTarget.value as SupportedVideoFormat })} />
                    <CheckInputLabel
                        htmlFor={f.key}>
                        {f.title}
                    </CheckInputLabel>
                </div>)}
        </fieldset>
    )
}