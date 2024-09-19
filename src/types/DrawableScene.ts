import { AspectRatio } from './AspectRatio'
import { Size } from './Size'
import { getMediumSize, DrawableMedium } from './DrawableMedium'
import { Background } from './Background'

export type DrawableScene = {
    media: Array<DrawableMedium>,
    background: Background,
    requestedAspectRatio?: AspectRatio,
    requestedMaxSize: number,
    horizontalPadding: number,
    verticalPadding: number,
    horizontalSpacing: number,
}

export function getSceneSize(scene: DrawableScene): Size {
    if (scene.requestedAspectRatio) {
        const scale = Math.max(scene.requestedAspectRatio.width / scene.requestedMaxSize, scene.requestedAspectRatio.height / scene.requestedMaxSize);
        return { width: Math.round(scene.requestedAspectRatio.width / scale), height: Math.round(scene.requestedAspectRatio.height / scale) };
    }

    const { totalMediaWidth, totalMediaHeight } = getMediumSizes(scene);
    const { horizontalSpacingPadding, verticalSpacingPadding } = getSpacingPaddings(scene);
    const scale = Math.max(totalMediaWidth / (scene.requestedMaxSize - horizontalSpacingPadding), totalMediaHeight / (scene.requestedMaxSize - verticalSpacingPadding));
    const width = (totalMediaWidth / scale) + horizontalSpacingPadding;
    const height = (totalMediaHeight / scale) + verticalSpacingPadding;

    return { width: Math.round(width), height: Math.round(height) };
}

export function getMediumRectInScene(medium: DrawableMedium, scene: DrawableScene) {
    const sceneSize = getSceneSize(scene);
    const { mediumSizes, totalMediaWidth, totalMediaHeight } = getMediumSizes(scene);
    const { horizontalSpacingPadding, verticalSpacingPadding } = getSpacingPaddings(scene);
    const scale = Math.max(totalMediaWidth / (sceneSize.width - horizontalSpacingPadding), totalMediaHeight / (sceneSize.height - verticalSpacingPadding));

    const left = (sceneSize.width - (totalMediaWidth / scale) - horizontalSpacingPadding) / 2;
    const index = scene.media.indexOf(medium);
    const mediumSize = mediumSizes[index];
    const mediumWidth = Math.max(1, mediumSize.width / scale);
    const mediumHeight = Math.max(1, mediumSize.height / scale);
    const x = left + (scene.horizontalPadding / 2) + (index * scene.horizontalSpacing) + mediumSizes.slice(0, index).reduce((prev, current) => prev + (current.width / scale), 0);
    const y = (sceneSize.height - mediumHeight) / 2;

    return { mediumWidth: Math.round(mediumWidth), mediumHeight: Math.round(mediumHeight), mediumX: Math.round(x), mediumY: Math.round(y) };
}

export function getMaxPadding(scene: DrawableScene) {
    return Math.round(scene.requestedMaxSize * 0.95);;
}

function getMediumSizes(scene: DrawableScene) {
    const mediumSizes = scene.media.map((medium) => getMediumSize(medium, Math.max(0, scene.requestedMaxSize * 10)));
    const maxHeight = Math.max(...mediumSizes.map((size) => size ? size.height : 0));

    for (const size of mediumSizes) {
        size.width = size.width * (maxHeight / size.height);
        size.height = maxHeight;
    }

    const totalMediaWidth = mediumSizes.reduce((prev, current) => prev + (current?.width || 0), 0);
    const totalMediaHeight = maxHeight;

    return { mediumSizes: mediumSizes as Array<Size>, totalMediaWidth, totalMediaHeight };
}

function getSpacingPaddings(scene: DrawableScene) {
    const horizontalSpacingPadding = scene.horizontalPadding + ((scene.media.length - 1) * scene.horizontalSpacing);
    const verticalSpacingPadding = scene.verticalPadding;

    return { horizontalSpacingPadding, verticalSpacingPadding };
}