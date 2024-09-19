import './App.css'
import { useEffect, useState } from 'react'
import ScenePreviewer from './components/scene/ScenePreviewer'
import Loading from './components/Loading'
import SectionHeading from './components/SectionHeading'
import BezelSelection from './components/medium/BezelSelection'
import { RiLoopLeftLine } from 'react-icons/ri'
import { BiMoviePlay } from 'react-icons/bi'
import { cn } from './utils/tailwind'
import Container from './components/Container'
import Tabs from './components/Tabs'
import VideoTrimConfiguration from './components/medium/VideoTrimConfiguration'
import useConvert from './hooks/useConvert'
import ResultPreviewer from './components/conversion/ResultPreviewer'
import ConversionConfiguration from './components/conversion/ConversionConfiguration'
import Button from './components/inputs/Button'
import ComponentSwitch from './components/ComponentSwitch'
import SubsectionHeading from './components/SubsectionHeading'
import useScene from './hooks/useScene'
import SceneSizeConfiguration from './components/scene/SceneSizeConfiguration'
import SceneTrimConfiguration from './components/scene/SceneTrimConfiguration'
import { TbVideo } from 'react-icons/tb'
import BackgroundSelection from './components/scene/BackgroundSelection'
import useIsLarge from './hooks/useIsLarge'
import MainScaffold from './components/app/MainScaffold'
import useContentDialog from './hooks/useContentDialog'
import { NewProjectDialog } from './components/app/NewProjectDialog'
import { ProjectConfig } from './types/ProjectConfig'
import { MediumFileSelection } from './components/inputs/MediumFileSelection'
import MediumShadowConfiguration from './components/medium/MediumShadowConfiguration'
import SceneAspectRatioSelection from './components/scene/SceneAspectRatioSelection'
import MediumSizeConfiguration from './components/medium/MediumSizeConfiguration'
import { DEFAULT_SCENE_TEMPLATES } from './types/SceneTemplate'
import { Scene } from './types/Scene'
import { Medium } from './types/Medium'
import { FaRegImage } from 'react-icons/fa'

type EditProps = {
    scene: Scene,
    resetValue?: any,
    updateScene: (scene: Partial<Scene>) => void,
    updateMedium: (index: number, medium: Partial<Medium>) => void,
}

type EditSceneProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
}

type EditMediumProps = {
    medium: Medium,
    onFileSelected: (file: File | null | undefined) => void,
    updateMedium: (medium: Partial<Medium>) => void,
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

export default function App() {
    return (
        <MainContent />
    )
}

function MainContent() {
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ sceneTemplate: DEFAULT_SCENE_TEMPLATES[0] });
    const { scene, updateScene, updateVideo } = useScene(projectConfig);
    const { convert, progress, result, resultFileName, resultSize, resultFormatKey } = useConvert(scene);
    const [newProjectDialogRef, isNewProjectDialogOpen, newProjectDialogAnimation, showNewProjectDialog, hideNewProjectDialog] = useContentDialog(true);

    return (
        <>
            <MainScaffold
                edit={
                    <Edit
                        updateMedium={updateVideo}
                        resetValue={projectConfig}
                        scene={scene}
                        updateScene={updateScene} />
                }
                convert={
                    <Convert
                        scene={scene}
                        updateScene={updateScene}
                        canConvert={scene.media.every((v) => v.file)}
                        convert={convert}
                        converting={progress.converting} />
                }
                scenePreviewer={
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
                isOpen={isNewProjectDialogOpen}
                currentScene={scene}
                animation={newProjectDialogAnimation}
                hide={hideNewProjectDialog}
                onProjectConfigSelected={setProjectConfig} />

            <Popovers />
        </>
    )
}

function Edit({ scene, resetValue, updateScene, updateMedium }: EditProps) {
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
                ...(scene.media as Array<Medium>).map((medium, index) => 
                    <EditMedium
                        key={`medium-${index}`}
                        updateMedium={(update) => updateMedium(medium.index, update)}
                        medium={medium}
                        onFileSelected={(file) => {
                            if (file) {
                                updateMedium(medium.index, { file });
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
                    ...(scene.media as Array<Medium>).map((medium, index) =>
                        ({
                            key: `medium-${index}`,
                            title: scene.media.length > 1 ? `${getMediumTabTitle(medium)} #${index + 1}` : getMediumTabTitle(medium),
                            icon: medium.mediumType === 'video' ? <TbVideo className='w-5 h-5' /> : <FaRegImage className='w-5 h-5' />,
                            onClick: () => setSelection(`medium-${index}`)
                        }))
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
            {scene.sceneType === 'video' &&
                <div>
                    {<SubsectionHeading>Trim scene</SubsectionHeading>}
                    <SceneTrimConfiguration
                        scene={scene}
                        updateScene={updateScene}/>
                </div>}
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

function EditMedium({ medium, updateMedium, onFileSelected }: EditMediumProps) {
    const isLarge = useIsLarge();

    return (
        <article
            className='flex flex-col gap-6'>
            <div>
                {isLarge && <SectionHeading>{`Edit ${medium.mediumType}`}</SectionHeading>}
                <MediumFileSelection
                    mediumType={medium.mediumType}
                    file={medium.file}
                    onFileSelect={onFileSelected} />
            </div>
            <div>
                <MediumSizeConfiguration
                    medium={medium}
                    updateMedium={updateMedium}/>
            </div>
            {medium.mediumType === 'video' &&
                <div>
                    <SubsectionHeading>Trim video</SubsectionHeading>
                    <VideoTrimConfiguration
                        video={medium}
                        updateVideo={updateMedium}/>
                </div>}
            <div>
                <SubsectionHeading>Shadow</SubsectionHeading>
                <MediumShadowConfiguration
                    medium={medium}
                    updateMedium={updateMedium}/>
            </div>
            <div>
                <SubsectionHeading>Bezels</SubsectionHeading>
                <BezelSelection
                    medium={medium}
                    updateMedium={updateMedium} />
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

function getMediumTabTitle(medium: Medium) {
    return medium.mediumType === 'video' ? 'Video' : 'Image';
}