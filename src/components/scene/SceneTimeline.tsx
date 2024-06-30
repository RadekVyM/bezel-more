import { useMemo, useRef, PointerEvent, useState } from 'react'
import { Video } from '../../types/Video'
import { Scene, getTotalSceneDuration } from '../../types/Scene'
import useDimensions from '../../hooks/useDimensions'
import { cn } from '../../utils/tailwind'
import { useEventListener } from 'usehooks-ts'
import { round } from '../../utils/numbers'
import OutlinedText from '../OutlinedText'

type SceneTimelineProps = {
    scene: Scene,
    currentTime: number,
    className?: string,
    seek: (newTime: number) => void,
    updateVideo: (index: number, video: Partial<Video>) => void,
    updateScene: (scene: Partial<Scene>) => void,
}

type VideoTimelineProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    video: Video,
    totalDuration: number,
    displayCaption?: boolean,
    updateVideo: (index: number, video: Partial<Video>) => void,
}

type SceneRangeProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    sceneStart: number,
    sceneEnd: number,
    totalDuration: number,
    updateScene: (scene: Partial<Scene>) => void,
}

type TimeAxisAndSliderProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    fullHeight: number,
    totalDuration: number,
    currentTime: number,
    seek: (newTime: number) => void
}

type TimeAxisProps = {
    left: number,
    top: number,
    width: number,
    height: number,
    totalDuration: number,
    minTicksDistance: number,
}

type SliderProps = { } & TimeAxisAndSliderProps

type TimeProps = {
    time: number
} & React.SVGTextElementAttributes<SVGTextElement>

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/** In seconds */
const TICKS_INTERVALS = [
    1/10, 2/10, 5/10,
    1, 2, 5, 15, 30,
    MINUTE, 2 * MINUTE, 5 * MINUTE, 15 * MINUTE, 30 * MINUTE,
    HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR,
    DAY, 2 * DAY, 7 * DAY
];

const HIGHLIGHTED_TICKS_INTERVALS = [
    1, 10, 20, 30,
    MINUTE, 10 * MINUTE, 20 * MINUTE, 30 * MINUTE,
    HOUR, 2 * HOUR, 4 * HOUR, 6 * HOUR, 12 * HOUR,
    DAY, 2 * DAY
];

export default function SceneTimeline({ scene, currentTime, className, seek, updateScene, updateVideo }: SceneTimelineProps) {
    const videoTimelineHeight = 36;
    const videoTimelineSpacing = 5;
    const sceneRangeHeight = 15;
    const timeAxisHeight = 30;
    const timeAxisSceneSpacing = 10;
    const horizontalPadding = 16;
    const bottomPadding = 10;
    const outerDivRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(outerDivRef);
    const totalDuration = getTotalSceneDuration(scene) || 10;
    const width = dimensions.width - (horizontalPadding * 2);
    const height = ((videoTimelineHeight + videoTimelineSpacing) * scene.videos.length) + videoTimelineSpacing + timeAxisHeight + sceneRangeHeight + timeAxisSceneSpacing;

    return (
        <div
            ref={outerDivRef}
            className={cn('relative isolate w-full h-full', className)}>
             <input
                className='accent-on-surface-container sr-only'
                type='range'
                min={0}
                max={totalDuration}
                step={0.001}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))} />

            <svg
                width={dimensions.width}
                height={height + bottomPadding}
                className='w-full h-full'>
                <SceneRange
                    totalDuration={totalDuration}
                    sceneStart={scene.startTime}
                    sceneEnd={scene.endTime}
                    left={horizontalPadding}
                    top={timeAxisHeight + timeAxisSceneSpacing}
                    width={width}
                    height={sceneRangeHeight}
                    updateScene={updateScene} />

                {scene.videos.map((v, index) => 
                    <VideoTimeline
                        key={v.index}
                        video={v}
                        totalDuration={totalDuration}
                        left={horizontalPadding}
                        top={timeAxisHeight + timeAxisSceneSpacing + sceneRangeHeight + videoTimelineSpacing + (videoTimelineHeight + videoTimelineSpacing) * index}
                        width={width}
                        height={videoTimelineHeight}
                        updateVideo={updateVideo}
                        displayCaption={scene.videos.length > 1} />)}
                
                <TimeAxisAndSlider
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                    left={horizontalPadding}
                    top={0}
                    width={width}
                    height={timeAxisHeight}
                    fullHeight={height}
                    seek={seek} />
            </svg>
        </div>
    )
}

