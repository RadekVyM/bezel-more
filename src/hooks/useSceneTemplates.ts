import { useLocalStorage } from 'usehooks-ts'
import { createSceneTemplate, SceneTemplate } from '../types/SceneTemplate'
import { useCallback, useMemo } from 'react'
import { Scene } from '../types/Scene'
import { Background, createImageBackground, ImageBackground } from '../types/Background'

const SCENE_TEMPLATES_KEY = 'SCENE_TEMPLATES_KEY';

type SceneTemplateImageBackground = {
    image: string,
    aspectFill: boolean
} & Background

export default function useSceneTemplates() {
    const [savedSceneTemplates, setSceneTemplates] = useLocalStorage<Array<SceneTemplate>>(SCENE_TEMPLATES_KEY, []);
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

    const addSceneTemplate = useCallback((title: string, scene: Scene) => {
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