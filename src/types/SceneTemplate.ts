import { hexToHsva } from '@uiw/react-color'
import { BEZELS } from '../bezels'
import { Background, createSolidBackground, ImageBackground } from './Background'
import { VideoScene } from './VideoScene'
import { createDefaultVideoTemplate, createVideoTemplate, VideoTemplate } from './VideoTemplate'
import { PREDEFINED_IMAGE_BACKGROUND_PATHS } from '../backgrounds'
import { DrawableScene } from './DrawableScene'
import { v4 as uuidv4 } from 'uuid'
import { createDefaultImageTemplate, createImageTemplate, ImageTemplate } from './ImageTemplate'
import { MediumTemplate } from './MediumTemplate'
import { ImageScene } from './ImageScene'

export type VideoSceneTemplate = {
    sceneType: 'video',
    media: Array<VideoTemplate>,
} & SceneTemplate

export type ImageSceneTemplate = {
    sceneType: 'image',
    media: Array<ImageTemplate>,
} & SceneTemplate

export type SceneTemplate = {
    id: string,
    title: string,
    media: Array<MediumTemplate>,
    background: Background
} & DrawableScene

export const DEFAULT_SCENE_TEMPLATES = [
    createDefaultVideoSceneTemplate('One video', [createDefaultVideoTemplate(0)]),
    createDefaultVideoSceneTemplate('Two videos', [createDefaultVideoTemplate(0, BEZELS['android_gold_19,5_9'].key), createDefaultVideoTemplate(1)]),
    createDefaultImageSceneTemplate('One image', [createDefaultImageTemplate(0)]),
];

export function createVideoSceneTemplate(title: string, scene: VideoScene): VideoSceneTemplate {
    return {
        sceneType: 'video',
        media: scene.media.map((v) => createVideoTemplate(v)),
        ...createSceneTemplate(title, scene)
    };
}

export function createDefaultVideoSceneTemplate(title: string, videos?: Array<VideoTemplate>): VideoSceneTemplate {
    return {
        sceneType: 'video',
        media: videos || [createDefaultVideoTemplate(0)],
        ...createDefaultSceneTemplate(title)
    };
}

export function createImageSceneTemplate(title: string, scene: ImageScene): ImageSceneTemplate {
    return {
        sceneType: 'image',
        media: scene.media.map((i) => createImageTemplate(i)),
        ...createSceneTemplate(title, scene)
    };
}

export function createDefaultImageSceneTemplate(title: string, images?: Array<ImageTemplate>): ImageSceneTemplate {
    return {
        sceneType: 'image',
        media: images || [createDefaultImageTemplate(0)],
        ...createDefaultSceneTemplate(title)
    };
}

function createSceneTemplate(title: string, scene: DrawableScene) {
    return {
        id: uuidv4(),
        title,
        requestedAspectRatio: scene.requestedAspectRatio,
        requestedMaxSize: scene.requestedMaxSize,
        horizontalPadding: scene.horizontalPadding,
        verticalPadding: scene.verticalPadding,
        horizontalSpacing: scene.horizontalSpacing,
        background: scene.background.type === 'image' && !PREDEFINED_IMAGE_BACKGROUND_PATHS.some((p) => (scene.background as ImageBackground).image.src.endsWith(p)) ?
            createDefaultBackground() :
            scene.background
    };
}

function createDefaultSceneTemplate(title: string) {
    return {
        id: uuidv4(),
        title,
        requestedAspectRatio: undefined,
        requestedMaxSize: 480,
        horizontalPadding: 0,
        verticalPadding: 0,
        horizontalSpacing: 0,
        background: createDefaultBackground()
    };
}

function createDefaultBackground() {
    return createSolidBackground(hexToHsva('#00000000'));
}