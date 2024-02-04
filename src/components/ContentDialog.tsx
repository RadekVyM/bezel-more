import { createPortal } from 'react-dom'
import { forwardRef } from 'react'
import { cn } from '../utils/tailwind'
import { Dialog, DialogProps } from './Dialog'
import SectionHeading from './SectionHeading'
import Button from './Button'
import { MdClose } from 'react-icons/md'

type ContentDialogProps = {
    heading: React.ReactNode,
    animation: string,
    className?: string,
    slideInFromBottom?: boolean,
    hide: () => void,
} & DialogProps

export const ContentDialog = forwardRef<HTMLDialogElement, ContentDialogProps>(({ heading, animation, className, children, slideInFromBottom, hide }, ref) => {
    return (
        createPortal(
            <Dialog
                ref={ref}
                animation={animation}
                className={cn(className, 'w-full h-full px-6 pb-6 thin-scrollbar', slideInFromBottom ? 'max-w-full max-h-[90vh] mt-auto mb-0' : 'max-w-[30rem] max-h-full ml-auto mr-0')}>
                <article
                    className='isolate bg-inherit'>
                    <header
                        className='flex justify-between items-start sticky top-0 z-50 bg-inherit pt-8'>
                        <SectionHeading>{heading}</SectionHeading>
                        <Button
                            className='p-1'
                            onClick={() => hide()}>
                            <MdClose className='w-5 h-5' />
                        </Button>
                    </header>

                    {children}
                </article>
            </Dialog>,
            document.querySelector('body') as Element)
    )
});

ContentDialog.displayName = 'ContentDialog';
export default ContentDialog;