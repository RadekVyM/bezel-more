import { hexToHsva } from '@uiw/react-color'
import { BEZELS } from '../bezels'
import { Background, createSolidBackground, ImageBackground } from './Background'
import { Scene } from './Scene'
import { createDefaultVideoTemplate, createVideoTemplate, VideoTemplate } from './VideoTemplate'
import { PREDEFINED_IMAGE_BACKGROUND_PATHS } from '../backgrounds'
import { DrawableScene } from './DrawableScene'
import { v4 as uuidv4 } from 'uuid'

export type SceneTemplate = {
    id: string,
    title: string,
    videos: Array<VideoTemplate>,
    background: Background
} & DrawableScene

export const DEFAULT_SCENE_TEMPLATES = [
    createDefaultSceneTemplate('One video', [createDefaultVideoTemplate(0)]),
    createDefaultSceneTemplate('Two videos', [createDefaultVideoTemplate(0, BEZELS['android_gold_19,5_9'].key), createDefaultVideoTemplate(1)]),
];

export function createSceneTemplate(title: string, scene: Scene): SceneTemplate {
    return {
        id: uuidv4(),
        title,
        videos: scene.videos.map((v) => createVideoTemplate(v)),
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

export function createDefaultSceneTemplate(title: string, videos?: Array<VideoTemplate>): SceneTemplate {
    return {
        id: uuidv4(),
        title,
        videos: videos || [createDefaultVideoTemplate(0)],
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