import { VideoScene, getTotalSceneDuration } from '../../types/VideoScene'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'

export default function SceneTrimConfiguration(props: {
    scene: VideoScene,
    className?: string,
    updateScene: (scene: Partial<VideoScene>) => void,
}) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', props.className)}>
            <NumberInput
                label='Start'
                id='start'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={0}
                max={getTotalSceneDuration(props.scene)}
                value={props.scene.startTime}
                onChange={(e) => props.updateScene({ startTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={Math.max(props.scene.startTime, 0)}
                value={props.scene.endTime}
                onChange={(e) => props.updateScene({ endTime: parseFloat(e.target.value) })} />
        </div>
    )
}