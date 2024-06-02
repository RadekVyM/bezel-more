import { Video } from '../types/Video'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'

type VideoSizeConfigurationProps = {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
}

export default function VideoSizeConfiguration({ className, video, updateVideo }: VideoSizeConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={video.requestedMaxSize}
                onChange={(e) => updateVideo({ requestedMaxSize: parseFloat(e.target.value) })} />
        </div>
    )
}