function VideoTimeline({ width, height, left, top, video, totalDuration, displayCaption, updateVideo }: VideoTimelineProps) {
    const gRef = useRef<SVGGElement>(null);
    const downXRef = useRef<number>(0);
    const downSceneOffsetRef = useRef<number>(0);
    const downStartTimeRef = useRef<number>(0);
    const downEndTimeRef = useRef<number>(0);
    const isMovingRef = useRef<boolean>(false);
    const isMovingStartRef = useRef<boolean>(false);
    const isMovingEndRef = useRef<boolean>(false);
    const videoWidth = width * (video.totalDuration / totalDuration);
    const selectedVideoWidth = width * ((video.endTime - video.startTime) / totalDuration);
    const videoOffset = width * (video.sceneOffset / totalDuration);
    const selectedVideoOffset = videoOffset + (width * (video.startTime / totalDuration));
    const selectedVideoX = left + selectedVideoOffset;
    const startEndHalfWidth = 5;
    const radius = 4;
    const [cursor, setCursor] = useState('');

    function isMoving() {
        return (isMovingRef.current || isMovingStartRef.current || isMovingEndRef.current);
    }

    function isOverLeftThumb(pointerX: number) {
        return pointerX >= selectedVideoOffset - startEndHalfWidth && pointerX <= selectedVideoOffset + startEndHalfWidth;
    }

    function isOverRightThumb(pointerX: number) {
        return pointerX >= (selectedVideoOffset + selectedVideoWidth) - startEndHalfWidth && pointerX <= (selectedVideoOffset + selectedVideoWidth) + startEndHalfWidth;
    }

    function onPointerMove(e: PointerEvent<SVGElement>) {
        if (!gRef.current) {
            return;
        }

        const pointerX = getPointerX(gRef.current, e.clientX);

        setCursor(!isMovingRef.current && (isMovingStartRef.current || isMovingEndRef.current || isOverLeftThumb(pointerX) || isOverRightThumb(pointerX)) ?
            'cursor-col-resize' :
            'cursor-move');
    }

    function onPointerDown(e: PointerEvent<SVGElement>) {
        if (!gRef.current) {
            return;
        }

        const pointerX = getPointerX(gRef.current, e.clientX);

        downSceneOffsetRef.current = video.sceneOffset;
        downStartTimeRef.current = video.startTime;
        downEndTimeRef.current = video.endTime;
        downXRef.current = pointerX;
        
        if (isOverLeftThumb(pointerX)) {
            isMovingStartRef.current = true;
        }
        else if (isOverRightThumb(pointerX)) {
            isMovingEndRef.current = true;
        }
        else {
            isMovingRef.current = true;
        }
    }

    useEventListener('pointermove', (e) => {
        if (!isMoving() || !gRef.current) {
            return;
        }

        const pointerX = getPointerX(gRef.current, e.clientX);
        const difference = pointerX - downXRef.current;
        const offset = Math.round((totalDuration * (difference / width) * 100) * (1 + Number.EPSILON)) / 100;
        
        if (isMovingRef.current) {
            const maxOffset = 1800;
            const sceneOffset = offset > maxOffset ?
                maxOffset :
                offset < -maxOffset ?
                    -maxOffset :
                    offset;
    
            updateVideo(video.index, { sceneOffset: downSceneOffsetRef.current + sceneOffset });
        }
        else if (isMovingStartRef.current) {
            updateVideo(video.index, { startTime: downStartTimeRef.current + offset });
        }
        else if (isMovingEndRef.current) {
            updateVideo(video.index, { endTime: downEndTimeRef.current + offset });
        }
    });

    useEventListener('pointerup', (e) => {
        isMovingRef.current = false;
        isMovingStartRef.current = false;
        isMovingEndRef.current = false;
        setCursor('');
    });

    return (
        <g
            ref={gRef}
            className='group'>
            <rect
                className='stroke-secondary stroke-2 fill-transparent opacity-90'
                strokeDasharray={5}
                x={left} y={top}
                width={Math.max(0, width)} height={height}
                rx={radius} ry={radius} />
            <rect
                className={cn('fill-secondary stroke-2 stroke-secondary opacity-40', cursor)}
                x={left + videoOffset} y={top}
                width={Math.max(0, videoWidth)} height={height}
                rx={radius} ry={radius} />
            <rect
                className={cn('fill-secondary stroke-2 stroke-secondary drop-shadow-lg transition-colors', (cursor === 'cursor-col-resize') && 'stroke-on-surface-container', cursor)}
                x={selectedVideoX} y={top}
                width={Math.max(0, selectedVideoWidth)} height={height}
                rx={radius} ry={radius} />
            <rect
                className={cn('fill-transparent stroke-2 stroke-transparent transition-colors', (cursor === 'cursor-move') && 'stroke-on-surface-container', cursor)}
                x={left + videoOffset} y={top}
                width={Math.max(0, videoWidth)} height={height}
                rx={radius} ry={radius}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerLeave={() => !isMoving() && setCursor('')} />
            {displayCaption &&
                <OutlinedText
                    className='group-hover:opacity-50 pointer-events-none transition-opacity text-xs'
                    outlineClassName='stroke-surface-container'
                    fillClassName='fill-on-surface-container'
                    x={left + 8} y={top + height - 6}
                    strokeWidth={3}
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    {`Video #${video.index + 1}`}
                </OutlinedText>}
        </g>
    )
}

