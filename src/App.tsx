import './App.css'
import { useEffect, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import ScenePreviewer from './components/scene/ScenePreviewer'
import Loading from './components/Loading'
import SectionHeading from './components/SectionHeading'
import BezelSelection from './components/video/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { BiMoviePlay } from 'react-icons/bi'
import { cn } from './utils/tailwind'
import Container from './components/Container'
import Tabs from './components/Tabs'
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
import VideoFileSelection from './components/inputs/VideoFileSelection'
import VideoShadowConfiguration from './components/video/VideoShadowConfiguration'
import SceneAspectRatioSelection from './components/scene/SceneAspectRatioSelection'
import VideoSizeConfiguration from './components/video/VideoSizeConfiguration'
import useConversionProgress from './hooks/useConversionProgress'

type EditProps = {
    scene: Scene,
    resetValue?: any,
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
}

export default function App() {
    const ffmpegRef = useRef(new FFmpeg());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        loadFFmpeg();
    }, []);

    async function loadFFmpeg() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        const ffmpeg = ffmpegRef.current;
        
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
            ffmpeg={ffmpegRef.current} />
        ) :
        (<main
            className='min-h-screen w-full grid place-content-center bg-surface text-on-surface'>
            <Loading
                className='h-10 w-10 border-4' />
        </main>)
}

function MainContent({ ffmpeg }: MainContentProps) {
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ videosCount: 1 });
    const { scene, updateScene, updateVideo } = useScene(projectConfig);
    const { progress, resetProgress, updateProgress } = useConversionProgress(ffmpeg);
    const { convert, result, resultFileName, resultSize, resultFormatKey } = useConvert(scene, ffmpeg, resetProgress, updateProgress);
    const [newProjectDialogRef, isOpen, newProjectDialogAnimation, showNewProjectDialog, hideNewProjectDialog] = useContentDialog(true);

    return (
        <>
            <MainScaffold
                edit={
                    <Edit
                        updateVideo={updateVideo}
                        resetValue={projectConfig}
                        scene={scene}
                        updateScene={updateScene} />
                }
                convert={
                    <Convert
                        scene={scene}
                        updateScene={updateScene}
                        canConvert={!!getFirstVideo(scene).file}
                        convert={convert}
                        converting={progress.converting} />
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
                onNewProjectClick={showNewProjectDialog}
                resetValue={projectConfig} />
            
            <NewProjectDialog
                ref={newProjectDialogRef}
                animation={newProjectDialogAnimation}
                hide={hideNewProjectDialog}
                onProjectConfigSelected={setProjectConfig} />

            <Popovers />
        </>
    )
}

function Edit({ scene, resetValue, updateScene, updateVideo }: EditProps) {
    const [selection, setSelection] = useState<string>('scene');
    const isLarge = useIsLarge();

    const content = (
        <ComponentSwitch
            selectedKey={selection}>
            {[
                <EditScene
                    key='scene'
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

    useEffect(() => {
        setSelection('scene');
    }, [resetValue]);

    return (
        <div
            className='flex flex-col gap-3 h-full max-h-full overflow-hidden'>
            <Tabs
                tabs={[
                    { key: 'scene', title: 'Scene', icon: <BiMoviePlay className='w-5 h-5' />, onClick: () => setSelection('scene') },
                    ...scene.videos.map((video, index) =>
                        ({ key: `video-${index}`, title: scene.videos.length > 1 ? `Video #${index + 1}` : 'Video', icon: <TbVideo className='w-5 h-5' />, onClick: () => setSelection(`video-${index}`) }))
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
                    scene={scene}
                    updateScene={updateScene}/>
            </div>
            <div>
                {<SubsectionHeading>Trim scene</SubsectionHeading>}
                <SceneTrimConfiguration
                    scene={scene}
                    updateScene={updateScene}/>
            </div>
            <div>
                {<SubsectionHeading>Scene layout</SubsectionHeading>}

                <SceneSizeConfiguration
                    className='mb-4'
                    scene={scene}
                    updateScene={updateScene}/>

                <SceneAspectRatioSelection
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
                <VideoFileSelection
                    file={video.file}
                    onFileSelect={onFileSelected} />
            </div>
            <div>
                <VideoSizeConfiguration
                    video={video}
                    updateVideo={updateVideo}/>
            </div>
            <div>
                <SubsectionHeading>Trim video</SubsectionHeading>
                <VideoTrimConfiguration
                    video={video}
                    updateVideo={updateVideo}/>
            </div>
            <div>
                <SubsectionHeading>Shadow</SubsectionHeading>
                <VideoShadowConfiguration
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
        <div
            className='flex-1 flex flex-col'>
            <ConversionConfiguration
                scene={scene}
                updateScene={updateScene} />

            <ConvertButton
                convert={convert}
                disabled={converting || !canConvert}
                converting={converting}
                className='mt-7 py-3' />
            
            <div
                className='flex-1 grid'>
                <span
                    className='place-self-end text-xs text-on-surface-container-muted'>
                    Powered by <a className='text-secondary' href='https://ffmpegwasm.netlify.app/'>ffmpeg.wasm</a>
                </span>
            </div>
        </div>
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

function Popovers() {
    return (
        <div
            id='popover-container'
            className='fixed inset-0 pointer-events-none overflow-clip'>
        </div>
    )
  }