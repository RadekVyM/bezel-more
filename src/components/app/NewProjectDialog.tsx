import { forwardRef } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { cn } from '../../utils/tailwind'
import SectionHeading from '../SectionHeading'
import Button from '../inputs/Button'
import { MdClose } from 'react-icons/md'
import { ProjectConfig } from '../../types/ProjectConfig'
import BezelThumbnail from '../BezelThumbnail'
import { BEZELS } from '../../bezels'
import { DEFAULT_SCENE_TEMPLATES, SceneTemplate } from '../../types/SceneTemplate'

type NewProjectDialogProps = {
    hide: () => void,
    onProjectConfigSelected: (config: ProjectConfig) => void,
} & DialogProps

export const NewProjectDialog = forwardRef<HTMLDialogElement, NewProjectDialogProps>(({ animation, className, hide, onProjectConfigSelected }, ref) => {
    function onProjectClick(sceneTemplate: SceneTemplate) {
        onProjectConfigSelected({ sceneTemplate: { ...sceneTemplate } });
        hide();
    }
    
    return (
        <Dialog
            ref={ref}
            animation={animation}
            className={cn(className, 'w-full md:max-w-3xl px-6 pb-6 rounded-lg')}>
            <article
                className='isolate flex flex-col'>
                <header
                    className='flex justify-between items-start pt-8 mb-4'>
                    <SectionHeading>New project</SectionHeading>
                    <Button
                        className='p-1'
                        onClick={() => hide()}>
                        <MdClose className='w-5 h-5' />
                    </Button>
                </header>

                <div
                    className='grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] grid-rows-[auto] gap-3'>
                    <Button
                        className='grid grid-rows-[1fr_auto] p-5 gap-4 h-fit'
                        onClick={() => onProjectClick(DEFAULT_SCENE_TEMPLATES[0])}>
                        <BezelThumbnail
                            className='max-h-32 h-full w-full'
                            bezelKey={BEZELS.iphone_15_black.key}
                            modelKey={BEZELS.iphone_15_black.modelKey}
                            bezelTitle={BEZELS.iphone_15_black.title} />
                        {DEFAULT_SCENE_TEMPLATES[0].title}
                    </Button>
                    <Button
                        className='grid grid-rows-[1fr_auto] p-5 gap-4 h-fit'
                        onClick={() => onProjectClick(DEFAULT_SCENE_TEMPLATES[1])}>
                        <div
                            className='grid grid-cols-2 gap-4'>
                            <BezelThumbnail
                                className='max-h-32 h-full w-full'
                                bezelKey={BEZELS['android_gold_19,5_9'].key}
                                modelKey={BEZELS['android_gold_19,5_9'].modelKey}
                                bezelTitle={BEZELS['android_gold_19,5_9'].title} />
                            <BezelThumbnail
                                className='max-h-32 h-full w-full'
                                bezelKey={BEZELS.iphone_15_black.key}
                                modelKey={BEZELS.iphone_15_black.modelKey}
                                bezelTitle={BEZELS.iphone_15_black.title} />
                        </div>
                        {DEFAULT_SCENE_TEMPLATES[1].title}
                    </Button>
                </div>
            </article>
        </Dialog>
    )
});