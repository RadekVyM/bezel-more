import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { VideoScene } from '../types/VideoScene'
import { supportedImageFormats, supportedVideoFormats } from '../supportedFormats'
import { Video, createVideo } from '../types/Video'
import { Image, createImage } from '../types/Image'
import { ProjectConfig } from '../types/ProjectConfig'
import { VideoTemplate } from '../types/VideoTemplate'
import { ImageSceneTemplate, VideoSceneTemplate } from '../types/SceneTemplate'
import { DrawableScene, getMaxPadding } from '../types/DrawableScene'
import { ImageScene } from '../types/ImageScene'
import { ImageTemplate } from '../types/ImageTemplate'
import { Scene } from '../types/Scene'
import { Medium } from '../types/Medium'

const VIDEO_SIZE = 600;

export default function useScene(projectConfig: ProjectConfig) {
    const createdVideos = useMemo(() => projectConfig.sceneTemplate.sceneType === 'video' ?
        createVideos(projectConfig.sceneTemplate.media) :
        [],
        [projectConfig]);
    const createdImages = useMemo(() => projectConfig.sceneTemplate.sceneType === 'image' ?
        createImages(projectConfig.sceneTemplate.media) :
        [],
        [projectConfig]);
    const [scene, updateScene] = useReducer(
        (state: Scene, newState: Partial<Scene>) => (makeSceneValid(
            (state.sceneType === 'video') ?
                {
                    ...state,
                    ...(newState as Partial<VideoScene>),
                } : (state.sceneType === 'image') ?
                    {
                        ...state,
                        ...(newState as Partial<ImageScene>),
                    } :
                    state)),
        createInitialScene(projectConfig.sceneTemplate, createdVideos, createdImages)
    );

    useEffect(() => {
        updateScene(createInitialScene(projectConfig.sceneTemplate, createdVideos, createdImages));
    }, [projectConfig, createdVideos, createdImages]);

    const updateMedium = useCallback((index: number, update: Partial<Medium>) => {
        if (scene.sceneType === 'video') {
            const updatedMedia = updateVideoOnIndex(scene, index, update as Partial<Video>);
            updateScene({ media: updatedMedia });
        }
        else if (scene.sceneType === 'image') {
            const updatedMedia = updateImageOnIndex(scene, index, update as Partial<Image>);
            updateScene({ media: updatedMedia });
        }
    }, [scene, updateScene]);

    if (scene.sceneType === 'video') {
        scene.media.forEach((v) => {
            v.htmlVideo.onloadedmetadata = null;
            v.htmlVideo.onloadedmetadata = () => {
                const updatedVideos = updateVideoOnIndex(
                    scene,
                    v.index,
                    {
                        startTime: 0,
                        endTime: v.htmlVideo.duration,
                        totalDuration: v.htmlVideo.duration,
                        naturalDimensions: { width: v.htmlVideo.videoWidth, height: v.htmlVideo.videoHeight }
                    });
                const sceneEnd = Math.max(scene.endTime, ...updatedVideos.map((v) => v.totalDuration + v.sceneOffset));
    
                v.htmlVideo.width = Math.min(VIDEO_SIZE, v.htmlVideo.videoWidth);
                v.htmlVideo.height = Math.min(VIDEO_SIZE, v.htmlVideo.videoHeight);
    
                updateScene({ startTime: 0, endTime: sceneEnd, media: updatedVideos });
            };
    
            v.htmlVideo.onplay = (e) => updateLoadingData(e.target as any, true);
            v.htmlVideo.onwaiting = (e) => updateLoadingData(e.target as any, true);
            v.htmlVideo.onseeking = (e) => updateLoadingData(e.target as any, true);
            v.htmlVideo.onplaying = (e) => updateLoadingData(e.target as any, false);
            v.htmlVideo.oncanplaythrough = (e) => updateLoadingData(e.target as any, false);
            v.htmlVideo.oncanplay = (e) => updateLoadingData(e.target as any, false);
            v.htmlVideo.onseeked = (e) => updateLoadingData(e.target as any, false);
        });
    }
    else if (scene.sceneType === 'image') {
        scene.media.forEach((i) => {
            i.htmlImage.onload = null;
            i.htmlImage.onload = () => {
                const updatedVideos = updateImageOnIndex(
                    scene,
                    i.index,
                    {
                        naturalDimensions: { width: i.htmlImage.naturalWidth, height: i.htmlImage.naturalHeight }
                    });
    
                i.htmlImage.width = Math.min(VIDEO_SIZE, i.htmlImage.naturalWidth);
                i.htmlImage.height = Math.min(VIDEO_SIZE, i.htmlImage.naturalHeight);
    
                updateScene({ media: updatedVideos });
            };
        });
    }

    return {
        scene,
        updateScene,
        updateVideo: updateMedium
    };
}

