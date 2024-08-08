import { useEffect, useState } from 'react'
import useContentDialog from '../../hooks/useContentDialog'
import Button from '../inputs/Button'
import { IoMenu, IoOptions } from 'react-icons/io5'
import ComponentSwitch from '../ComponentSwitch'
import Container from '../Container'
import SectionHeading from '../SectionHeading'
import Tabs from '../Tabs'
import { cn } from '../../utils/tailwind'
import { RiLoopLeftLine } from 'react-icons/ri'
import ContentDialog from '../ContentDialog'
import useIsLarge from '../../hooks/useIsLarge'
import { AppStep } from '../../types/AppStep'
import { MdOutlineCreateNewFolder } from 'react-icons/md'

type MainScaffoldProps = {
    edit: React.ReactNode,
    convert: React.ReactNode,
    videoPreviewer: React.ReactNode,
    resultPreviewer: React.ReactNode,
    resetValue?: any,
    onNewProjectClick: () => void,
}

export default function MainScaffold({ edit, convert, videoPreviewer, resultPreviewer, resetValue, onNewProjectClick }: MainScaffoldProps) {
    const isLarge = useIsLarge();
    const [selectedStep, setSelectedStep] = useState<AppStep>('edit');
    const [convertDialogRef, isConvertDialogOpen, convertDialogAnimation, showConvertDialog, hideConvertDialog] =
        useContentDialog(!isLarge);
    const [editDialogRef, isEditDialogOpen, editDialogAnimation, showEditDialog, hideEditDialog] =
        useContentDialog(true);

    useEffect(() => {
        if (isConvertDialogOpen) {
            convertDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isConvertDialogOpen]);

    useEffect(() => {
        if (isEditDialogOpen) {
            editDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isEditDialogOpen]);
    
    useEffect(() => {
        setSelectedStep('edit');
    }, [resetValue]);

    return (
        <main
            className={cn(
                'w-full h-full max-h-full mx-auto px-4 grid gap-3 pb-4 bg-surface',
                isLarge ?
                    'grid-rows-[auto_1fr_auto] grid-cols-[minmax(28rem,2fr)_3fr]' :
                    'grid-rows-[auto_1fr_auto] grid-cols-[1fr]'
            )}>
            <header
                className={cn(
                    'flex items-center pt-5 pb-2 gap-2',
                    isLarge ?
                        'row-start-1 row-end-2 col-start-1 col-end-3' :
                        'row-start-1 row-end-2 col-start-1 col-end-2'
                )}>
                <PageHeading />

                <Button
                    className='gap-2'
                    onClick={onNewProjectClick}>
                    <MdOutlineCreateNewFolder className='w-4 h-4'/>
                    <span className='hidden sm:block'>New project</span>
                </Button>
                
                {
                    !isLarge &&
                    <Button
                        className='gap-2'
                        onClick={() => {
                            switch (selectedStep) {
                                case 'edit':
                                    showEditDialog();
                                    break;
                                case 'convert':
                                    showConvertDialog();
                                    break;
                            }
                        }}>
                        <IoMenu className='w-4 h-4'/>
                        <span className='hidden sm:block'>Options</span>
                    </Button>
                }
            </header>

            {
                isLarge &&
                <div
                    className='h-full max-h-full overflow-hidden'>
                    <ComponentSwitch
                        selectedKey={selectedStep}>
                        <div
                            key='edit'
                            className='h-full max-h-full'>
                            {edit}
                        </div>
                        <Container
                            key='convert'
                            className='flex flex-col h-full max-h-full overflow-auto thin-scrollbar py-7 px-5 flex-1'>
                            <SectionHeading>Convert</SectionHeading>
                            {convert}
                        </Container>
                    </ComponentSwitch>
                </div>
            }

            <div
                className='h-full max-h-full overflow-hidden'>
                <ComponentSwitch
                    selectedKey={selectedStep}>
                    <div key='edit' className='h-full @container'>{videoPreviewer}</div>
                    <div key='convert' className='h-full'>{resultPreviewer}</div>
                </ComponentSwitch>
            </div>

            <Tabs
                className={cn('col-start-1', isLarge ? 'col-end-3' : 'col-end-2')}
                tabs={[
                    { key: 'edit', title: 'Edit', icon: <IoOptions className='w-5 h-5' />, onClick: () => setSelectedStep('edit') },
                    { key: 'convert', title: 'Convert', icon: <RiLoopLeftLine className='w-5 h-5' />, onClick: () => setSelectedStep('convert') },
                ]}
                selectedTabKey={selectedStep}/>
            
            {
                !isLarge &&
                <>
                    <ContentDialog
                        ref={convertDialogRef}
                        hide={hideConvertDialog}
                        animation={convertDialogAnimation}
                        slideInFromBottom
                        heading={'Convert'}>
                        {convert}
                    </ContentDialog>

                    <ContentDialog
                        ref={editDialogRef}
                        hide={hideEditDialog}
                        animation={editDialogAnimation}
                        slideInFromBottom
                        heading={'Edit'}>
                        {edit}
                    </ContentDialog>
                </>
            }
        </main>
    )
}

function PageHeading() {
    return (
        <h1 title='bezel-more' className='font-bold text-xl flex-1'>
            bezel<span aria-hidden className='line-through text-on-surface-muted select-none'>-less</span><span className='handwritten text-2xl'>-more</span>
        </h1>
    )
}