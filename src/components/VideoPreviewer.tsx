import { useEffect, useRef, useState } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop, TiArrowRight } from 'react-icons/ti'
import { bezelImage, bezelTransparentMask, getBezel } from '../bezels'
import { cn } from '../utils/tailwind'
import Button from './Button'
import { Bezel } from '../types/Bezel'
import { Scene, getFirstVideo } from '../types/Scene'
import { Video } from '../types/Video'

type VideoPreviewerPorps = {
    scene: Scene,
    className?: string
}

type VideoPlayerProps = {
    video: Video,
    className?: string,
}

type VideoCanvasProps = {
    video: Video,
    className?: string,
    onTimeUpdate: () => void,
    onPause: () => void,
    onPlay: () => void,
    onPlaying: () => void,
}

type VideoControlsProps = {
    className?: string,
    video: Video,
    time: number,
    isPaused: boolean,
    loop: boolean,
    switchLoop: () => void
}

export default function VideoPreviewer({ scene, className }: VideoPreviewerPorps) {
    const video = getFirstVideo(scene);
    const withVideo = !!video.file;

    useEffect(() => {
        return () => scene.videos.forEach((v) => v.htmlVideo.pause());
    }, []);
    

    // TODO: Render the whole scene, not just the first video
    // This is just temporary solution

    return withVideo ?
        <VideoPlayer
            video={video}
            className={className} /> :
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

function VideoPlayer({ className, video }: VideoPlayerProps) {
    const [time, setTime] = useState(video.htmlVideo.currentTime);
    const [isPaused, setIsPaused] = useState(video.htmlVideo.paused);
    const [loop, setLoop] = useState(video.htmlVideo.loop);

    useEffect(() => {
        video.htmlVideo.loop = loop;
    }, [loop]);

    useEffect(() => {
        setIsPaused(video.htmlVideo.paused);
    }, [video.totalDuration]);

    return (
        <div
            className={cn('grid grid-rows-[1fr_auto] gap-6 overflow-hidden', className)}>
            <VideoCanvas
                className='h-full row-start-1 row-end-2 col-start-1 col-end-1 w-full relative overflow-hidden'
                video={video}
                onTimeUpdate={() => setTime(video.htmlVideo.currentTime || 0)}
                onPause={() => setIsPaused(video.htmlVideo.paused)}
                onPlay={() => setIsPaused(video.htmlVideo.paused)}
                onPlaying={() => setIsPaused(video.htmlVideo.paused)} />
            <VideoControls
                video={video}
                isPaused={isPaused}
                time={time}
                loop={loop}
                switchLoop={() => setLoop((oldLoop) => !oldLoop)} />
        </div>
    )
}

function VideoControls({ className, video, time, isPaused, loop, switchLoop }: VideoControlsProps) {
    function onPlayClick() {
        video.htmlVideo.paused ? video.htmlVideo.play() : video.htmlVideo.pause()
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
                        {isPaused ? <FaPlay className='mx-auto' /> : <FaPause className='mx-auto' />}
                    </Button>
                </div>
                <span className='self-center'>{time.toFixed(2)} / {video.totalDuration.toFixed(2)}</span>
            </div>
            <input
                className='accent-on-surface-container'
                type='range'
                min={0}
                max={video.totalDuration}
                step={0.001}
                value={time}
                onChange={(e) => video.htmlVideo.currentTime = parseFloat(e.target.value)} />
        </div>
    )
}

function VideoCanvas({ video, className, onPause, onPlay, onPlaying, onTimeUpdate }: VideoCanvasProps) {
    const fps = 60;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bezelRef = useRef<{ image: HTMLImageElement, maskImage: HTMLImageElement, bezel: Bezel, showBezel: boolean } | null>(null);
    const lastRenderRef = useRef<Date>(new Date());
    const bezel = getBezel(video.bezelKey);

    useEffect(() => {
        const bezel = getBezel(video.bezelKey);
        const currentImageSrc = bezelImage(bezel.key);
        const currentMaskSrc = bezelTransparentMask(bezel.modelKey);

        if (bezelRef.current) {
            bezelRef.current.bezel = bezel;
            bezelRef.current.showBezel = video.withBezel;

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
            showBezel: video.withBezel,
            image,
            maskImage: mask,
        };

        renderVideo();
    }, [video]);

    function renderVideo() {
        if (!canvasRef.current || !bezelRef.current) {
            return;
        }

        const factWidth = bezelRef.current.bezel.width / video.htmlVideo.videoWidth;
        const factHeight = bezelRef.current.bezel.height / video.htmlVideo.videoHeight;
        const scale = bezelRef.current.showBezel ?
            (bezelRef.current.bezel.contentScale * Math.min(factWidth, factHeight)) :
            1;

        const videoWidth = video.htmlVideo.videoWidth * scale;
        const videoHeight = video.htmlVideo.videoHeight * scale;
        const x = bezelRef.current.showBezel ? (bezelRef.current.bezel.width - videoWidth) / 2 : 0;
        const y = bezelRef.current.showBezel ? (bezelRef.current.bezel.height - videoHeight) / 2 : 0;

        const context = canvasRef.current.getContext('2d');

        if (!context) {
            return;
        }

        context.globalCompositeOperation = 'source-over';
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (bezelRef.current.showBezel) {
            context.drawImage(bezelRef.current.maskImage, 0, 0, bezelRef.current.maskImage.naturalWidth, bezelRef.current.maskImage.naturalHeight);
            context.globalCompositeOperation = 'source-atop';
        }

        context.drawImage(video.htmlVideo, x, y, videoWidth, videoHeight);
        context.globalCompositeOperation = 'source-over';

        if (bezelRef.current.showBezel) {
            context.drawImage(bezelRef.current.image, 0, 0, bezelRef.current.image.naturalWidth, bezelRef.current.image.naturalHeight);
        }
    }

    function renderVideoLoop() {
        renderVideo();

        if (!canvasRef.current || !bezelRef.current || video.htmlVideo.paused || video.htmlVideo.ended) {
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

    video.htmlVideo.onpause = onPause;
    video.htmlVideo.onplay = () => {
        renderVideoLoop();
        onPlay();
    }
    video.htmlVideo.onplaying = onPlaying;
    video.htmlVideo.ontimeupdate = () => {
        renderVideo();
        onTimeUpdate();
    };

    return (
        <div
            className={cn('h-full w-full relative', className)}>
            <canvas
                ref={canvasRef}
                className='max-h-full max-w-full m-auto'
                width={video.withBezel ? bezel.width : video.naturalVideoDimensions?.width}
                height={video.withBezel ? bezel.height : video.naturalVideoDimensions?.height}/>
        </div>
    )
}