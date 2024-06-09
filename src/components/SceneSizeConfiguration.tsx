import { Scene } from '../types/Scene'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'

type SceneSizeConfigurationProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function SceneSizeConfiguration({ className, scene, updateScene }: SceneSizeConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={scene.requestedMaxSize}
                onChange={(e) => updateScene({ requestedMaxSize: parseFloat(e.target.value) })} />
        </div>
    )
}