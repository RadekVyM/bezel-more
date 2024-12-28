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

export default function App() {
    return (
        <MainContent />
    )
}

function MainContent() {
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ sceneTemplate: DEFAULT_SCENE_TEMPLATES[0] });
    const { scene, updateScene, updateVideo } = useScene(projectConfig);
    const { convert, progress, result, resultFileName, resultSize, resultFormatKey } = useConvert(scene);
    const newProjectDialogState = useContentDialog(true);

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
                onNewProjectClick={newProjectDialogState.show}
                resetValue={projectConfig} />
            
            <NewProjectDialog
                ref={newProjectDialogState.dialogRef}
                state={newProjectDialogState}
                currentScene={scene}
                onProjectConfigSelected={setProjectConfig} />

            <Popovers />
        </>
    )
}

function Edit(props: {
    scene: Scene,
    resetValue?: any,
    updateScene: (scene: Partial<Scene>) => void,
    updateMedium: (index: number, medium: Partial<Medium>) => void,
}) {
    const [selection, setSelection] = useState<string>('scene');
    const isLarge = useIsLarge();

    const content = (
        <ComponentSwitch
            selectedKey={selection}>
            {[
                <EditScene
                    key='scene'
                    scene={props.scene}
                    updateScene={props.updateScene} />,
                ...(props.scene.media as Array<Medium>).map((medium, index) => 
                    <EditMedium
                        key={`medium-${index}`}
                        updateMedium={(update) => props.updateMedium(medium.index, update)}
                        medium={medium}
                        onFileSelected={(file) => {
                            if (file) {
                                props.updateMedium(medium.index, { file });
                            }
                        }} />)
            ]}
        </ComponentSwitch>
    );

    useEffect(() => {
        setSelection('scene');
    }, [props.resetValue]);

    return (
        <div
            className='flex flex-col gap-3 h-full max-h-full overflow-hidden'>
            <Tabs
                tabs={[
                    { key: 'scene', title: 'Scene', icon: <BiMoviePlay className='w-5 h-5' />, onClick: () => setSelection('scene') },
                    ...(props.scene.media as Array<Medium>).map((medium, index) =>
                        ({
                            key: `medium-${index}`,
                            title: props.scene.media.length > 1 ? `${getMediumTabTitle(medium)} #${index + 1}` : getMediumTabTitle(medium),
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

function EditScene(props: {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
}) {
    const isLarge = useIsLarge();

    return (
        <article
            className='flex flex-col gap-6'>
            <div>
                {isLarge && <SectionHeading>Edit scene</SectionHeading>}
                <BackgroundSelection
                    scene={props.scene}
                    updateScene={props.updateScene}/>
            </div>
            {props.scene.sceneType === 'video' &&
                <div>
                    {<SubsectionHeading>Trim scene</SubsectionHeading>}
                    <SceneTrimConfiguration
                        scene={props.scene}
                        updateScene={props.updateScene}/>
                </div>}
            <div>
                {<SubsectionHeading>Scene layout</SubsectionHeading>}

                <SceneSizeConfiguration
                    className='mb-4'
                    scene={props.scene}
                    updateScene={props.updateScene}/>

                <SceneAspectRatioSelection
                    scene={props.scene}
                    updateScene={props.updateScene}/>
            </div>
        </article>
    )
}

function EditMedium(props: {
    medium: Medium,
    onFileSelected: (file: File | null | undefined) => void,
    updateMedium: (medium: Partial<Medium>) => void,
}) {
    const isLarge = useIsLarge();

    return (
        <article
            className='flex flex-col gap-6'>
            <div>
                {isLarge && <SectionHeading>{`Edit ${props.medium.mediumType}`}</SectionHeading>}
                <MediumFileSelection
                    mediumType={props.medium.mediumType}
                    file={props.medium.file}
                    onFileSelect={props.onFileSelected} />
            </div>
            <div>
                <MediumSizeConfiguration
                    medium={props.medium}
                    updateMedium={props.updateMedium}/>
            </div>
            {props.medium.mediumType === 'video' &&
                <div>
                    <SubsectionHeading>Trim video</SubsectionHeading>
                    <VideoTrimConfiguration
                        video={props.medium}
                        updateVideo={props.updateMedium}/>
                </div>}
            <div>
                <SubsectionHeading>Shadow</SubsectionHeading>
                <MediumShadowConfiguration
                    medium={props.medium}
                    updateMedium={props.updateMedium}/>
            </div>
            <div>
                <SubsectionHeading>Bezels</SubsectionHeading>
                <BezelSelection
                    medium={props.medium}
                    updateMedium={props.updateMedium} />
            </div>
        </article>
    )
}

function Convert(props: {
    scene: Scene,
    converting: boolean,
    canConvert?: boolean,
    convert: () => Promise<void>,
    updateScene: (scene: Partial<Scene>) => void,
}) {
    return (
        <div
            className='flex-1 flex flex-col'>
            <ConversionConfiguration
                scene={props.scene}
                updateScene={props.updateScene} />

            <ConvertButton
                convert={props.convert}
                disabled={props.converting || !props.canConvert}
                converting={props.converting}
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

function ConvertButton(props: {
    convert: () => void,
    disabled: boolean,
    converting: boolean,
    className?: string
}) {
    return (
        <Button
            className={cn('flex items-center', props.className)}
            onClick={props.convert}
            disabled={props.disabled}>
            {
                !props.converting ?
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