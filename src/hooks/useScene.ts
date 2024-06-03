import { useCallback, useReducer } from 'react'
import { Scene } from '../types/Scene'
import { supportedFormats } from '../supportedFormats'
import { Video, createVideo } from '../types/Video'

export default function useScene(videosCount: number) {
    const [scene, updateScene] = useReducer(
        (state: Scene, newState: Partial<Scene>) => ({
            ...state,
            ...newState,
        }),
        {
            videos: createVideos(videosCount),
            fps: 20,
            maxColors: 255,
            requestedSize: undefined,
            startTime: 0,
            endTime: 0,
            background: 'transparent',
            formatKey: supportedFormats.webp.key,
        }
    );

    const updateVideo = useCallback((index: number, update: Partial<Video>) => {
        const updatedVideos = [...scene.videos];
        const video = updatedVideos.find((v) => v.index === index);

        if (!video) {
            throw new Error('Video with this index does not exist');
        }
        
        const updatedVideo = updatedVideos[index] = {
            ...video,
            ...update,
            index: index
        };

        if ('file' in update && updatedVideo.file) {
            updatedVideo.htmlVideo.src = URL.createObjectURL(updatedVideo.file);
        }

        updateScene({ videos: updatedVideos });
    }, [scene, updateScene]);

    scene.videos.forEach((v) => {
        v.htmlVideo.onloadedmetadata = null;
        v.htmlVideo.onloadedmetadata = (e) => {
            updateVideo(
                v.index,
                {
                    startTime: 0,
                    endTime: v.htmlVideo.duration,
                    totalDuration: v.htmlVideo.duration,
                    naturalVideoDimensions: { width: v.htmlVideo.videoWidth, height: v.htmlVideo.videoHeight }
                });
        };

        v.htmlVideo.oncanplaythrough = (e) => (e.target as any).loadingData = false;
        v.htmlVideo.oncanplay = (e) => (e.target as any).loadingData = false;
        v.htmlVideo.onwaiting = (e) => (e.target as any).loadingData = true;
    });

    return {
        scene,
        updateScene,
        updateVideo
    };
}

function createVideos(count: number) {
    const videos: Array<Video> = [];

    for (let i = 0; i < count; i++) {
        videos[i] = createVideo(i);
    }

    const container = document.getElementById('videos-container');
    
    // Remove old elements
    // Those elements are from a previous scene and are not needed
    while (container?.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Add the HTML element to DOM, so the video can be loaded
    for (const v of videos) {
        if (v.htmlVideo && !container?.contains(v.htmlVideo)) {
            container?.appendChild(v.htmlVideo);
        }
    }

    return videos;
}