function createInitialScene(template: VideoSceneTemplate | ImageSceneTemplate, createdVideos: Array<Video>, createdImages: Array<Image>): Scene {
    const common: DrawableScene = {
        media: [],
        requestedAspectRatio: template.requestedAspectRatio,
        requestedMaxSize: template.requestedMaxSize,
        horizontalPadding: template.horizontalPadding,
        verticalPadding: template.verticalPadding,
        horizontalSpacing: template.horizontalSpacing,
        background: {...template.background},
    };
    
    if (template.sceneType === 'video') {
        return {
            sceneType: 'video',
            fps: 20,
            maxColors: 255,
            requestedAspectRatio: template.requestedAspectRatio,
            startTime: 0,
            endTime: 0,
            formatKey: supportedVideoFormats.webp.key,
            isPrerenderingEnabled: false,
            ...common,
            media: createdVideos,
        };
    }
    else if (template.sceneType === 'image') {
        return {
            sceneType: 'image',
            requestedAspectRatio: template.requestedAspectRatio,
            formatKey: supportedImageFormats.webp.key,
            ...common,
            media: createdImages,
        };
    }
    else {
        throw new Error('Invalid medium type');
    }
}

function updateVideoOnIndex(scene: VideoScene, index: number, update: Partial<Video>) {
    const updatedVideos = [...scene.media];
    const video = updatedVideos.find((v) => v.index === index);

    if (!video) {
        throw new Error('Video with this index does not exist');
    }

    const updatedVideo = updatedVideos[index] = {
        ...video,
        ...update,
        index: index
    };

    if ('file' in update && updatedVideo.file && updatedVideo.file !== video.file) {
        updatedVideo.htmlVideo.src = URL.createObjectURL(updatedVideo.file);
    }

    makeMediumValid(updatedVideo);

    return updatedVideos;
}

// TODO: Duplicated code
function updateImageOnIndex(scene: ImageScene, index: number, update: Partial<Image>) {
    const updatedImages = [...scene.media];
    const image = updatedImages.find((v) => v.index === index);

    if (!image) {
        throw new Error('Video with this index does not exist');
    }

    const updatedImage = updatedImages[index] = {
        ...image,
        ...update,
        index: index
    };

    if ('file' in update && updatedImage.file && updatedImage.file !== image.file) {
        updatedImage.htmlImage.src = URL.createObjectURL(updatedImage.file);
    }

    makeMediumValid(updatedImage);

    return updatedImages;
}

function createVideos(videoTemplates: Array<VideoTemplate>) {
    const videos: Array<Video> = [];

    for (const template of videoTemplates) {
        videos[template.index] = createVideo(template.index, template);
    }

    updateMediaContainer(videos.map((v) => v.htmlVideo));

    return videos;
}

function createImages(imageTemplates: Array<ImageTemplate>) {
    const images: Array<Image> = [];

    for (const template of imageTemplates) {
        images[template.index] = createImage(template.index, template);
    }

    updateMediaContainer(images.map((i) => i.htmlImage));

    return images;
}

function updateMediaContainer(mediaElements: Array<HTMLElement>) {
    const container = document.getElementById('media-container');
    
    // Remove old elements
    // Those elements are from a previous scene and are not needed
    while (container?.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Add the HTML element to DOM, so the video can be loaded
    for (const element of mediaElements) {
        if (element && !container?.contains(element)) {
            container?.appendChild(element);
        }
    }
}

function makeSceneValid(scene: Scene) {
    if (scene.sceneType === 'video') {
        scene.startTime = Math.max(0, scene.startTime);
        scene.endTime = Math.max(scene.startTime, scene.endTime);
    }

    scene.horizontalPadding = Math.min(getMaxPadding(scene), scene.horizontalPadding);
    scene.verticalPadding = Math.min(getMaxPadding(scene), scene.verticalPadding);

    return scene;
}

function makeMediumValid(medium: Medium) {
    if (medium.mediumType === 'video') {
        medium.startTime = Math.max(0, medium.startTime);
        medium.endTime = Math.min(medium.totalDuration, medium.endTime);
        medium.sceneOffset = Math.max(0, medium.sceneOffset);
    
        if (medium.startTime > medium.endTime) {
            medium.startTime = medium.endTime;
        }
    }
    
    return medium;
}

function updateLoadingData(obj: any, value: boolean) {
    obj.loadingData = value;
}