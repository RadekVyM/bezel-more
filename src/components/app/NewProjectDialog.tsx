import { forwardRef, useState } from 'react'
import { Dialog, DialogProps } from '../Dialog'
import { cn } from '../../utils/tailwind'
import SectionHeading from '../SectionHeading'
import Button from '../inputs/Button'
import { MdClose } from 'react-icons/md'
import { ProjectConfig } from '../../types/ProjectConfig'

type NewProjectDialogProps = {
    hide: () => void,
    onProjectConfigSelected: (config: ProjectConfig) => void,
} & DialogProps

export const NewProjectDialog = forwardRef<HTMLDialogElement, NewProjectDialogProps>(({ animation, className, hide, onProjectConfigSelected }, ref) => {
    function onProjectClick(videosCount: number) {
        onProjectConfigSelected({ videosCount });
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
                    className='flex justify-between items-start pt-8'>
                    <SectionHeading>New project</SectionHeading>
                    <Button
                        className='p-1'
                        onClick={() => hide()}>
                        <MdClose className='w-5 h-5' />
                    </Button>
                </header>

                <Button
                    onClick={() => onProjectClick(1)}>
                    One video
                </Button>
                <Button
                    onClick={() => onProjectClick(2)}>
                    Two videos
                </Button>
            </article>
        </Dialog>
    )
});