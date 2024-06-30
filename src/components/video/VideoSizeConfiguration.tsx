import { Video } from '../../types/Video'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'

type VideoSizeConfigurationProps = {
    video: Video,
    updateVideo: (video: Partial<Video>) => void,
    className?: string
}

export default function VideoSizeConfiguration({ video, className, updateVideo }: VideoSizeConfigurationProps) {
    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <NumberInput
                label='Corner radius'
                id='video-corner-radius'
                unit='px'
                inputClassName='pr-8'
                min={0}
                value={video.cornerRadius}
                onChange={(e) => updateVideo({ cornerRadius: parseFloat(e.target.value) })} />
        </div>
    )
}