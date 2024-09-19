import { useLocalStorage } from 'usehooks-ts'
import { createImageSceneTemplate, createVideoSceneTemplate, ImageSceneTemplate, SceneTemplate, VideoSceneTemplate } from '../types/SceneTemplate'
import { useCallback, useMemo } from 'react'
import { VideoScene } from '../types/VideoScene'
import { Background, createImageBackground, ImageBackground } from '../types/Background'
import { ImageScene } from '../types/ImageScene'

const SCENE_TEMPLATES_KEY = 'SCENE_TEMPLATES_KEY';

type SceneTemplateImageBackground = {
    image: string,
    aspectFill: boolean
} & Background

export default function useSceneTemplates() {
    const [savedSceneTemplates, setSceneTemplates] = useLocalStorage<Array<VideoSceneTemplate | ImageSceneTemplate>>(SCENE_TEMPLATES_KEY, []);
    const sceneTemplates = useMemo(() => savedSceneTemplates.map((st) => {
        if (st.background.type === 'image') {
            // I do not save whole HTMLImageElements, but only image paths
            const newSceneTemplate = { ...st };
            const background = st.background as SceneTemplateImageBackground;
            newSceneTemplate.background = createImageBackground(background.image, background.aspectFill);
            st = newSceneTemplate;
        }
        return st;
    }), [savedSceneTemplates]);

    const addSceneTemplate = useCallback((title: string, scene: VideoScene | ImageScene) => {
        const template = createSceneTemplate(title, scene);
        if (template.background.type === 'image') {
            // I do not want to save whole HTMLImageElements, but only image paths
            const imageBackground = template.background as ImageBackground;
            (template.background as SceneTemplateImageBackground).image = imageBackground.image.src;
        }
        setSceneTemplates((old) => [...old, template]);
    }, [setSceneTemplates]);

    const removeSceneTemplate = useCallback((id: string) => {
        setSceneTemplates((old) => [...old.filter((st) => st.id !== id)])
    }, [setSceneTemplates]);

    return {
        sceneTemplates,
        addSceneTemplate,
        removeSceneTemplate
    };
}

function createSceneTemplate(title: string, scene: VideoScene | ImageScene) {
    if (scene.sceneType === 'video') {
        return createVideoSceneTemplate(title, scene);
    }
    else if (scene.sceneType === 'image') {
        return createImageSceneTemplate(title, scene);
    }
    throw new Error('Invalid medium type');
}