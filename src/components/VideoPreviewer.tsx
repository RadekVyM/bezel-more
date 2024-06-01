import { RefObject, forwardRef, useMemo, useRef, useState } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop, TiArrowRight } from 'react-icons/ti'
import { Bezel, bezelImage, bezelMask } from '../bezels'
import { cn } from '../utils/tailwind'
import Button from './Button'
import { useElementSize } from 'usehooks-ts'
import { getBezelSize } from '../utils/size'

type VideoPreviewerPorps = {
    showBezel: boolean,
    bezel: Bezel,
    video: File | null | undefined,
    className?: string,
    onDurationLoad: (duration: number) => void
}

type VideoPlayerProps = {
    showBezel: boolean,
    bezel: Bezel,
    video: File,
    className?: string,
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
    isPuased: boolean,
    loop: boolean,
    switchLoop: () => void
}

export default function VideoPreviewer({ video, bezel, showBezel, className, onDurationLoad }: VideoPreviewerPorps) {
    const withVideo = !!video;

    return withVideo ?
        <VideoPlayer
            bezel={bezel}
            showBezel={showBezel}
            video={video}
            className={className}
            onDurationLoad={onDurationLoad} /> :
        <div
            className={cn('grid place-content-center justify-items-center text-on-surface-container-muted', className)}>
            <MdOutlineUploadFile
                className='w-8 h-8 mb-4' />
            <p
                className='mb-2 text-sm'>
                No video uploaded
            </p>
        </div>
}

function VideoPlayer({ className, video, bezel, showBezel, onDurationLoad }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [duration, setDuration] = useState(0);
    const [time, setTime] = useState(0);
    const [isPuased, setIsPaused] = useState(true);
    const [loop, setLoop] = useState(false);

    return (
        <div
            className={cn('grid grid-rows-[1fr_auto] gap-6', className)}>
            <Video
                ref={videoRef}
                bezel={bezel}
                showBezel={showBezel}
                className='h-full row-start-1 row-end-2 w-full relative pb-5'
                video={video}
                loop={loop}
                onTimeUpdate={() => setTime(videoRef.current?.currentTime || 0)}
                onPause={() => setIsPaused(videoRef.current?.paused === true)}
                onPlay={() => setIsPaused(videoRef.current?.paused === true)}
                onPlaying={() => setIsPaused(videoRef.current?.paused === true)}
                onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
                onLoadedMetadata={(e) => {
                    const currentDuration = videoRef.current?.duration || 0;
                    onDurationLoad(currentDuration);
                    setIsPaused(videoRef.current?.paused === true);
                }} />
            <VideoControls
                videoRef={videoRef}
                duration={duration}
                isPuased={isPuased}
                time={time}
                loop={loop}
                switchLoop={() => setLoop((oldLoop) => !oldLoop)} />
        </div>
    )
}

function VideoControls({ className, videoRef, duration, time, isPuased, loop, switchLoop }: VideoControlsProps) {
    return (
        <div
            className={cn(className, 'flex flex-col gap-2')}>
            <div
                className='grid gap-3 grid-cols-2'>
                <div
                    className='flex gap-3 self-center justify-self-end'>
                    <Button
                        className='px-0 py-1 w-10'
                        onClick={switchLoop}
                        title='Loop'>
                        {
                            loop ?
                                <TiArrowLoop className='w-6 h-6 mx-auto' /> :
                                <TiArrowRight className='w-6 h-6 mx-auto' />
                        }
                    </Button>
                    <Button
                        className='px-0 py-1 w-10'
                        onClick={() => isPuased ? videoRef.current?.play() : videoRef.current?.pause()}
                        title='Play/Pause'>
                        {isPuased ? <FaPlay className='mx-auto' /> : <FaPause className='mx-auto' />}
                    </Button>
                </div>
                <span className='self-center'>{time.toFixed(2)} / {duration.toFixed(2)}</span>
            </div>
            <input
                className='accent-on-surface-container'
                type='range'
                min={0}
                max={duration}
                step={0.001}
                value={time}
                onChange={(e) => {
                    if (videoRef.current) {
                        videoRef.current.currentTime = parseFloat(e.target.value);
                    }
                }} />
        </div>
    )
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(({ video, className, bezel, showBezel, ...rest }, ref) => {
    const url = useMemo(() => URL.createObjectURL(video), [video]);
    const [containerRef, containerSize] = useElementSize();
    const [width, height] = getSize(bezel, containerSize);

    return (
        <div
            className={className}>
            <div
                ref={containerRef}
                className={cn('h-full w-full relative', showBezel && 'bg-black')}
                style={showBezel ? {
                    maskImage: `url("${bezelMask(bezel.modelKey)}")`,
                    WebkitMaskImage: `url("${bezelMask(bezel.modelKey)}")`,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                    maskMode: 'luminance'
                } : undefined}>
                <video
                    {...rest}
                    ref={ref}
                    disablePictureInPicture
                    disableRemotePlayback
                    muted
                    playsInline
                    preload='metadata'
                    className='absolute inset-0 max-w-full max-h-full m-auto object-fit'
                    style={showBezel ? { scale: `${bezel.contentScale}`, width: width, height: height } : undefined}
                    width={showBezel ? width : undefined}
                    height={showBezel ? height : undefined}
                    src={url}>
                </video>
                {
                    showBezel &&
                    <img
                        src={bezelImage(bezel.key)}
                        alt='Bezel'
                        aria-hidden
                        className='absolute inset-0 max-w-full max-h-full m-auto object-contain'
                        style={{ width: width, height: height }}
                        width={showBezel ? width : undefined}
                        height={showBezel ? height : undefined} />
                }
            </div>
        </div>
    )
});

function getSize(bezel: Bezel, size: { width: number, height: number }): [number, number] {
    const bezelScale = bezel.width / bezel.height;
    const sizes = bezelScale > size.width / size.height ?
        size.width / bezelScale :
        size.height;

    return getBezelSize(bezel, sizes)
}