import { Video } from '../../types/Video'
import { getTotalSceneDuration, VideoScene } from '../../types/VideoScene'

export default function calculateTrimAndPad(scene: VideoScene, video: Video) {
    const trim = calculateVideoTrim(scene, video);

    return {
        videoStart: trim.videoStart,
        videoEnd: trim.videoEnd,
        /*
        videoStart: scene.isPrerenderingEnabled ? null : trim.videoStart,
        videoEnd: scene.isPrerenderingEnabled ? null : trim.videoEnd,
        */
        videoStartPadDuration: Math.max(0, trim.calculatedVideoStart + video.sceneOffset - scene.startTime),
        videoEndPadDuration: Math.max(0, scene.endTime - (trim.calculatedVideoEnd + video.sceneOffset)),
    };
}

function calculateVideoTrim(scene: VideoScene, video: Video) {
    const videoStart = Math.max(video.startTime, scene.startTime - video.sceneOffset);
    const videoEnd = Math.min(video.endTime, scene.endTime - video.sceneOffset);
    const totalDuration = getTotalSceneDuration(scene);

    return {
        calculatedVideoStart: videoStart,
        calculatedVideoEnd: videoEnd,
        videoStart: videoStart <= 0 ? null : videoStart,
        videoEnd: videoEnd >= totalDuration ? null : videoEnd
    };
}