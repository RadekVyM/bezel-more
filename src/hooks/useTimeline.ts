import { useCallback, useEffect, useRef, useState } from 'react'
import { VideoScene } from '../types/VideoScene'

export default function useTimeline(scene: VideoScene) {
    const previousTimeRef = useRef<number>(0);
    const timeLoopRef = useRef<Loop | null>(null);
    const loopRef = useRef<boolean>(false);
    const sceneRef = useRef<VideoScene>(scene);
    const [currentTime, setCurrentTime] = useState<number>(scene.startTime);
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

            if (sceneRef.current.media.some((v) => (v.htmlVideo as any).loadingData)) {
                // If some videos are not loaded, timeline will wait
                return;
            }

            const sceneStart = sceneRef.current.startTime;
            const sceneEnd = sceneRef.current.endTime;

            setCurrentTime((previous) => {
                let newCurrentTime = previous + difference;

                if (newCurrentTime > sceneEnd) {
                    if (loopRef.current) {
                        newCurrentTime = sceneStart;
                    }
                    else {
                        timeLoopRef.current?.stop();
                        timeLoopRef.current = null;
                        setIsPlaying(false);
                        newCurrentTime = sceneEnd;
                    }
                }

                return Math.max(newCurrentTime, sceneStart);
            });
        });

        setIsPlaying(true);
        previousTimeRef.current = new Date().getTime();
        timeLoopRef.current.start();
    }, [timeLoopRef, loopRef, previousTimeRef, sceneRef, setCurrentTime, setIsPlaying]);

    const pause = useCallback(() => {
        pauseAllVideos(scene);
        timeLoopRef.current?.stop();
        timeLoopRef.current = null;
        setIsPlaying(false);
    }, [timeLoopRef, scene, setIsPlaying]);

    const reset = useCallback(() => {
        setCurrentTime(sceneRef.current.startTime);
    }, [setCurrentTime, sceneRef]);

    const seek = useCallback((newTime: number) => {
        const sceneStart = sceneRef.current.startTime;
        const sceneEnd = sceneRef.current.endTime;

        setCurrentTime(Math.max(sceneStart, Math.min(newTime, sceneEnd)));
    }, [setCurrentTime, sceneRef]);

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
        sceneRef.current = scene;
    }, [scene]);

    useEffect(() => {
        updateVideosCurrentTime(sceneRef.current, currentTime, isPlaying);
    }, [currentTime, isPlaying, sceneRef]);

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

function pauseAllVideos(scene: VideoScene) {
    scene.media.forEach((v) => {
        if (!v.htmlVideo.paused) {
            v.htmlVideo.pause();
        }
    });
}

function updateVideosCurrentTime(scene: VideoScene, currentTime: number, isPlaying: boolean) {
    // Browsers do not like frequent changes of the currentTime while playing the video
    const fps = 2;

    scene.media.forEach((v) => {
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
                seek(v.htmlVideo, newCurrentTime);
                v.htmlVideo.play()
                    .catch((e) => console.log(e));
            }
        }
        else {
            if (!v.htmlVideo.paused) {
                v.htmlVideo.pause();
            }
            
            seek(v.htmlVideo, newCurrentTime);
        }

        if (Math.abs(newCurrentTime - v.htmlVideo.currentTime) < 1 / fps) {
            return;
        }

        seek(v.htmlVideo, newCurrentTime);
    });
}

function seek(video: HTMLVideoElement, newCurrentTime: number) {
    const fps = 25;

    if (Math.abs(video.currentTime - newCurrentTime) > 1 / fps) {
        if (video.fastSeek) {
            video.fastSeek(newCurrentTime);
        }
        video.currentTime = newCurrentTime;
    }
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