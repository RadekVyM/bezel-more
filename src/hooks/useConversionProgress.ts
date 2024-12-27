import { FFmpeg } from '@ffmpeg/ffmpeg'
import { useCallback, useEffect, useReducer } from 'react'
import { ConversionProgress } from '../types/ConversionProgress'
import { Log, Progress } from '@ffmpeg/types'

export default function useConversionProgress(ffmpeg: FFmpeg) {
    const [progress, updateProgress] = useReducer(
        (state: ConversionProgress, newState: Partial<ConversionProgress>) => ({
            ...state,
            ...newState,
        }),
        createDefaultConversionProgress()
    );

    const resetProgress = useCallback(() => {
        updateProgress(createDefaultConversionProgress());
    }, [updateProgress]);

    const updateProgressState = useCallback((state: string) => {
        updateProgress({ state });
    }, [updateProgress]);

    useEffect(() => {
        const onProgress = (args: Progress) => {
            updateProgress({ progress: args.progress, time: args.time });
        };
        const onLog = (args: Log) => {
            // console.log(args.message)

            const splitMessage = args.message
                .split(/(\s+|=\s*)/)
                .filter((s) => s.trim().length > 0 && !s.includes('='))
                .map((s) => s.trim());

            const frameKeyIndex = splitMessage.indexOf('frame');
            const speedKeyIndex = splitMessage.indexOf('speed');

            if (frameKeyIndex >= 0 && speedKeyIndex >= 0) {
                updateProgress({
                    frame: splitMessage[frameKeyIndex + 1],
                    speed: splitMessage[speedKeyIndex + 1],
                });
            }
        };

        ffmpeg.on('progress', onProgress);
        ffmpeg.on('log', onLog);

        return () => {
            ffmpeg.off('progress', onProgress);
            ffmpeg.off('log', onLog);
        };
    }, [ffmpeg, updateProgress]);

    return {
        progress,
        updateProgress,
        resetProgress,
        updateProgressState
    };
}

function createDefaultConversionProgress(): ConversionProgress {
    return {
        converting: false,
        progress: 0,
        time: 0,
        state: 'No results yet',
        frame: '0',
        speed: 'N/A'
    };
}