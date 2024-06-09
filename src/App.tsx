import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import VideoPreviewer from './components/VideoPreviewer'
import Loading from './components/Loading'
import { ConversionProgress } from './types/ConversionProgress'
import SectionHeading from './components/SectionHeading'
import BezelSelection from './components/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { BiMoviePlay } from 'react-icons/bi'
import { IoMenu, IoOptions } from 'react-icons/io5'
import { useMediaQuery } from 'usehooks-ts'
import useContentDialog from './hooks/useContentDialog'
import { cn } from './utils/tailwind'
import ContentDialog from './components/ContentDialog'
import Container from './components/Container'
import Tabs from './components/Tabs'
import FileSelection from './components/FileSelection'
import VideoTrimConfiguration from './components/VideoTrimConfiguration'
import useConvert from './hooks/useConvert'
import ResultPreviewer from './components/ResultPreviewer'
import ConversionConfiguration from './components/ConversionConfiguration'
import Button from './components/Button'
import ComponentSwitch from './components/ComponentSwitch'
import SubsectionHeading from './components/SubsectionHeading'
import useScene from './hooks/useScene'
import { Video } from './types/Video'
import { Scene, getFirstVideo } from './types/Scene'
import SceneSizeConfiguration from './components/SceneSizeConfiguration'
import SceneConfiguration from './components/SceneConfiguration'
import { FaRegFileVideo } from 'react-icons/fa'

type EditProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    updateVideo: (index: number, video: Partial<Video>) => void,
}

type EditSceneProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
}

type EditVideoProps = {
    video: Video,
    onFileSelected: (video: File | null | undefined) => void,
    updateVideo: (video: Partial<Video>) => void,
}

type ConvertProps = {
    scene: Scene,
    converting: boolean,
    canConvert?: boolean,
    convert: () => Promise<void>,
    updateScene: (scene: Partial<Scene>) => void,
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

type JustOneProps = {
    ffmpeg: FFmpeg,
    progress: ConversionProgress | null,
    resetProgress: () => void
}

type Step = 'edit' | 'convert';

export default function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState<ConversionProgress | null>(null);

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
        <JustOne
            ffmpeg={ffmpegRef.current}
            progress={progress}
            resetProgress={() => setProgress(null)} />
        ) :
        (<main
            className='min-h-screen w-full grid place-content-center bg-surface text-on-surface'>
            <Loading
                className='h-10 w-10 border-4' />
        </main>)
}

function JustOne({ ffmpeg, progress, resetProgress }: JustOneProps) {
    const { scene, updateScene, updateVideo } = useScene(1);
    const { convert, converting, result, resultFileName, resultSize, resultFormatKey } = useConvert(scene, ffmpeg, resetProgress);

    return (
        <MainScaffold
            edit={
                <Edit
                    updateVideo={updateVideo}
                    scene={scene}
                    updateScene={updateScene} />
            }
            convert={
                <Convert
                    scene={scene}
                    updateScene={updateScene}
                    canConvert={!!getFirstVideo(scene).file}
                    convert={convert}
                    converting={converting} />
            }
            videoPreviewer={
                <VideoPreviewer
                    className='h-full'
                    scene={scene}
                    updateScene={updateScene}
                    updateVideo={updateVideo} />
            }
            resultPreviewer={
                <ResultPreviewer
                    className='h-full'
                    resultUrl={result}
                    resultSize={resultSize}
                    progress={progress}
                    formatKey={resultFormatKey}
                    fileName={resultFileName} />
            }/>
    )
}

function MainScaffold({ edit, convert, videoPreviewer, resultPreviewer }: MainScaffoldProps) {
    const isLarge = useIsLarge();
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
                            className='h-full max-h-full overflow-auto thin-scrollbar py-7 px-5 flex-1'>
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
                    <div key='edit' className='h-full'>{videoPreviewer}</div>
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

function Edit({ scene, updateScene, updateVideo }: EditProps) {
    const [selection, setSelection] = useState<'scene' | 'video'>('scene');
    const video = getFirstVideo(scene);
    const isLarge = useIsLarge();

    const content = (
        <ComponentSwitch
            selectedKey={selection}>
            <EditScene
                key='scene'
                scene={scene}
                updateScene={updateScene} />
            <EditVideo
                key='video'
                updateVideo={(update) => updateVideo(video.index, update)}
                video={video}
                onFileSelected={(file) => {
                    if (file) {
                        updateVideo(video.index, { file });
                    }
                }} />
        </ComponentSwitch>
    );

    return (
        <div
            className='flex flex-col gap-3 h-full max-h-full overflow-hidden'>
            <Tabs
                tabs={[
                    { key: 'scene', title: 'Scene', icon: <BiMoviePlay className='w-5 h-5' />, onClick: () => setSelection('scene') },
                    { key: 'video', title: 'Video', icon: <FaRegFileVideo className='w-4 h-4' />, onClick: () => setSelection('video') },
                ]}
                selectedTabKey={selection}/>
            {!isLarge ?
                <div className='pt-4'>{content}</div> :
                <Container
                    className='h-full max-h-full overflow-auto thin-scrollbar py-7 px-5 flex-1'>
                    <SectionHeading className='sr-only'>Edit</SectionHeading>
                    {content}
                </Container>}
        </div>
    )
}

function EditScene({ scene, updateScene }: EditSceneProps) {
    const isLarge = useIsLarge();

    return (
        <article
            className='flex flex-col gap-6'>
            <div>
                {isLarge && <SectionHeading>Edit scene</SectionHeading>}
                <SceneSizeConfiguration
                    scene={scene}
                    updateScene={updateScene}/>
            </div>
            <div>
                {<SubsectionHeading>Trim scene</SubsectionHeading>}
                <SceneConfiguration
                    scene={scene}
                    updateScene={updateScene}/>
            </div>
        </article>
    )
}

function EditVideo({ video, updateVideo, onFileSelected }: EditVideoProps) {
    const isLarge = useIsLarge();

    return (
        <article
            className='flex flex-col gap-6'>
            <div>
                {isLarge && <SectionHeading>Edit video</SectionHeading>}
                <FileSelection
                    video={video.file}
                    setVideo={onFileSelected} />
            </div>
            <div>
                <SubsectionHeading>Trim video</SubsectionHeading>
                <VideoTrimConfiguration
                    video={video}
                    updateVideo={updateVideo}/>
            </div>
            <div>
                <SubsectionHeading>Bezels</SubsectionHeading>
                <BezelSelection
                    video={video}
                    updateVideo={updateVideo} />
            </div>
        </article>
    )
}

function Convert({ scene, canConvert, converting, convert, updateScene }: ConvertProps) {
    return (
        <>
            <ConversionConfiguration
                scene={scene}
                updateScene={updateScene} />

            <ConvertButton
                convert={convert}
                disabled={converting || !canConvert}
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

function useIsLarge() {
    return useMediaQuery('(min-width: 60rem)');
}