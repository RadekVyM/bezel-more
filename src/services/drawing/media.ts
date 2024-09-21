import { BezelImages } from '../../types/BezelImages'
import { DrawableScene, getMediumRectInScene } from '../../types/DrawableScene'
import { DrawableMedium } from '../../types/DrawableMedium'
import { NoBezelImagesError, NoDimensionsError } from '../../types/Errors'
import { drawRotatedImage } from '../../utils/canvas'

type DrawMediumCallback = (context: CanvasRenderingContext2D, meidum: DrawableMedium, left: number, top: number, width: number, height: number) => void

/** Canvas that is used for drawing intermediate steps. */ 
const tempCanvas = document.createElement('canvas');

export function drawMedia(
    context: CanvasRenderingContext2D,
    scene: DrawableScene,
    bezelImages: Array<BezelImages>,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number,
    drawOneMedium: DrawMediumCallback
) {
    try {
        drawMask(context, scene, bezelImages, sceneX, sceneY, sceneWidth, sceneHeight, sceneScale);
    }
    catch (error) {
        // NoDimensionsError and NoBezelImagesError are caused by trying to draw too early
        // They can be ignored
        if (!(error instanceof NoDimensionsError || error instanceof NoBezelImagesError)) {
            throw error;
        }
    }

    for (const medium of scene.media) {
        const mediumBezelImages = bezelImages[medium.index];

        if (!mediumBezelImages) {
            continue;
        }

        try {
            drawMedium(context, medium, scene, mediumBezelImages, sceneX, sceneY, sceneWidth, sceneHeight, sceneScale, drawOneMedium);
        }
        catch (error) {
            // NoDimensionsError and NoBezelImagesError are caused by trying to draw too early
            // They can be ignored
            if (!(error instanceof NoDimensionsError || error instanceof NoBezelImagesError)) {
                throw error;
            }
        }
    };
}

function drawMask(
    context: CanvasRenderingContext2D,
    scene: DrawableScene,
    bezelImages: Array<BezelImages>,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number
) {
    const haveCornerRadius = scene.media.some((medium) => medium.cornerRadius > 0);
    const rects = scene.media.map((medium) => calculateMediumDimensions(medium, scene, bezelImages[medium.index], sceneScale, sceneX, sceneY, sceneWidth, sceneHeight));

    if (haveCornerRadius) {
        tempCanvas.width = sceneWidth + sceneX;
        tempCanvas.height = sceneHeight + sceneY;
        const tempContext = tempCanvas.getContext('2d')!;
    
        tempContext.clearRect(0, 0, sceneWidth, sceneHeight);
    
        for (const medium of scene.media) {
            const {
                totalX,
                totalY,
                totalWidth,
                totalHeight
            } = rects[medium.index];
        
            tempContext.fillStyle = 'black';
            tempContext.globalCompositeOperation = 'source-over';
    
            tempContext.beginPath();
            tempContext.roundRect(totalX, totalY, totalWidth, totalHeight, Math.min(medium.cornerRadius * sceneScale, totalWidth / 2, totalHeight / 2));
            tempContext.fill();
        }
    }

    for (const medium of scene.media) {
        const mediumBezelImages = bezelImages[medium.index];

        if (!mediumBezelImages) {
            continue;
        }

        const {
            totalX,
            totalY,
            totalWidth,
            totalHeight
        } = rects[medium.index];
    
        context.globalCompositeOperation = 'source-over';

        if (mediumBezelImages.showBezel) {
            drawRotatedImage(context, mediumBezelImages.maskImage, totalX, totalY, totalWidth, totalHeight, medium.orientation);
        }
        else {
            context.fillStyle = 'black';
            context.fillRect(totalX, totalY, totalWidth, totalHeight);
        }
    }

    if (haveCornerRadius && tempCanvas.width > 0 && tempCanvas.height > 0) {
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(tempCanvas, 0, 0);
    }
}

function drawMedium(
    context: CanvasRenderingContext2D,
    medium: DrawableMedium,
    scene: DrawableScene,
    bezelImages: BezelImages,
    sceneX: number,
    sceneY: number,
    sceneWidth: number,
    sceneHeight: number,
    sceneScale: number,
    draw: DrawMediumCallback
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
    } = calculateMediumDimensions(medium, scene, bezelImages, sceneScale, sceneX, sceneY, sceneWidth, sceneHeight);

    context.globalCompositeOperation = 'source-atop';

    draw(context, medium, videoX, videoY, videoWidth, videoHeight);
    
    context.globalCompositeOperation = 'source-over';

    if (bezelImages.showBezel) {
        drawRotatedImage(context, bezelImages.image, totalX, totalY, totalWidth, totalHeight, medium.orientation);
    }
}

function calculateMediumDimensions(medium: DrawableMedium, scene: DrawableScene, bezelImages: BezelImages, sceneScale: number, sceneX: number, sceneY: number, sceneWidth: number, sceneHeight: number) {
    if (!medium.naturalDimensions) {
        throw new NoDimensionsError('Size of the medium could not be determined');
    }
    if (!bezelImages) {
        throw new NoBezelImagesError('No bezel images passed in');
    }

    const { mediumWidth: w, mediumHeight: h, mediumX: x, mediumY: y } = getMediumRectInScene(medium, scene);
    const totalWidth = w * sceneScale;
    const totalHeight = h * sceneScale;
    const totalX = sceneX + (x * sceneScale);
    const totalY = sceneY + (y * sceneScale);

    const videoScale = Math.min(totalWidth / medium.naturalDimensions.width, totalHeight / medium.naturalDimensions.height) *
        (bezelImages.showBezel ? bezelImages.bezel.contentScale : 1);

    const videoWidth = medium.naturalDimensions.width * videoScale;
    const videoHeight = medium.naturalDimensions.height * videoScale;
    const videoX = (bezelImages.showBezel ? (totalWidth - videoWidth) / 2 : 0) + totalX;
    const videoY = (bezelImages.showBezel ? (totalHeight - videoHeight) / 2 : 0) + totalY;
    return { totalX, totalY, totalWidth, totalHeight, videoX, videoY, videoWidth, videoHeight };
}