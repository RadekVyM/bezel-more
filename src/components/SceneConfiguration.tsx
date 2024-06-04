import { Scene, getTotalSceneDuration } from '../types/Scene'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'

type SceneConfigurationProps = {
    scene: Scene,
    className?: string,
    updateScene: (scene: Partial<Scene>) => void,
}

export default function SceneConfiguration({ className, scene, updateScene }: SceneConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Start'
                id='start'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={0}
                max={getTotalSceneDuration(scene)}
                value={scene.startTime}
                onChange={(e) => updateScene({ startTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={Math.max(scene.startTime, 0)}
                value={scene.endTime}
                onChange={(e) => updateScene({ endTime: parseFloat(e.target.value) })} />
        </div>
    )
}