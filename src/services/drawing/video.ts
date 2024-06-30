import { BezelImages } from '../../types/BezelImages'
import { Scene, getVideoRectInScene } from '../../types/Scene'
import { Video } from '../../types/Video'

/** Canvas that is used for drawing intermediate steps. */ 
const tempCanvas = document.createElement('canvas');

export function drawVideos(
    context: CanvasRenderingContext2D,
    scene: Scene,
    bezelImages: Array<BezelImages>,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number
) {
    try {
        drawMask(context, scene, bezelImages, sceneX, sceneY, sceneWidth, sceneHeight, sceneScale);
    }
    catch { }

    for (const video of scene.videos) {
        const videoBezelImages = bezelImages[video.index];

        if (!videoBezelImages) {
            continue;
        }

        try {
            drawVideo(context, video, scene, videoBezelImages, sceneX, sceneY, sceneWidth, sceneHeight, sceneScale);
        }
        catch { }
    };
}

function drawMask(
    context: CanvasRenderingContext2D,
    scene: Scene,
    bezelImages: Array<BezelImages>,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number
) {
    const haveCornerRadius = scene.videos.some((video) => video.cornerRadius > 0);
    const rects = scene.videos.map((video) => calculateVideoDimensions(video, scene, bezelImages[video.index], sceneScale, sceneX, sceneY, sceneWidth, sceneHeight));

    if (haveCornerRadius) {
        tempCanvas.width = sceneWidth + sceneX;
        tempCanvas.height = sceneHeight + sceneY;
        const tempContext = tempCanvas.getContext('2d')!;
    
        tempContext.clearRect(0, 0, sceneWidth, sceneHeight);
    
        for (const video of scene.videos) {
            const {
                totalX,
                totalY,
                totalWidth,
                totalHeight
            } = rects[video.index];
        
            tempContext.fillStyle = 'black';
            tempContext.globalCompositeOperation = 'source-over';
    
            tempContext.beginPath();
            tempContext.roundRect(totalX, totalY, totalWidth, totalHeight, Math.min(video.cornerRadius, totalWidth / 2, totalHeight / 2));
            tempContext.fill();
        }
    }

    for (const video of scene.videos) {
        const videoBezelImages = bezelImages[video.index];

        if (!videoBezelImages) {
            continue;
        }

        const {
            totalX,
            totalY,
            totalWidth,
            totalHeight
        } = rects[video.index];
    
        context.globalCompositeOperation = 'source-over';

        if (videoBezelImages.showBezel) {
            context.drawImage(videoBezelImages.maskImage, totalX, totalY, totalWidth, totalHeight);
        }
        else {
            context.fillStyle = 'black';
            context.fillRect(totalX, totalY, totalWidth, totalHeight);
        }
    }

    if (haveCornerRadius) {
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(tempCanvas, 0, 0);
    }
}

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

    context.globalCompositeOperation = 'source-atop';

    context.drawImage(video.htmlVideo, videoX, videoY, videoWidth, videoHeight);
    
    if (bezelImages.showBezel) {
        context.drawImage(bezelImages.image, totalX, totalY, totalWidth, totalHeight);
    }

    context.globalCompositeOperation = 'source-over';
}

function calculateVideoDimensions(video: Video, scene: Scene, bezelImages: BezelImages, sceneScale: number, sceneX: number, sceneY: number, sceneWidth: number, sceneHeight: number) {
    if (!video.naturalVideoDimensions) {
        throw new Error('Size of the video could not be determined');
    }

    const { videoWidth: w, videoHeight: h, videoX: x, videoY: y } = getVideoRectInScene(video, scene);
    const totalWidth = w * sceneScale;
    const totalHeight = h * sceneScale;
    const totalX = sceneX + (x * sceneScale);
    const totalY = sceneY + (y * sceneScale);

    const videoScale = Math.min(totalWidth / video.naturalVideoDimensions.width, totalHeight / video.naturalVideoDimensions.height) *
        (bezelImages.showBezel ? bezelImages.bezel.contentScale : 1);

    const videoWidth = video.naturalVideoDimensions.width * videoScale;
    const videoHeight = video.naturalVideoDimensions.height * videoScale;
    const videoX = (bezelImages.showBezel ? (totalWidth - videoWidth) / 2 : 0) + totalX;
    const videoY = (bezelImages.showBezel ? (totalHeight - videoHeight) / 2 : 0) + totalY;
    return { totalX, totalY, totalWidth, totalHeight, videoX, videoY, videoWidth, videoHeight };
}