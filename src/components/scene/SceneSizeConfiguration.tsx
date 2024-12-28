import { getMaxPadding } from '../../types/DrawableScene'
import { cn } from '../../utils/tailwind'
import NumberInput from '../inputs/NumberInput'
import { Scene } from '../../types/Scene'

export default function SceneSizeConfiguration(props: {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}) {
    const maxPadding = getMaxPadding(props.scene);

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', props.className)}>
            <NumberInput
                label='Horizontal padding'
                id='horizontal-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={props.scene.horizontalPadding}
                onChange={(e) => props.updateScene({ horizontalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Vertical padding'
                id='vertical-padding'
                unit='px'
                inputClassName='pr-8'
                min={0}
                max={maxPadding}
                value={props.scene.verticalPadding}
                onChange={(e) => props.updateScene({ verticalPadding: parseFloat(e.target.value) })} />
            <NumberInput
                label='Size'
                id='size'
                unit='px'
                inputClassName='pr-8'
                min={1}
                value={props.scene.requestedMaxSize}
                onChange={(e) => props.updateScene({ requestedMaxSize: parseFloat(e.target.value) })} />
            {props.scene.media.length > 1 &&
                <NumberInput
                    label='Spacing'
                    id='spacing'
                    unit='px'
                    inputClassName='pr-8'
                    min={1}
                    value={props.scene.horizontalSpacing}
                    onChange={(e) => props.updateScene({ horizontalSpacing: parseFloat(e.target.value) })} />}
        </div>
    )
}