function SceneRange({ width, height, left, top, sceneStart, sceneEnd, totalDuration, updateScene }: SceneRangeProps) {
    const gRef = useRef<SVGRectElement>(null);
    const downXRef = useRef<number>(0);
    const downStartTimeRef = useRef<number>(0);
    const downEndTimeRef = useRef<number>(0);
    const isMovingStartRef = useRef<boolean>(false);
    const isMovingEndRef = useRef<boolean>(false);
    const rangeWidth = width * ((sceneEnd - sceneStart) / totalDuration);
    const rangeHeight = 4;
    const rangeOffset = width * (sceneStart / totalDuration);
    const thumbWidth = 7;
    const thumbHeight = height;
    const x = left + rangeOffset;

    function onStartPointerDown(e: PointerEvent<SVGPolygonElement>) {
        if (!gRef.current) {
            return;
        }
        
        const pointerX = getPointerX(gRef.current, e.clientX);

        downXRef.current = pointerX;
        downStartTimeRef.current = sceneStart;
        isMovingStartRef.current = true;
    }

    function onEndPointerDown(e: PointerEvent<SVGPolygonElement>) {
        if (!gRef.current) {
            return;
        }
        
        const pointerX = getPointerX(gRef.current, e.clientX);

        downXRef.current = pointerX;
        downEndTimeRef.current = sceneEnd;
        isMovingEndRef.current = true;
    }

    useEventListener('pointermove', (e) => {
        if (!gRef.current) {
            return;
        }

        const pointerX = getPointerX(gRef.current, e.clientX);
        const difference = pointerX - downXRef.current;
        const offset = round(totalDuration * (difference / width), 2);

        if (isMovingStartRef.current) {
            updateScene({ startTime: downStartTimeRef.current + offset });
        }
        if (isMovingEndRef.current) {
            updateScene({ endTime: downEndTimeRef.current + offset });
        }
    });

    useEventListener('pointerup', (e) => {
        isMovingStartRef.current = false;
        isMovingEndRef.current = false;
    });

    return (
        <g>
            <rect
                ref={gRef}
                className='fill-transparent'
                x={left} y={top}
                width={Math.max(0, width)} height={height} />
            <polygon
                onPointerDown={onStartPointerDown}
                className='fill-on-surface-container drop-shadow-lg stroke-surface-container stroke-2'
                strokeLinecap='round' strokeLinejoin='round'
                points={`
                    ${x - thumbWidth},${top} ${x},${top}
                    ${x},${top + thumbHeight} ${x - thumbWidth},${top + (thumbHeight * 0.65)}`}/>
            <rect
                className='fill-on-surface-container-muted'
                strokeDasharray={5}
                x={x} y={top + (height - rangeHeight) / 2}
                width={Math.max(0, rangeWidth)} height={rangeHeight}/>
            <polygon
                onPointerDown={onEndPointerDown}
                className='fill-on-surface-container drop-shadow-lg stroke-surface-container stroke-2'
                strokeLinecap='round' strokeLinejoin='round'
                points={`
                    ${x + rangeWidth},${top} ${x + rangeWidth + thumbWidth},${top}
                    ${x + rangeWidth + thumbWidth},${top + (thumbHeight * 0.65)} ${x + rangeWidth},${top + thumbHeight}`}/>
        </g>
    )
}

function TimeAxisAndSlider({ width, height, fullHeight, left, top, currentTime, totalDuration, seek }: TimeAxisAndSliderProps) {
    return (
        <g>
            <TimeAxis
                left={left}
                top={top}
                width={width}
                height={height}
                totalDuration={totalDuration}
                minTicksDistance={8} />
            <Slider
                left={left}
                top={top}
                width={width}
                height={height}
                fullHeight={fullHeight}
                currentTime={currentTime}
                totalDuration={totalDuration}
                seek={seek} />
        </g>
    )
}

