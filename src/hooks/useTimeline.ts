import { useCallback, useEffect, useRef, useState } from 'react'
import { Scene, getTotalSceneDuration } from '../types/Scene'

export default function useTimeline(scene: Scene) {
    const previousTimeRef = useRef<number>(0);
    const timeLoopRef = useRef<Loop | null>(null);
    const loopRef = useRef<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [loop, setLoop] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const play = useCallback(() => {
        if (timeLoopRef.current) {
            timeLoopRef.current.stop();
            timeLoopRef.current = null;
        }

        timeLoopRef.current = new Loop(() => {
            const now = new Date().getTime();
            const difference = (now - previousTimeRef.current) / 1000;
            previousTimeRef.current = now;

            if (scene.videos.every((v) => (v.htmlVideo as any).loadingData)) {
                // If no video is loaded, timeline will wait
                return;
            }

            const maxDuration = getTotalSceneDuration(scene);

            setCurrentTime((previous) => {
                let newCurrentTime = previous + difference;

                if (newCurrentTime > maxDuration) {
                    if (loopRef.current) {
                        newCurrentTime = 0;
                    }
                    else {
                        timeLoopRef.current?.stop();
                        timeLoopRef.current = null;
                        setIsPlaying(false);
                        newCurrentTime = maxDuration;
                    }
                }

                return newCurrentTime;
            });
        });

        setIsPlaying(true);
        previousTimeRef.current = new Date().getTime();
        timeLoopRef.current.start();
    }, [timeLoopRef, loopRef, previousTimeRef, scene, setCurrentTime, setIsPlaying]);

    const pause = useCallback(() => {
        pauseAllVideos(scene);
        timeLoopRef.current?.stop();
        timeLoopRef.current = null;
        setIsPlaying(false);
    }, [timeLoopRef, scene, setIsPlaying]);

    const reset = useCallback(() => {
        setCurrentTime(0);
    }, [setCurrentTime]);

    const seek = useCallback((newTime: number) => {
        setCurrentTime(newTime);
    }, [setCurrentTime]);

    useEffect(() => {
        loopRef.current = loop;
    }, [loop]);

    useEffect(() => {
        return () => {
            timeLoopRef.current?.stop();
            timeLoopRef.current = null;
            setIsPlaying(false);
        };
    }, []);

    useEffect(() => {
        updateVideosCurrentTime(scene, currentTime, isPlaying);
    }, [currentTime, isPlaying, scene]);

    return {
        currentTime,
        play,
        pause,
        reset,
        seek,
        isPlaying,
        loop,
        setLoop
    };
}

function pauseAllVideos(scene: Scene) {
    scene.videos.forEach((v) => {
        if (!v.htmlVideo.paused) {
            v.htmlVideo.pause();
        }
    });
}

function updateVideosCurrentTime(scene: Scene, currentTime: number, isPlaying: boolean) {
    const fps = 30;

    scene.videos.forEach((v) => {
        const offsetCurrentTime = currentTime - v.sceneOffset;
        
        const shouldPause = !isPlaying || offsetCurrentTime < v.startTime || offsetCurrentTime > v.endTime;
        const newCurrentTime = offsetCurrentTime < v.startTime ?
            v.startTime :
            (offsetCurrentTime > v.endTime ?
                v.endTime : 
                offsetCurrentTime);

        if (!shouldPause && isPlaying) {
            if (v.htmlVideo.paused || v.htmlVideo.ended) {
                // I need to play the video because Chrome does not always redraw the video when currentTime is changed  
                v.htmlVideo.play().catch((e) => console.log(e));
            }
        }
        else {
            if (!v.htmlVideo.paused) {
                v.htmlVideo.pause();
            }
        }

        if (Math.abs(newCurrentTime - v.htmlVideo.currentTime) < 1 / fps) {
            return;
        }

        if (v.htmlVideo.currentTime !== newCurrentTime) {
            v.htmlVideo.currentTime = newCurrentTime;
        }
    });
}

class Loop {
    action: () => void;
    isRunning: boolean;

    constructor(action: () => void) {
        this.action = action;
        this.isRunning = false
    }

    start() {
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
    }

    loop() {
        if (!this.isRunning) {
            return;
        }
        this.action();
        requestAnimationFrame(() => this.loop());
    }
}