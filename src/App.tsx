import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import ScenePreviewer from './components/scene/ScenePreviewer'
import Loading from './components/Loading'
import { ConversionProgress } from './types/ConversionProgress'
import SectionHeading from './components/SectionHeading'
import BezelSelection from './components/video/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { BiMoviePlay } from 'react-icons/bi'
import { cn } from './utils/tailwind'
import Container from './components/Container'
import Tabs from './components/Tabs'
import FileSelection from './components/inputs/FileSelection'
import VideoTrimConfiguration from './components/video/VideoTrimConfiguration'
import useConvert from './hooks/useConvert'
import ResultPreviewer from './components/conversion/ResultPreviewer'
import ConversionConfiguration from './components/conversion/ConversionConfiguration'
import Button from './components/inputs/Button'
import ComponentSwitch from './components/ComponentSwitch'
import SubsectionHeading from './components/SubsectionHeading'
import useScene from './hooks/useScene'
import { Video } from './types/Video'
import { Scene, getFirstVideo } from './types/Scene'
import SceneSizeConfiguration from './components/scene/SceneSizeConfiguration'
import SceneTrimConfiguration from './components/scene/SceneTrimConfiguration'
import { TbVideo } from 'react-icons/tb'
import BackgroundSelection from './components/scene/BackgroundSelection'
import useIsLarge from './hooks/useIsLarge'
import MainScaffold from './components/app/MainScaffold'
import useContentDialog from './hooks/useContentDialog'
import { NewProjectDialog } from './components/app/NewProjectDialog'
import { ProjectConfig } from './types/ProjectConfig'

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

type MainContentProps = {
    ffmpeg: FFmpeg,
    progress: ConversionProgress | null,
    resetProgress: () => void
}

type ProjectProps = {
    ffmpeg: FFmpeg,
    progress: ConversionProgress | null,
    resetProgress: () => void
}

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
        <MainContent
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

function MainContent({ ffmpeg, progress, resetProgress }: MainContentProps) {
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ videosCount: 1 });
    const { scene, updateScene, updateVideo } = useScene(projectConfig);
    const { convert, converting, result, resultFileName, resultSize, resultFormatKey } = useConvert(scene, ffmpeg, resetProgress);
    const [newProjectDialogRef, isOpen, newProjectDialogAnimation, showNewProjectDialog, hideNewProjectDialog] = useContentDialog(true);

    return (
        <>
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
                    <ScenePreviewer
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
                }
                onNewProjectClick={showNewProjectDialog}/>
            
            <NewProjectDialog
                ref={newProjectDialogRef}
                animation={newProjectDialogAnimation}
                hide={hideNewProjectDialog}
                onProjectConfigSelected={setProjectConfig}/>
        </>
    )
}

function Edit({ scene, updateScene, updateVideo }: EditProps) {
    const [selection, setSelection] = useState<string>('scene');
    const isLarge = useIsLarge();

    const content = (
        <ComponentSwitch
            selectedKey={selection}>
            {[
                <EditScene
                    key={'scene'}
                    scene={scene}
                    updateScene={updateScene} />,
                ...scene.videos.map((video, index) => 
                    <EditVideo
                        key={`video-${index}`}
                        updateVideo={(update) => updateVideo(video.index, update)}
                        video={video}
                        onFileSelected={(file) => {
                            if (file) {
                                updateVideo(video.index, { file });
                            }
                        }} />)
            ]}
        </ComponentSwitch>
    );

    return (
        <div
            className='flex flex-col gap-3 h-full max-h-full overflow-hidden'>
            <Tabs
                tabs={[
                    { key: 'scene', title: 'Scene', icon: <BiMoviePlay className='w-5 h-5' />, onClick: () => setSelection('scene') },
                    ...scene.videos.map((video, index) =>
                        ({ key: `video-${index}`, title: `Video #${index + 1}`, icon: <TbVideo className='w-5 h-5' />, onClick: () => setSelection(`video-${index}`) }))
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
                <BackgroundSelection
                    className='mb-4'
                    scene={scene}
                    updateScene={updateScene}/>

                <SceneSizeConfiguration
                    scene={scene}
                    updateScene={updateScene}/>
            </div>
            <div>
                {<SubsectionHeading>Trim scene</SubsectionHeading>}
                <SceneTrimConfiguration
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