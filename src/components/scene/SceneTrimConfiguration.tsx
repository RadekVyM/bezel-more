import { VideoScene, getTotalSceneDuration } from '../../types/VideoScene'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'

type SceneTrimConfigurationProps = {
    scene: VideoScene,
    className?: string,
    updateScene: (scene: Partial<VideoScene>) => void,
}

export default function SceneTrimConfiguration({ className, scene, updateScene }: SceneTrimConfigurationProps) {
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