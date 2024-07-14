import { AspectRatio } from './AspectRatio'
import { Size } from './Size'
import { getVideoSize, VideoLayout } from './VideoLayout'

export type SceneLayout = {
    videos: Array<VideoLayout>,
    requestedAspectRatio?: AspectRatio,
    requestedMaxSize: number,
    horizontalPadding: number,
    verticalPadding: number,
    horizontalSpacing: number,
}

export function getSceneSize(scene: SceneLayout): Size {
    if (scene.requestedAspectRatio) {
        const scale = Math.max(scene.requestedAspectRatio.width / scene.requestedMaxSize, scene.requestedAspectRatio.height / scene.requestedMaxSize);
        return { width: Math.round(scene.requestedAspectRatio.width / scale), height: Math.round(scene.requestedAspectRatio.height / scale) };
    }

    const { totalVideosWidth, totalVideosHeight } = getVideoSizes(scene);
    const { horizontalSpacingPadding, verticalSpacingPadding } = getSpacingPaddings(scene);
    const scale = Math.max(totalVideosWidth / (scene.requestedMaxSize - horizontalSpacingPadding), totalVideosHeight / (scene.requestedMaxSize - verticalSpacingPadding));
    const width = (totalVideosWidth / scale) + horizontalSpacingPadding;
    const height = (totalVideosHeight / scale) + verticalSpacingPadding;

    return { width: Math.round(width), height: Math.round(height) };
}

export function getVideoRectInScene(video: VideoLayout, scene: SceneLayout) {
    const sceneSize = getSceneSize(scene);
    const { videoSizes, totalVideosWidth, totalVideosHeight } = getVideoSizes(scene);
    const { horizontalSpacingPadding, verticalSpacingPadding } = getSpacingPaddings(scene);
    const scale = Math.max(totalVideosWidth / (sceneSize.width - horizontalSpacingPadding), totalVideosHeight / (sceneSize.height - verticalSpacingPadding));

    const left = (sceneSize.width - (totalVideosWidth / scale) - horizontalSpacingPadding) / 2;
    const index = scene.videos.indexOf(video);
    const videoSize = videoSizes[index];
    const videoWidth = Math.max(1, Math.round(videoSize.width / scale));
    const videoHeight = Math.max(1, Math.round(videoSize.height / scale));
    const x = left + (scene.horizontalPadding / 2) + (index * scene.horizontalSpacing) + videoSizes.slice(0, index).reduce((prev, current) => prev + (current.width / scale), 0);
    const y = (sceneSize.height - videoHeight) / 2;

    return { videoWidth: videoWidth, videoHeight: videoHeight, videoX: x, videoY: y };
}

export function getMaxPadding(scene: SceneLayout) {
    return Math.round(scene.requestedMaxSize * 0.95);;
}

function getVideoSizes(scene: SceneLayout) {
    const videoSizes = scene.videos.map((video) => getVideoSize(video, Math.max(0, scene.requestedMaxSize * 10)));
    const maxHeight = Math.max(...videoSizes.map((size) => size ? size.height : 0));

    for (const size of videoSizes) {
        if (!size) {
            throw new Error('Video size could not be loaded');
        }

        size.width = size.width * (maxHeight / size.height);
        size.height = maxHeight;
    }

    const totalVideosWidth = videoSizes.reduce((prev, current) => prev + (current?.width || 0), 0);
    const totalVideosHeight = maxHeight;

    return { videoSizes: videoSizes as Array<Size>, totalVideosWidth, totalVideosHeight };
}

function getSpacingPaddings(scene: SceneLayout) {
    const horizontalSpacingPadding = scene.horizontalPadding + ((scene.videos.length - 1) * scene.horizontalSpacing);
    const verticalSpacingPadding = scene.verticalPadding;

    return { horizontalSpacingPadding, verticalSpacingPadding };
}