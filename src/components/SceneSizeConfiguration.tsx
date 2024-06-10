import { Scene, getMaxPadding, getSceneSize } from '../types/Scene'
import { cn } from '../utils/tailwind'
import NumberInput from './NumberInput'
import Chrome, { ChromeInputType } from '@uiw/react-color-chrome'

type SceneSizeConfigurationProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

export default function SceneSizeConfiguration({ className, scene, updateScene }: SceneSizeConfigurationProps) {
    const maxPadding = getMaxPadding(scene);

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            <Chrome
                className='col-start-1 col-end-3'
                inputType={ChromeInputType.HEXA}
                color={scene.background}
                onChange={(color) => updateScene({ background: color.hexa })} />
            <NumberInput
                label='Horizontal padding'
                id='horizontal-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={scene.horizontalPadding}
                onChange={(e) => updateScene({ horizontalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Vertical padding'
                id='vertical-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={scene.verticalPadding}
                onChange={(e) => updateScene({ verticalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={scene.requestedMaxSize}
                onChange={(e) => updateScene({ requestedMaxSize: parseFloat(e.target.value) })} />
        </div>
    )
}