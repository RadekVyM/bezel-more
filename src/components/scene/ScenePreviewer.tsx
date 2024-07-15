import { useEffect, useRef } from 'react'
import { MdOutlineUploadFile } from 'react-icons/md'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop, TiArrowRight } from 'react-icons/ti'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import { Scene, getTotalSceneDuration } from '../../types/Scene'
import useTimeline from '../../hooks/useTimeline'
import SceneTimeline from '../scene/SceneTimeline'
import { Video } from '../../types/Video'
import Container from '../Container'
import { useUnmount } from 'usehooks-ts'
import { drawSceneBackground } from '../../services/drawing/background'
import { drawVideos } from '../../services/drawing/video'
import { getSceneSize } from '../../types/DrawableScene'
import { Canvas } from '../Canvas'
import useBezelImages from '../../hooks/useBezelImages'

type ScenePreviewerProps = {
    scene: Scene,
    className?: string,
    updateVideo: (index: number, video: Partial<Video>) => void,
    updateScene: (scene: Partial<Scene>) => void,
}

type PreviewPlayerProps = {
    scene: Scene,
    className?: string,
    updateVideo: (index: number, video: Partial<Video>) => void,
    updateScene: (scene: Partial<Scene>) => void,
}

type PreviewCanvasProps = {
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
    switchLoop: () => void
}

export default function ScenePreviewer({ scene, className, updateScene, updateVideo }: ScenePreviewerProps) {
    return scene.videos.every((v) => v.file) ?
        <PreviewPlayer
            scene={scene}
            className={className}
            updateScene={updateScene}
            updateVideo={updateVideo} /> :
        <Container
            className={cn('grid place-content-center justify-items-center text-on-surface-container-muted', className)}>
            <MdOutlineUploadFile
                className='w-8 h-8 mb-4' />
            <p
                className='mb-2 text-sm'>
                No video uploaded
            </p>
        </Container>
}

function PreviewPlayer({ className, scene, updateScene, updateVideo }: PreviewPlayerProps) {
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
            className={cn('grid grid-rows-[1fr_auto] gap-3', className)}>
            <Container
                className='grid grid-rows-[1fr_auto] gap-6 p-5 relative overflow-hidden'>
                <PreviewCanvas
                    className='relative overflow-hidden'
                    currentTime={currentTime}
                    scene={scene} />
                <VideoControls
                    scene={scene}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    play={play}
                    pause={pause}
                    reset={reset}
                    loop={loop}
                    switchLoop={() => setLoop((oldLoop) => !oldLoop)} />
            </Container>
            <Container>
                <SceneTimeline
                    className='px-1'
                    scene={scene}
                    currentTime={currentTime}
                    seek={seek}
                    updateScene={updateScene}
                    updateVideo={updateVideo}  />
            </Container>
        </div>
    )
}

function VideoControls({ className, scene, currentTime, isPlaying, loop, play, pause, reset, switchLoop }: VideoControlsProps) {
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
            className={cn(className, 'grid gap-3 grid-cols-2')}>
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
    )
}

function PreviewCanvas({ scene, currentTime, className }: PreviewCanvasProps) {
    const fps = 30;
    const previousRenderRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bezelImagesRef = useBezelImages(scene, render);

    // This is a bit hacky solution, but I guess... who cares...
    scene.videos.forEach((v) => v.htmlVideo.ontimeupdate = () => render());
    useUnmount(() => scene.videos.forEach((v) => v.htmlVideo.ontimeupdate = null));

    useEffect(() => {
        const now = new Date().getTime();

        if (now - previousRenderRef.current > 1000 / fps) {
            render();
            previousRenderRef.current = now;
        }
    }, [currentTime]);

    useEffect(() => {
        render();
    }, [scene]);

    function render() {
        if (!canvasRef.current) {
            return;
        }

        const context = canvasRef.current.getContext('2d');

        if (!context) {
            return;
        }

        const sceneSize = getSceneSize(scene);
        const shouldScale = !(sceneSize.width <= canvasRef.current.width && sceneSize.height <= canvasRef.current.height);
        const scale = shouldScale ? Math.min(canvasRef.current.width / sceneSize.width, canvasRef.current.height / sceneSize.height) : 1;
        const sceneWidth = sceneSize.width * scale;
        const sceneHeight = sceneSize.height * scale;
        const left = (canvasRef.current.width - sceneWidth) / 2;
        const top = (canvasRef.current.height - sceneHeight) / 2;

        context.globalCompositeOperation = 'source-over';
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        drawVideos(context, scene, bezelImagesRef.current, left, top, sceneWidth, sceneHeight, scale,
            (context, video, x, y, width, height) => 
                context.drawImage((video as Video).htmlVideo, x, y, width, height));

        context.globalCompositeOperation ='destination-over';
        drawSceneBackground(context, scene, left, top, { width: sceneWidth, height: sceneHeight }, true, bezelImagesRef.current.map((bi) => bi.maskImage));
    }

    return (
        <Canvas
            ref={canvasRef}
            className={className}
            onDimensionsChanges={render} />
    )
}