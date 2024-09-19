import { getMaxPadding } from '../../types/DrawableScene'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'
import { Scene } from '../../types/Scene'

type SceneSizeConfigurationProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function SceneSizeConfiguration({ className, scene, updateScene }: SceneSizeConfigurationProps) {
    const maxPadding = getMaxPadding(scene);

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Horizontal padding'
                id='horizontal-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={scene.horizontalPadding}
                onChange={(e) => updateScene({ horizontalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Vertical padding'
                id='vertical-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={scene.verticalPadding}
                onChange={(e) => updateScene({ verticalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={scene.requestedMaxSize}
                onChange={(e) => updateScene({ requestedMaxSize: parseFloat(e.target.value) })} />
            {scene.media.length > 1 &&
                <NumberInput
                    label='Spacing'
                    id='spacing'
                    unit='px'
                    inputClassName='pr-8'
                    min={1}
                    value={scene.horizontalSpacing}
                    onChange={(e) => updateScene({ horizontalSpacing: parseFloat(e.target.value) })} />}
        </div>
    )
}