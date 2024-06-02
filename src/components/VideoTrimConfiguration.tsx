import { Video } from '../types/Video'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'

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
                min={0} step={0.1}
                value={video.startTime}
                onChange={(e) => updateVideo({ startTime: parseFloat(e.target.value) })} />
            <NumberInput
                label='End'
                id='end'
                unit='seconds'
                inputClassName='pr-[4.5rem]'
                min={0} step={0.1}
                value={video.endTime}
                onChange={(e) => updateVideo({ endTime: parseFloat(e.target.value) })} />
        </div>
    )
}