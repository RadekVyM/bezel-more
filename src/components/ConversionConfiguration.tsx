import NumberInput from './NumberInput'
import CheckInput from './CheckInput'
import CheckInputLabel from './CheckInputLabel'
import { SupportedFormat, supportedFormats } from '../supportedFormats'
import { cn } from '../utils/tailwind'
import { Scene } from '../types/Scene'

type ConversionConfigurationProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

type NumberInputsProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
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
            <NumberInputs
                scene={scene}
                updateScene={updateScene} />

            <FormatSelection
                scene={scene}
                updateScene={updateScene} />
        </div>
    )
}

function NumberInputs({ className, updateScene, scene }: NumberInputsProps) {
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
                label='Max Colors'
                id='max-colors'
                min={32} max={255} step={1}
                value={scene.maxColors}
                disabled={scene.formatKey === supportedFormats.webp.key}
                onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
                onChange={(e) => updateScene({ maxColors: parseFloat(e.target.value) })} />
        </div>
    )
}

function FormatSelection({ className, updateScene, scene }: FormatSelectionProps) {
    return (
        <fieldset
            className={className}>
            <legend className='block text-sm font-medium mb-2'>Output Format</legend>

            {Object.values(supportedFormats).map(f =>
                <div
                    key={f.key}
                    className='mb-2'>
                    <CheckInput
                        type='radio'
                        name='format'
                        id={f.key}
                        value={f.key}
                        checked={scene.formatKey === f.key}
                        onChange={(e) => updateScene({ formatKey: e.currentTarget.value as SupportedFormat })} />
                    <CheckInputLabel
                        htmlFor={f.key}>
                        {f.title}
                    </CheckInputLabel>
                </div>)}
        </fieldset>
    )
}