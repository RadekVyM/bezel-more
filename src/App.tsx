import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import VideoPreviewer from './components/VideoPreviewer'
import Loading from './components/Loading'
import useConversionConfig from './hooks/useConversionConfig'
import { ConversionProgress } from './types/ConversionProgress'
import SectionHeading from './components/SectionHeading'
import { getBezel } from './bezels'
import BezelSelection from './components/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { IoMenu, IoOptions } from 'react-icons/io5'
import { useMediaQuery } from 'usehooks-ts'
import useContentDialog from './hooks/useContentDialog'
import { cn } from './utils/tailwind'
import ContentDialog from './components/ContentDialog'
import Container from './components/Container'
import Tabs from './components/Tabs'
import { ConversionConfig } from './services/video/ConversionConfig'
import FileSelection from './components/FileSelection'
import TrimConfiguration from './components/TrimConfiguration'
import useConvert from './hooks/useConvert'
import ResultPreviewer from './components/ResultPreviewer'
import ConversionConfiguration from './components/ConversionConfiguration'
import Button from './components/Button'
import ComponentSwitch from './components/ComponentSwitch'
import SubsectionHeading from './components/SubsectionHeading'

type EditProps = {
    video: File | null | undefined,
    conversionConfig: ConversionConfig,
    withTitle?: boolean,
    setVideo: (video: File | null | undefined) => void,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
}

type ConvertProps = {
    conversionConfig: ConversionConfig,
    video: File | null | undefined,
    converting: boolean,
    withTitle?: boolean,
    convert: () => Promise<void>,
    updateConversionConfig: (conversionConfig: Partial<ConversionConfig>) => void,
}

type ConvertButtonProps = {
    convert: () => void,
    disabled: boolean,
    converting: boolean,
    className?: string
}

type MainScaffoldProps = {
    edit: React.ReactNode,
    convert: React.ReactNode,
    videoPreviewer: React.ReactNode,
    resultPreviewer: React.ReactNode,
}

type Step = 'edit' | 'convert';

export default function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [video, setVideo] = useState<File | null | undefined>(null);
    const [progress, setProgress] = useState<ConversionProgress | null>(null);
    const [conversionConfig, updateConversionConfig] = useConversionConfig();
    const { convert, converting, result, resultFileName, resultSize } = useConvert(conversionConfig, ffmpegRef.current, video, () => setProgress(null));

    useEffect(() => {
        loadFFmpeg();
    }, []);

    async function loadFFmpeg() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        ffmpeg.on('progress', ({ progress, time }) => {
            console.log(`progress: ${progress} time: ${time}`);
            setProgress({ progress, time });
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setReady(true);
    }

    return ready ? (
        <MainScaffold
            edit={
                <Edit
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig} 
                    video={video}
                    setVideo={setVideo} />
            }
            convert={
                <Convert
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig}
                    video={video}
                    convert={convert}
                    converting={converting} />
            }
            videoPreviewer={
                <VideoPreviewer
                    className='h-full'
                    video={video}
                    bezel={getBezel(conversionConfig.bezelKey)}
                    showBezel={conversionConfig.withBezel}
                    onDurationLoad={(duration => updateConversionConfig({ start: 0, end: duration }))} />
            }
            resultPreviewer={
                <ResultPreviewer
                    className='h-full'
                    resultUrl={result}
                    resultSize={resultSize}
                    progress={progress}
                    fileName={resultFileName} />
            }/>
        ) :
        (<main
            className='min-h-screen w-full grid place-content-center bg-surface text-on-surface'>
            <Loading
                className='h-10 w-10 border-4' />
        </main>)
}

