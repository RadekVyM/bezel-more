import { useCallback, useReducer } from 'react'
import { Scene } from '../types/Scene'
import { supportedFormats } from '../supportedFormats'
import { Video } from '../types/Video'
import { Size } from '../types/Size';

export default function useScene() {
    const [scene, updateScene] = useReducer(
        (state: Scene, newState: Partial<Scene>) => ({
            ...state,
            ...newState,
        }),
        {
            videos: [],
            fps: 20,
            maxColors: 255,
            requestedSize: undefined,
            startTime: 0,
            endTime: 0,
            background: 'transparent',
            formatKey: supportedFormats.webp.key,
            get firstVideo() { return this.videos.length > 0 ? this.videos[0] : undefined },
            get size() { return this.requestedSize || (this.videos.length > 0 ? getSize(this.videos) : undefined) }
        }
    );

    const updateVideo = useCallback((index: number, video: Video) => {
        const videos = [...scene.videos];

        videos[index] = {
            ...video,
            index: index
        };

        for (const v of videos) {
            v.htmlVideo?.remove();
            if (v.htmlVideo)
                document.body.appendChild(v.htmlVideo);
        }

        updateScene({ videos });
    }, [scene, updateScene]);

    return {
        scene,
        updateScene,
        updateVideo
    };
}

function getSize(videos: Array<Video>): Size {
    return { width: 0, height: 0 }
}