function Slider({ width, height, fullHeight, left, top, currentTime, totalDuration, seek }: SliderProps) {
    const gRef = useRef<SVGGElement>(null);
    const isDownRef = useRef<boolean>(false);
    const thumbHalfWidth = 8;
    const thumbHeight = height / 2.2;
    const lineHalfWidth = 2;
    const x = width * (currentTime / totalDuration) + left;
    
    function onSeek(clientX: number) {
        if (!gRef.current) {
            return;
        }

        const pointerX = getPointerX(gRef.current, clientX);
        const newTime = totalDuration * (pointerX / width);

        seek(newTime);
    }

    function onPointerDown(e: PointerEvent<SVGGElement>) {
        onSeek(e.clientX);
        isDownRef.current = true;
    }

    useEventListener('pointermove', (e) => {
        if (!isDownRef.current) {
            return;
        }

        onSeek(e.clientX);
    });

    useEventListener('pointerup', (e) => {
        isDownRef.current = false;
    });

    return (
        <g
            ref={gRef}
            onPointerDown={onPointerDown}
            pointerEvents={'visiblePainted'}>
            <rect
                className='fill-transparent'
                x={left} y={top}
                width={Math.max(0, width)} height={height} />
            <polygon
                className='fill-on-surface-container drop-shadow-lg stroke-surface-container stroke-2'
                strokeLinecap='round' strokeLinejoin='round'
                points={`
                    ${x - thumbHalfWidth},${top} ${x + thumbHalfWidth},${top}
                    ${x + thumbHalfWidth},${top + (thumbHeight * 0.65)} ${x + lineHalfWidth},${top + thumbHeight}
                    ${x + lineHalfWidth},${top + fullHeight} ${x - lineHalfWidth},${top + fullHeight}
                    ${x - lineHalfWidth},${top + thumbHeight} ${x - thumbHalfWidth},${top + (thumbHeight * 0.65)}`}/>
        </g>
    )
}

function TimeAxis({ width, height, left, top, minTicksDistance, totalDuration }: TimeAxisProps) {
    const ticks = useMemo(() => getTicks(width, totalDuration, minTicksDistance), [width, totalDuration, minTicksDistance]);
    const ticksHeight = height / 2;

    return (
        <>
            <g>
                {ticks.map((tick, index) =>
                    <line
                        key={index}
                        strokeWidth={2}
                        className='stroke-on-surface-container'
                        strokeLinecap='round' strokeLinejoin='round'
                        style={{ opacity: tick.relativeHeight }}
                        x1={left + tick.x} y1={top}
                        x2={left + tick.x} y2={top + (ticksHeight * tick.relativeHeight)}/>)}
            </g>
            <Time
                time={0}
                x={left} y={top + height}
                textAnchor='start' />
            <Time
                time={totalDuration}
                x={left + width} y={top + height}
                textAnchor='end' />
        </>
    )
}

function Time({ time, ...rest }: TimeProps) {
    const seconds = time % 60;
    const minutes = ((time - seconds) / 60) % 60;
    const hours = ((time - seconds - (minutes * 60)) / 60) / 60;

    return (
        <text
            {...rest}
            className='fill-on-surface-container text-xs select-none'
            strokeLinecap='round' strokeLinejoin='round'>
            {`${hours}:${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${seconds.toLocaleString(undefined, { minimumIntegerDigits: 2, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </text>
    )
}

function getTicks(width: number, totalDuration: number, minTicksDistance: number) {
    const { distance, interval } = getTicksDistance(width, totalDuration, minTicksDistance);
    const { highlightedInterval, subhighlightedInterval } = getHighlightedIntervals(interval);
    const count = Math.ceil(width / distance) + 1;
    const lastIndex = count - 1;

    return [...Array(count)].map((_, index) => {
        const time = index === lastIndex ? totalDuration : index * interval;
        const relativeHeight = time % highlightedInterval === 0 ?
            1 :
            time % subhighlightedInterval === 0 ?
                0.75 :
                0.4;

        return {
            time,
            x: index === lastIndex ? width : index * distance,
            relativeHeight
        };
    });
}

function getTicksDistance(width: number, totalDuration: number, minTicksDistance: number) {
    let distance = minTicksDistance;
    let interval = totalDuration * (distance / width);
    
    // This is maybe too naive solution, but I am not able to figure out another...
    for (let i = 0; i < TICKS_INTERVALS.length; i++) {
        interval = TICKS_INTERVALS[i];
        distance = width * (interval / totalDuration);

        if (distance > minTicksDistance) {
            return { distance, interval };
        }
    }

    return { distance, interval };
}

function getHighlightedIntervals(interval: number) {
    const intervalIndex = HIGHLIGHTED_TICKS_INTERVALS.findIndex((int) => int > interval);

    return {
        highlightedInterval: HIGHLIGHTED_TICKS_INTERVALS[intervalIndex],
        subhighlightedInterval: HIGHLIGHTED_TICKS_INTERVALS[intervalIndex] / 2
    };
}

function getPointerX(element: Element, clientX: number) {
    const rect = element.getBoundingClientRect();
    return clientX - rect.left;
}