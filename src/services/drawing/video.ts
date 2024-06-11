import { BezelImages } from '../../types/BezelImages'
import { Scene, getVideoSizeInScene } from '../../types/Scene'
import { Video } from '../../types/Video'

export function drawVideo(
    context: CanvasRenderingContext2D,
    video: Video,
    scene: Scene,
    bezelImages: BezelImages,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number
) {
    const {
        totalX,
        totalY,
        totalWidth,
        totalHeight,
        videoX,
        videoY,
        videoWidth,
        videoHeight
    } = calculateVideoDimensions(video, scene, bezelImages, sceneScale, sceneX, sceneY, sceneWidth, sceneHeight);

    context.globalCompositeOperation = 'source-over';

    if (bezelImages.showBezel) {
        context.drawImage(bezelImages.maskImage, totalX, totalY, totalWidth, totalHeight);
        context.globalCompositeOperation = 'source-atop';
    }

    context.drawImage(video.htmlVideo, videoX, videoY, videoWidth, videoHeight);
    context.globalCompositeOperation = 'source-over';

    if (bezelImages.showBezel) {
        context.drawImage(bezelImages.image, totalX, totalY, totalWidth, totalHeight);
    }
}

function calculateVideoDimensions(video: Video, scene: Scene, bezelImages: BezelImages, sceneScale: number, sceneX: number, sceneY: number, sceneWidth: number, sceneHeight: number) {
    if (!video.naturalVideoDimensions) {
        throw new Error('Size of the video could not be determined')
    }

    const { videoWidth: w, videoHeight: h } = getVideoSizeInScene(video, scene)
    const totalWidth = w * sceneScale
    const totalHeight = h * sceneScale
    const totalX = sceneX + ((sceneWidth - totalWidth) / 2)
    const totalY = sceneY + ((sceneHeight - totalHeight) / 2)

    const videoScale = Math.min(totalWidth / video.naturalVideoDimensions.width, totalHeight / video.naturalVideoDimensions.height) *
        (bezelImages.showBezel ? bezelImages.bezel.contentScale : 1)

    const videoWidth = video.naturalVideoDimensions.width * videoScale
    const videoHeight = video.naturalVideoDimensions.height * videoScale
    const videoX = (bezelImages.showBezel ? (totalWidth - videoWidth) / 2 : 0) + totalX
    const videoY = (bezelImages.showBezel ? (totalHeight - videoHeight) / 2 : 0) + totalY
    return { totalX, totalY, totalWidth, totalHeight, videoX, videoY, videoWidth, videoHeight }
}