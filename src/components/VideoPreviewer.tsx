import { RefObject, forwardRef, useMemo, useRef, useState } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop } from 'react-icons/ti'
import ContentContainer from './ContentContainer'
import { Bezel, bezelImage } from '../bezels'
import { cn } from '../utils/tailwind'
import Button from './Button'

type VideoLoaderPorps = {
    showBezel: boolean,
    bezel: Bezel,
    video: File | null | undefined,
    setVideo: (video: File | null | undefined) => void,
    onDurationLoad: (duration: number) => void
}

type VideoPlayerProps = {
    showBezel: boolean,
    bezel: Bezel,
    video: File,
    onDurationLoad: (duration: number) => void
}

type VideoProps = {
    showBezel: boolean,
    bezel: Bezel,
    className?: string,
    video: File
} & React.VideoHTMLAttributes<HTMLVideoElement>

type VideoControlsProps = {
    className?: string,
    videoRef: RefObject<HTMLVideoElement | null>,
    duration: number,
    time: number,
    isPuased: boolean
}

export default function VideoPreviewer({ video, bezel, showBezel, setVideo, onDurationLoad }: VideoLoaderPorps) {
    const withVideo = !!video;

    return (
        <div
            className={`grid gap-6 ${withVideo ? 'grid-rows-[1fr_auto_auto]' : ''}`}>
            <div
                className={withVideo ?
                    '' :
                    'grid'}>
                {
                    !withVideo &&
                    <ContentContainer
                        className='dropzone-file-area row-start-1 row-end-2 col-start-1 col-end-2
                            flex flex-col items-center justify-center
                            pt-5 pb-6 w-full cursor-pointer'>
                        <MdOutlineUploadFile
                            className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400' />
                        <p
                            className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                            <span className='font-semibold'>Click to upload</span> or drag and drop
                        </p>
                    </ContentContainer>
                }
                <input
                    type='file'
                    accept='video/*'
                    className={withVideo ?
                        `block w-full text-sm text-gray-600 dark:text-gray-400
                        file:mr-4 file:py-1 file:px-3
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:cursor-pointer
                        file:bg-black file:text-white dark:file:bg-gray-50 dark:file:text-black
                        hover:file:bg-gray-800 dark:hover:file:bg-gray-200` :
                        'dropzone-file-input row-start-1 row-end-2 col-start-1 col-end-2 rounded-lg opacity-0 cursor-pointer'}
                    onChange={(e) => {
                        const item = e.target.files?.item(0);

                        if (item) {
                            setVideo(item);
                        }
                    }} />
            </div>

            {
                withVideo &&
                <VideoPlayer
                    bezel={bezel}
                    showBezel={showBezel}
                    video={video}
                    onDurationLoad={onDurationLoad} />
            }
        </div>
    )
}

function VideoPlayer({ video, bezel, showBezel, onDurationLoad }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [duration, setDuration] = useState(0);
    const [time, setTime] = useState(0);
    const [isPuased, setIsPaused] = useState(true);

    return (
        <>
            <Video
                ref={videoRef}
                bezel={bezel}
                showBezel={showBezel}
                className='h-full row-start-1 row-end-2 w-full relative'
                video={video}
                onTimeUpdate={() => setTime(videoRef.current?.currentTime || 0)}
                onPause={() => setIsPaused(videoRef.current?.paused === true)}
                onPlay={() => setIsPaused(videoRef.current?.paused === true)}
                onPlaying={() => setIsPaused(videoRef.current?.paused === true)}
                onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                onLoadedMetadata={(e) => {
                    const currentDuration = videoRef.current?.duration || 0;
                    onDurationLoad(currentDuration);
                }} />
            <VideoControls
                videoRef={videoRef}
                duration={duration}
                isPuased={isPuased}
                time={time}
                className='mb-6' />
        </>
    )
}

function VideoControls({ className, videoRef, duration, time, isPuased }: VideoControlsProps) {
    return (
        <div
            className={cn(className, 'flex flex-col gap-2')}>
            <div
                className='grid gap-3 grid-cols-2'>
                <div
                    className='flex gap-3 self-center justify-self-end'>
                    <Button
                        className='px-0 py-1 w-10'>
                        <TiArrowLoop className='w-6 h-6 mx-auto' />
                    </Button>
                    <Button
                        className='px-0 py-1 w-10'
                        onClick={() => isPuased ? videoRef.current?.play() : videoRef.current?.pause()}>
                        {isPuased ? <FaPlay className='mx-auto' /> : <FaPause className='mx-auto' />}
                    </Button>
                </div>
                <span className='self-center'>{time.toFixed(2)} / {duration.toFixed(2)}</span>
            </div>
            <input
                type='range'
                min={0}
                max={duration}
                step={0.001}
                value={time}
                onChange={(e) => {
                    if (videoRef.current) {
                        console.log(e.target.value);
                        videoRef.current.currentTime = parseFloat(e.target.value);
                    }
                }} />
        </div>
    )
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(({ video, className, bezel, showBezel, ...rest }, ref) => {
    const url = useMemo(() => URL.createObjectURL(video), [video]);

    return (
        <ContentContainer
            className={cn(className, 'p-5')}>
            <div
                className='h-full w-full relative'>
                <video
                    {...rest}
                    ref={ref}
                    preload='metadata'
                    className='rounded-lg absolute inset-0 max-h-full max-w-full m-auto'
                    style={{ scale: showBezel ? `${bezel.contentScale}` : undefined, aspectRatio: showBezel ? bezel.width / bezel.height : undefined }}
                    width={showBezel ? bezel.width : undefined}
                    height={showBezel ? bezel.height : undefined}
                    src={url}>
                </video>
                {
                    showBezel &&
                    <img
                        src={bezelImage(bezel.key)}
                        className='absolute inset-0 max-h-full max-w-full m-auto object-contain' />
                }
            </div>
        </ContentContainer>
    )
});