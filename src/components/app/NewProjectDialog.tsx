import { forwardRef, useEffect, useRef, useState } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { cn } from '../../utils/tailwind'
import SectionHeading from '../SectionHeading'
import Button from '../inputs/Button'
import { MdClose, MdOutlineCreateNewFolder } from 'react-icons/md'
import { ProjectConfig } from '../../types/ProjectConfig'
import { DEFAULT_SCENE_TEMPLATES, ImageSceneTemplate, SceneTemplate, VideoSceneTemplate } from '../../types/SceneTemplate'
import { Canvas } from '../Canvas'
import { drawSceneTemplate } from '../../services/drawing/sceneTemplate'
import useBezelImages from '../../hooks/useBezelImages'
import SubsectionHeading from '../SubsectionHeading'
import useSceneTemplates from '../../hooks/useSceneTemplates'
import { FiTrash2 } from 'react-icons/fi'
import Input from '../inputs/Input'
import { Scene } from '../../types/Scene'

type NewProjectDialogProps = {
    currentScene: Scene,
    onProjectConfigSelected: (config: ProjectConfig) => void,
} & DialogProps

export const NewProjectDialog = forwardRef<HTMLDialogElement, NewProjectDialogProps>(({ currentScene, className, state, onProjectConfigSelected }, ref) => {
    const { sceneTemplates, addSceneTemplate, removeSceneTemplate } = useSceneTemplates();
    const [newTemplateTitle, setNewTemplateTitle] = useState('');

    useEffect(() => {
        state.isOpen && setNewTemplateTitle(''); 
    }, [state.isOpen]);

    function onProjectClick(sceneTemplate: VideoSceneTemplate | ImageSceneTemplate) {
        onProjectConfigSelected({ sceneTemplate: { ...sceneTemplate } });
        state.hide();
    }
    
    return (
        <Dialog
            ref={ref}
            state={state}
            className={cn(className, 'w-full md:max-w-3xl px-6 pb-6 rounded-lg thin-scrollbar overflow-y-scroll')}>
            <article
                className='isolate bg-inherit flex flex-col'>
                <header
                    className='flex justify-between items-start pt-8 mb-4 sticky top-0 z-50 bg-inherit'>
                    <SectionHeading>New project</SectionHeading>
                    <Button
                        className='p-1'
                        onClick={state.hide}>
                        <MdClose className='w-5 h-5' />
                    </Button>
                </header>

                <TemplatesContainer
                    className='mb-6'>
                    {DEFAULT_SCENE_TEMPLATES.map((sceneTemplate) =>
                        <TemplateButton
                            key={sceneTemplate.id}
                            sceneTemplate={sceneTemplate}
                            onClick={(st) => onProjectClick(st)}/>)}
                </TemplatesContainer>

                <SubsectionHeading>Custom templates</SubsectionHeading>

                <div
                    className='flex gap-3 mb-4'>
                    <Input
                        className='flex-1'
                        placeholder='New template title...'
                        value={newTemplateTitle}
                        onChange={(e) => setNewTemplateTitle(e.target.value)} />
                    <Button
                        className='gap-2'
                        onClick={() => addSceneTemplate(newTemplateTitle, currentScene)}
                        disabled={newTemplateTitle.trim().length === 0}>
                        <MdOutlineCreateNewFolder className='w-4 h-4'/>
                        <span className='hidden sm:block'>Create</span>
                    </Button>
                </div>

                {sceneTemplates.length > 0 ?
                    <TemplatesContainer>
                        {sceneTemplates.map((sceneTemplate) =>
                            <div
                                key={sceneTemplate.id}
                                className='relative'>
                                <TemplateButton
                                    key={sceneTemplate.title}
                                    className='w-full h-full peer'
                                    sceneTemplate={sceneTemplate}
                                    onClick={(st) => onProjectClick(st)} />

                                <Button
                                    className='opacity-0 peer-focus-within:opacity-100 peer-hover:opacity-100 hover:opacity-100 focus:opacity-100
                                        transition-opacity
                                        absolute top-0 right-0 m-3 p-1.5'
                                    onClick={() => removeSceneTemplate(sceneTemplate.id)}>
                                    <FiTrash2
                                        className='w-4 h-4' />
                                </Button>
                            </div>)}
                    </TemplatesContainer> :
                    <span className='mx-auto my-4 text-on-surface-container-muted text-sm'>No templates created yet</span>}
            </article>
        </Dialog>
    )
});

function TemplateButton(props: {
    sceneTemplate: VideoSceneTemplate | ImageSceneTemplate,
    className?: string,
    onClick: (sceneTemplate: VideoSceneTemplate | ImageSceneTemplate) => void
}) {
    return (
        <Button
            className={cn('grid grid-rows-[8rem_auto] p-5 gap-4 h-fit justify-stretch', props.className)}
            onClick={() => props.onClick(props.sceneTemplate)}>
            <TemplatePreview
                className='w-full'
                sceneTemplate={props.sceneTemplate} />
            {props.sceneTemplate.title}
        </Button>
    )
}

function TemplatePreview(props: {
    sceneTemplate: SceneTemplate,
    className?: string
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bezelImagesRef = useBezelImages(props.sceneTemplate, render, true);

    useEffect(() => render(), [props.sceneTemplate]);

    function render() {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        context.imageSmoothingEnabled = true;
        drawSceneTemplate(context, props.sceneTemplate, bezelImagesRef.current, { width: canvas.width, height: canvas.height });
    }
    
    return (
        <Canvas
            ref={canvasRef}
            className={props.className}
            onDimensionsChanges={render} />
    )
}

function TemplatesContainer(props: {
    className?: string,
    children: React.ReactNode
}) {
    return (
        <div
            className={cn('grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] grid-rows-[auto] gap-3', props.className)}>
            {props.children}
        </div>
    )
}