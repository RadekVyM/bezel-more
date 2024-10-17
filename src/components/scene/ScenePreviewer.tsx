import { useCallback, useEffect, useRef } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'
import { TiArrowLoop, TiArrowRight } from 'react-icons/ti'
import { cn } from '../../utils/tailwind'
import Button from '../inputs/Button'
import { VideoScene, getTotalSceneDuration } from '../../types/VideoScene'
import useTimeline from '../../hooks/useTimeline'
import SceneTimeline from '../scene/SceneTimeline'
import { Video } from '../../types/Video'
import Container from '../Container'
import { drawSceneBackground } from '../../services/drawing/background'
import { drawMedia } from '../../services/drawing/media'
import { getSceneSize } from '../../types/DrawableScene'
import { Canvas } from '../Canvas'
import useBezelImages from '../../hooks/useBezelImages'
import { LargeVideoFileSelection } from '../inputs/MediumFileSelection'
import { Scene } from '../../types/Scene'
import { Medium } from '../../types/Medium'
import { ImageScene } from '../../types/ImageScene'

type ScenePreviewerProps = {
    scene: Scene,
    className?: string,
    updateVideo: (index: number, video: Partial<Video>) => void,
    updateScene: (scene: Partial<Scene>) => void,
}

type PreviewPlayerProps = {
    scene: VideoScene,
    className?: string,
    updateVideo: (index: number, video: Partial<Video>) => void,
    updateScene: (scene: Partial<VideoScene>) => void,
}

type ImagePreviewProps = {
    scene: ImageScene,
    className?: string,
}

type PreviewCanvasProps = {
    scene: Scene,
    currentTime: number,
    className?: string,
}

type VideoControlsProps = {
    className?: string,
    scene: VideoScene,
    currentTime: number,
    isPlaying: boolean,
    loop: boolean,
    play: () => void,
    pause: () => void,
    reset: () => void,
    switchLoop: () => void
}

export default function ScenePreviewer({ scene, className, updateScene, updateVideo }: ScenePreviewerProps) {
    return scene.media.every((v) => v.file) ?
        (scene.sceneType === 'video' ?
            <PreviewPlayer
                scene={scene}
                className={className}
                updateScene={updateScene}
                updateVideo={updateVideo} /> :
                <ImagePreview
                    scene={scene}
                    className={className} />) :
        <Container
            className={cn('flex flex-wrap gap-5 p-6 flex-col @2xl:flex-row', className)}>
            {(scene.media as (Array<Medium>)).map((medium, index) => 
                <LargeVideoFileSelection
                    key={medium.index}
                    className='flex-1'
                    label={`Choose ${medium.mediumType} file${scene.media.length > 1 ? ` #${index + 1}` : ''}`}
                    file={medium.file}
                    mediumType={medium.mediumType}
                    onFileSelect={(file) => {
                        if (file) {
                            updateVideo(medium.index, { file });
                        }
                    }} />)}
        </Container>
}

function ImagePreview({ scene, className }: ImagePreviewProps) {
    return (
        <Container
            className={cn('p-6', className)}>
            <PreviewCanvas
                className='relative overflow-hidden'
                currentTime={0}
                scene={scene} />
        </Container>
    )
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
            if (videoFiles.current.length !== scene.media.length) {
                changed = true;
            }
            else {
                changed = videoFiles.current.some((v, i) => v !== scene.media[i].file);
            }
        }

        videoFiles.current = scene.media.map((v) => v.file);

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
    const bezelImagesRef = useBezelImages(scene, () => render());

    const render = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }

        const context = canvasRef.current.getContext('2d');

        if (!context) {
            return;
        }

        const ratio = Math.ceil(window?.devicePixelRatio || 1);
        const sceneSize = getSceneSize(scene);
        const shouldScale = !(sceneSize.width * ratio <= canvasRef.current.width && sceneSize.height * ratio <= canvasRef.current.height);
        const scale = shouldScale ?
            Math.min(canvasRef.current.width / sceneSize.width, canvasRef.current.height / sceneSize.height) :
            ratio;
        const sceneWidth = sceneSize.width * scale;
        const sceneHeight = sceneSize.height * scale;
        const left = (canvasRef.current.width - sceneWidth) / 2;
        const top = (canvasRef.current.height - sceneHeight) / 2;

        context.globalCompositeOperation = 'source-over';
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        drawMedia(context, scene, bezelImagesRef.current, left, top, sceneWidth, sceneHeight, scale,
            (context, drawableMedium, x, y, width, height) => {
                const medium = drawableMedium as Medium;
                
                if (medium.mediumType === 'video') {
                    context.drawImage(medium.htmlVideo, x, y, width, height);
                }
                else if (medium.mediumType === 'image') {
                    context.drawImage(medium.htmlImage, x, y, width, height);
                }
            });

        context.globalCompositeOperation ='destination-over';
        drawSceneBackground(context, scene, left, top, { width: sceneWidth, height: sceneHeight }, true, bezelImagesRef.current.map((bi) => bi.maskImage));
    }, [scene]);

    useEffect(() => {
        const onLoadListener = () => render();

        // This is a bit hacky solution, but I guess... who cares...
        if (scene.sceneType === 'video') {
            scene.media.forEach((v) => {
                v.htmlVideo.ontimeupdate = () => render();
                v.htmlVideo.addEventListener('loadeddata', onLoadListener);
            });
        }
        else {
            scene.media.forEach((i) => i.htmlImage.addEventListener('load', onLoadListener));
        }

        return () => {
            if (scene.sceneType === 'video') {
                scene.media.forEach((v) => {
                    v.htmlVideo.ontimeupdate = null;
                    v.htmlVideo.removeEventListener('loadeddata', onLoadListener);
                });
            }
            else {
                scene.media.forEach((i) => i.htmlImage.removeEventListener('load', onLoadListener));
            }
        };
    }, [scene.media, scene.sceneType, render]);

    useEffect(() => {
        const now = new Date().getTime();

        if (now - previousRenderRef.current > 1000 / fps) {
            render();
            previousRenderRef.current = now;
        }
    }, [currentTime, render]);

    useEffect(() => {
        render();
    }, [scene]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            render();
        }, 500);

        return () => clearTimeout(timeout);
    }, [render]);

    return (
        <Canvas
            ref={canvasRef}
            className={className}
            onDimensionsChanges={render} />
    )
}