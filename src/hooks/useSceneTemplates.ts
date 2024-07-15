import { useLocalStorage } from 'usehooks-ts'
import { createSceneTemplate, SceneTemplate } from '../types/SceneTemplate'
import { useCallback, useMemo } from 'react'
import { Scene } from '../types/Scene'
import { createImageBackground, ImageBackground } from '../types/Background'

const SCENE_TEMPLATES_KEY = 'SCENE_TEMPLATES_KEY';

export default function useSceneTemplates() {
    const [savedSceneTemplates, setSceneTemplates] = useLocalStorage<Array<SceneTemplate>>(SCENE_TEMPLATES_KEY, []);
    const sceneTemplates = useMemo(() => savedSceneTemplates.map((st) => {
        if (st.background.type === 'image') {
            const src = (st.background as any).image as string;
            const imageBackground = st.background as ImageBackground;
            st.background = createImageBackground(src, imageBackground.aspectFill);
        }
        return st;
    }), [savedSceneTemplates]);

    const addSceneTemplate = useCallback((title: string, scene: Scene) => {
        const template = createSceneTemplate(title, scene);
        if (template.background.type === 'image') {
            const imageBackground = template.background as ImageBackground;
            (template.background as any).image = imageBackground.image.src;
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