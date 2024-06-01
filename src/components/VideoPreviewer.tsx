import { RefObject, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
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
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [duration, setDuration] = useState(0);
    const [time, setTime] = useState(0);
    const [isPuased, setIsPaused] = useState(true);
    const [loop, setLoop] = useState(false);

    return (
        <div
            className={cn('grid grid-rows-[1fr_auto] gap-6 overflow-hidden', className)}>
            <Video
                ref={videoRef}
                bezel={bezel}
                showBezel={showBezel}
                className='h-full row-start-1 row-end-2 col-start-1 col-end-1 w-full relative overflow-hidden'
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
    function onPlayClick() {
        isPuased ? videoRef.current?.play() : videoRef.current?.pause()
    }

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
                        onClick={onPlayClick}
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

const Video = forwardRef<HTMLVideoElement | null, VideoProps>(({ video, className, bezel, showBezel, onLoadedMetadata, onPlay, onTimeUpdate, ...rest }, ref) => {
    const fps = 60;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bezelRef = useRef<{ image: HTMLImageElement, maskImage: HTMLImageElement, bezel: Bezel, showBezel: boolean, dimensions: { width: number, height: number } } | null>(null);
    const lastRenderRef = useRef<Date>(new Date());
    const url = useMemo(() => URL.createObjectURL(video), [video]);
    const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
        const currentImageSrc = bezelImage(bezel.key);
        const currentMaskSrc = bezelMask(bezel.modelKey);

        if (bezelRef.current) {
            bezelRef.current.bezel = bezel;
            bezelRef.current.showBezel = showBezel;
            bezelRef.current.dimensions = {...dimensions};

            if (bezelRef.current.image.src !== currentImageSrc) {
                bezelRef.current.image = new Image(bezel.width, bezel.height);
                bezelRef.current.image.src = currentImageSrc;
                bezelRef.current.image.onload = () => renderVideo();
                bezelRef.current.maskImage = new Image(bezel.width, bezel.height);
                bezelRef.current.maskImage.src = currentMaskSrc;
                bezelRef.current.maskImage.onload = () => renderVideo();
            }
            else {
                renderVideo();
            }

            return;
        }

        const image = new Image(bezel.width, bezel.height);
        image.src = currentImageSrc;
        image.onload = () => renderVideo();

        const mask = new Image(bezel.width, bezel.height);
        mask.src = currentMaskSrc;
        mask.onload = () => renderVideo();

        bezelRef.current = {
            bezel,
            showBezel,
            image,
            maskImage: mask,
            dimensions: {...dimensions}
        };

        renderVideo();
    }, [bezel, showBezel, dimensions]);

    function renderVideo() {
        if (!videoRef.current || !canvasRef.current || !bezelRef.current) {
            return;
        }

        const factWidth = bezelRef.current.bezel.width / bezelRef.current.dimensions.width;
        const factHeight = bezelRef.current.bezel.height / bezelRef.current.dimensions.height;
        const scale = bezelRef.current.showBezel ?
            (bezelRef.current.bezel.contentScale * Math.min(factWidth, factHeight)) :
            1;

        const width = bezelRef.current.dimensions.width * scale;
        const height = bezelRef.current.dimensions.height * scale;
        const x = bezelRef.current.showBezel ? (bezelRef.current.bezel.width - width) / 2 : 0;
        const y = bezelRef.current.showBezel ? (bezelRef.current.bezel.height - height) / 2 : 0;

        const context = canvasRef.current.getContext('2d');

        context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // TOOD: This can probably be optimized (I do not have to create a new canvas) if I create another mask images with transparency
        const second = document.createElement('canvas');
        second.width = canvasRef.current.width;
        second.height = canvasRef.current.height;

        const secondContext = second.getContext('2d');

        if (bezelRef.current.showBezel) {
            secondContext?.drawImage(bezelRef.current.maskImage, 0, 0, bezelRef.current.maskImage.naturalWidth, bezelRef.current.maskImage.naturalHeight);
        }

        if (secondContext && context) {
            const imgData = secondContext.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

            for (let i = 0; i < imgData.data.length; i += 4)
            {
                // Make black pixels transparent
                const isBlack = (imgData.data[i + 0] === 0 && imgData.data[i + 1] === 0 && imgData.data[i + 2] === 0);

                imgData.data[i + 3] = isBlack ?
                    0 :
                    255;
                
                imgData.data[i + 0] = 0;
                imgData.data[i + 1] = 0;
                imgData.data[i + 2] = 0;
            }

            context.putImageData(imgData, 0, 0);
            context.globalCompositeOperation = 'source-atop';
        }

        context?.drawImage(videoRef.current, x, y, width, height);

        if (context) {
            context.globalCompositeOperation = 'source-over';
        }

        if (bezelRef.current.showBezel) {
            context?.drawImage(bezelRef.current.image, 0, 0, bezelRef.current.image.naturalWidth, bezelRef.current.image.naturalHeight);
        }
    }

    function renderVideoLoop() {
        renderVideo();

        if (!videoRef.current || !canvasRef.current || !bezelRef.current || videoRef.current?.paused || videoRef.current?.ended) {
            return;
        }

        const lastRenderMs = lastRenderRef.current.getTime();
        const nowMs = new Date().getTime();
        const difference = (1000 / fps) - (nowMs - lastRenderMs);
        
        lastRenderRef.current = new Date();

        if (difference > 0) {
            setTimeout(() => requestAnimationFrame(renderVideoLoop), difference);
        }
        else {
            requestAnimationFrame(renderVideoLoop);
        }
    }

    return (
        <div
            className={cn('h-full w-full relative', className)}>
            <video
                {...rest}
                ref={videoRef}
                onLoadedMetadata={(e) => {
                    setDimensions({ width: videoRef.current?.videoWidth || 1, height: videoRef.current?.videoHeight || 1, });
                    onLoadedMetadata && onLoadedMetadata(e);
                }}
                onPlay={(e) => {
                    renderVideoLoop();
                    onPlay && onPlay(e);
                }}
                onTimeUpdate={(e) => {
                    // This is needed to have seeking working
                    renderVideo();
                    onTimeUpdate && onTimeUpdate(e);
                }}
                disablePictureInPicture
                disableRemotePlayback
                muted
                playsInline
                preload='metadata'
                className='hidden'
                src={url}>
            </video>
            <canvas
                ref={canvasRef}
                className='max-h-full max-w-full m-auto'
                width={showBezel ? bezel.width : dimensions.width}
                height={showBezel ? bezel.height : dimensions.height}/>
        </div>
    )
});