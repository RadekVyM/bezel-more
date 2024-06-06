import { useEffect, useRef } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop, TiArrowRight } from 'react-icons/ti'
import { bezelImage, bezelTransparentMask, getBezel } from '../bezels'
import { cn } from '../utils/tailwind'
import Button from './Button'
import { Bezel } from '../types/Bezel'
import { Scene, getFirstVideo, getTotalSceneDuration } from '../types/Scene'
import useTimeline from '../hooks/useTimeline'
import SceneTimeline from './SceneTimeline'

type VideoPreviewerPorps = {
    scene: Scene,
    className?: string
}

type VideoPlayerProps = {
    scene: Scene,
    className?: string,
}

type VideoCanvasProps = {
    scene: Scene,
    currentTime: number,
    className?: string,
}

type VideoControlsProps = {
    className?: string,
    scene: Scene,
    currentTime: number,
    isPlaying: boolean,
    loop: boolean,
    play: () => void,
    pause: () => void,
    reset: () => void,
    seek: (newTime: number) => void,
    switchLoop: () => void
}

export default function VideoPreviewer({ scene, className }: VideoPreviewerPorps) {
    return scene.videos.every((v) => v.file) ?
        <VideoPlayer
            scene={scene}
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

function VideoPlayer({ className, scene }: VideoPlayerProps) {
    const videoFiles = useRef<Array<File | undefined | null> | null>(null);
    const {
        currentTime,
        loop,
        isPlaying,
        play,
        pause,
        reset,
        seek,
        setLoop
    } = useTimeline(scene);

    useEffect(() => {
        let changed = false;

        if (videoFiles.current) {
            if (videoFiles.current.length !== scene.videos.length) {
                changed = true;
            }
            else {
                changed = videoFiles.current.some((v, i) => v !== scene.videos[i].file);
            }
        }

        videoFiles.current = scene.videos.map((v) => v.file);

        if (changed) {
            pause();
            reset();
        }
    }, [scene, reset, pause]);

    return (
        <div
            className={cn('grid grid-rows-[1fr_auto_auto] gap-6 overflow-hidden max-w-full', className)}>
            <VideoCanvas
                className='h-full row-start-1 row-end-2 col-start-1 col-end-1 w-full relative overflow-hidden'
                currentTime={currentTime}
                scene={scene} />
            <VideoControls
                scene={scene}
                isPlaying={isPlaying}
                currentTime={currentTime}
                play={play}
                pause={pause}
                seek={seek}
                reset={reset}
                loop={loop}
                switchLoop={() => setLoop((oldLoop) => !oldLoop)} />
            <SceneTimeline
                scene={scene}
                currentTime={currentTime} />
        </div>
    )
}

function VideoControls({ className, scene, currentTime, isPlaying, loop, play, pause, seek, reset, switchLoop }: VideoControlsProps) {
    const totalDuration = getTotalSceneDuration(scene);

    function onPlayClick() {
        if (isPlaying) {
            pause();
        }
        else {
            if (currentTime >= scene.endTime) {
                reset();
            }
            play();
        }
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
                        {isPlaying ? <FaPause className='mx-auto' /> : <FaPlay className='mx-auto' />}
                    </Button>
                </div>
                <span className='self-center'>{currentTime.toFixed(2)} / {totalDuration.toFixed(2)}</span>
            </div>
            <input
                className='accent-on-surface-container'
                type='range'
                min={0}
                max={totalDuration}
                step={0.001}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))} />
        </div>
    )
}

function VideoCanvas({ scene, currentTime, className }: VideoCanvasProps) {
    // TODO: Render the whole scene, not just the first video
    // This is just temporary solution
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bezelRef = useRef<{ image: HTMLImageElement, maskImage: HTMLImageElement, bezel: Bezel, showBezel: boolean } | null>(null);
    const bezel = getBezel(getFirstVideo(scene).bezelKey);

    useEffect(() => {
        const video = getFirstVideo(scene);
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
    }, [scene]);

    useEffect(() => {
        renderVideo();
    }, [currentTime]);

    function renderVideo() {
        const video = getFirstVideo(scene);

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

    return (
        <div
            className={cn('h-full w-full relative', className)}>
            <canvas
                ref={canvasRef}
                className='max-h-full max-w-full m-auto'
                width={getFirstVideo(scene).withBezel ? bezel.width : getFirstVideo(scene).naturalVideoDimensions?.width}
                height={getFirstVideo(scene).withBezel ? bezel.height : getFirstVideo(scene).naturalVideoDimensions?.height}/>
        </div>
    )
}