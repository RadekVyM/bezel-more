import { Video } from '../../types/Video'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'

type VideoTrimConfigurationProps = {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
}

export default function VideoTrimConfiguration({ className, video, updateVideo }: VideoTrimConfigurationProps) {
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
                max={video.totalDuration}
                value={video.startTime}
                onChange={(e) => updateVideo({ startTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={Math.max(video.startTime, 0)}
                max={video.totalDuration}
                value={video.endTime}
                onChange={(e) => updateVideo({ endTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='Scene offset'
                id='scene-offset'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                step={0.1}
                min={0}
                value={video.sceneOffset}
                onChange={(e) => updateVideo({ sceneOffset: parseFloat(e.target.value) })} />
        </div>
    )
}