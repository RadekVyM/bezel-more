import { Video } from '../../types/Video'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'

export default function VideoTrimConfiguration(props: {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
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
                max={props.video.totalDuration}
                value={props.video.startTime}
                onChange={(e) => props.updateVideo({ startTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={Math.max(props.video.startTime, 0)}
                max={props.video.totalDuration}
                value={props.video.endTime}
                onChange={(e) => props.updateVideo({ endTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='Scene offset'
                id='scene-offset'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={0}
                value={props.video.sceneOffset}
                onChange={(e) => props.updateVideo({ sceneOffset: parseFloat(e.target.value) })} />
        </div>
    )
}