function MainScaffold({ edit, convert, videoPreviewer, resultPreviewer }: MainScaffoldProps) {
    const isLarge = useMediaQuery('(min-width: 60rem)');
    const [selectedStep, setSelectedStep] = useState<Step>('edit');
    const [convertDialogRef, isConvertDialogOpen, convertDialogAnimation, showConvertDialog, hideConvertDialog] =
        useContentDialog(!isLarge);
    const [bezelDialogRef, isBezelDialogOpen, bezelDialogAnimation, showBezelDialog, hideBezelDialog] =
        useContentDialog(true);

    useEffect(() => {
        if (isConvertDialogOpen) {
            convertDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isConvertDialogOpen]);

    useEffect(() => {
        if (isBezelDialogOpen) {
            bezelDialogRef.current?.scrollTo({ top: 0 })
        }
    }, [isBezelDialogOpen]);
    
    return (
        <main
            className={cn(
                'w-full h-full max-h-full mx-auto px-4 grid gap-3 pb-4 bg-surface',
                isLarge ?
                    'grid-rows-[auto_1fr_auto] grid-cols-[minmax(20rem,2fr)_3fr]' :
                    'grid-rows-[auto_1fr_auto] grid-cols-[1fr]'
            )}>
            <header
                className={cn(
                    'flex justify-between items-center pt-8 pb-6',
                    isLarge ?
                        'row-start-1 row-end-2 col-start-1 col-end-3' :
                        'row-start-1 row-end-2 col-start-1 col-end-2'
                )}>
                <PageHeading />

                {
                    !isLarge &&
                    <Button
                        className='gap-2'
                        onClick={() => {
                            switch (selectedStep) {
                                case 'edit':
                                    showBezelDialog();
                                    break;
                                case 'convert':
                                    showConvertDialog();
                                    break;
                            }
                        }}>
                        <IoMenu className='w-4 h-4'/>
                        Options
                    </Button>
                }
            </header>

            {
                isLarge &&
                <Container
                    className='h-full max-h-full overflow-auto thin-scrollbar py-7 px-5 flex-1'>
                    <ComponentSwitch
                        selectedKey={selectedStep}>
                        <div key='edit'>
                            <SectionHeading>Edit</SectionHeading>
                            {edit}
                        </div>
                        <div key='convert'>
                            <SectionHeading>Convert</SectionHeading>
                            {convert}
                        </div>
                    </ComponentSwitch>
                </Container>
            }

            <Container
                className='h-full max-h-full p-5'>
                <ComponentSwitch
                    selectedKey={selectedStep}>
                    <div key='edit' className='h-full'>{videoPreviewer}</div>
                    <div key='convert' className='h-full'>{resultPreviewer}</div>
                </ComponentSwitch>
            </Container>

            <Tabs
                className={cn('col-start-1', isLarge ? 'col-end-3' : 'col-end-2')}
                tabs={[
                    { key: 'edit', title: 'Edit', icon: <IoOptions className='w-4 h-4' />, onClick: () => setSelectedStep('edit') },
                    { key: 'convert', title: 'Convert', icon: <RiLoopLeftLine className='w-4 h-4' />, onClick: () => setSelectedStep('convert') },
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
                        ref={bezelDialogRef}
                        hide={hideBezelDialog}
                        animation={bezelDialogAnimation}
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
        <h1 title='bezel-more' className='font-bold text-xl'>
            bezel<span aria-hidden className='line-through text-on-surface-muted'>-less</span><span className='handwritten text-2xl'>-more</span>
        </h1>
    )
}

function Edit({ conversionConfig, video, withTitle, updateConversionConfig, setVideo }: EditProps) {
    return (
        <div
            className='flex flex-col gap-6'>
            <div>
                {withTitle && <SectionHeading>Edit</SectionHeading>}
                <FileSelection
                    video={video}
                    setVideo={setVideo} />
            </div>
            <div>
                <SubsectionHeading>Trim video</SubsectionHeading>
                <TrimConfiguration
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig}/>
            </div>
            <div>
                <SubsectionHeading>Bezels</SubsectionHeading>
                <BezelSelection
                    conversionConfig={conversionConfig}
                    updateConversionConfig={updateConversionConfig} />
            </div>
        </div>
    )
}

function Convert({ conversionConfig, video, converting, withTitle, convert, updateConversionConfig }: ConvertProps) {
    return (
        <>
            {withTitle && <SectionHeading>Convert</SectionHeading>}

            <ConversionConfiguration
                conversionConfig={conversionConfig}
                updateConversionConfig={updateConversionConfig} />

            <ConvertButton
                convert={convert}
                disabled={converting || !video}
                converting={converting}
                className='mt-5' />
        </>
    )
}

function ConvertButton({ convert, disabled, converting, className }: ConvertButtonProps) {
    return (
        <Button
            className={cn('flex items-center', className)}
            onClick={convert}
            disabled={disabled}>
            {
                !converting ?
                    <RiLoopLeftLine className='inline-block w-4 h-4' /> :
                    <Loading />
            }
            <span className='ml-3'>Convert</span>
        </Button>
    )
}