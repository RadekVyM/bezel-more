import { useRef } from 'react'
import { Video } from '../types/Video'
import { Scene, getTotalSceneDuration } from '../types/Scene'
import useDimensions from '../hooks/useDimensions'
import { cn } from '../utils/tailwind'

type SceneTimelineProps = {
    scene: Scene,
    currentTime: number,
    className?: string
}

type VideoTimelineProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    video: Video,
    totalDuration: number
}

type SceneRangeProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    sceneStart: number,
    sceneEnd: number,
    totalDuration: number
}

type TimeAxisProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    totalDuration: number,
    currentTime: number
}

export default function SceneTimeline({ scene, currentTime, className }: SceneTimelineProps) {
    const videoTimelineHeight = 50;
    const videoTimelineSpacing = 5;
    const sceneRangeHeight = 20;
    const timeAxisHeight = 20;
    const horizontalPadding = 4;
    const outerDivRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(outerDivRef);
    const totalDuration = getTotalSceneDuration(scene);
    const width = dimensions.width - (horizontalPadding * 2);
    const height = (videoTimelineHeight * scene.videos.length) + (videoTimelineSpacing * scene.videos.length) + videoTimelineSpacing + timeAxisHeight + sceneRangeHeight;

    return (
        <div
            ref={outerDivRef}
            className={cn('relative isolate w-full h-full', className)}>
            <svg
                width={dimensions.width}
                height={height}
                className='w-full h-full'>
                <SceneRange
                    totalDuration={totalDuration}
                    sceneStart={scene.startTime}
                    sceneEnd={scene.endTime}
                    left={horizontalPadding}
                    top={0}
                    width={width}
                    height={sceneRangeHeight} />

                {scene.videos.map((v, index) => 
                    <VideoTimeline
                        key={v.index}
                        video={v}
                        totalDuration={totalDuration}
                        left={horizontalPadding}
                        top={sceneRangeHeight + videoTimelineSpacing + (videoTimelineHeight + videoTimelineSpacing) * index}
                        width={width}
                        height={videoTimelineHeight} />)}
                
                <TimeAxis
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                    left={horizontalPadding}
                    top={height - timeAxisHeight}
                    width={width}
                    height={timeAxisHeight}/>
            </svg>
        </div>
    )
}

function VideoTimeline({ width, height, left, top, video, totalDuration }: VideoTimelineProps) {
    const videoWidth = width * (video.totalDuration / totalDuration);
    const selectedVideoWidth = width * ((video.endTime - video.startTime) / totalDuration);
    const videoOffset = width * (video.sceneOffset / totalDuration);
    const selectedVideoOffset = videoOffset + (width * (video.startTime / totalDuration));

    return (
        <g>
            <rect
                className='stroke-secondary stroke-2 fill-transparent'
                strokeDasharray={5}
                x={left} y={top}
                width={width} height={height}
                rx={4} ry={4}/>
            <rect
                className='fill-secondary opacity-40'
                strokeDasharray={5}
                x={left + videoOffset} y={top}
                width={videoWidth} height={height}
                rx={4} ry={4}/>
            <rect
                className='fill-secondary'
                strokeDasharray={5}
                x={left + selectedVideoOffset} y={top}
                width={selectedVideoWidth} height={height}
                rx={4} ry={4}/>
        </g>
    )
}

function SceneRange({ width, height, left, top, sceneStart, sceneEnd, totalDuration }: SceneRangeProps) {
    const rangeWidth = width * ((sceneEnd - sceneStart) / totalDuration);
    const rangeHeight = 4;
    const rangeOffset = width * (sceneStart / totalDuration);

    return (
        <g>
            <rect
                className='fill-on-surface-container-muted'
                strokeDasharray={5}
                x={left + rangeOffset} y={top + (height - rangeHeight) / 2}
                width={rangeWidth} height={rangeHeight}
                rx={2} ry={2}/>
        </g>
    )
}

function TimeAxis({ width, height, left, top, currentTime, totalDuration }: TimeAxisProps) {
    const radius = 4;
    const x = width * (currentTime / totalDuration);
    const y = (height - (2 * radius)) / 2;
    
    return (
        <g>
            <circle
                className='fill-on-surface-container'
                r={radius}
                cx={left + x}
                cy={top + y}/>
        </g>
    )
}