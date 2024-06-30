import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../types/Scene'
import { shallowEqual } from '../../utils/objects'
import { cn } from '../../utils/tailwind'
import RadioCircle from '../RadioCircle'
import Button from '../inputs/Button'
import { AspectRatio } from '../../types/AspectRatio'

type SceneAspectRatioSelectionProps = {
    scene: Scene,
    updateScene: (scene: Partial<Scene>) => void,
    className?: string
}

type AspectRatioCardProps = {
    checked: boolean,
    children: React.ReactNode,
    className?: string,
    onClick: () => void
}

type CustomAspectRatioCardProps = {
    requiredAspectRatio?: AspectRatio,
    onChange: (aspectRatio: AspectRatio) => void
}

const PREDEFINED_ASPECT_RATIOS: Array<AspectRatio> = [
    { width: 16, height: 9, isCustom: false },
    { width: 9, height: 16, isCustom: false },
    { width: 16, height: 10, isCustom: false },
    { width: 10, height: 16, isCustom: false },
    { width: 4, height: 3, isCustom: false },
    { width: 3, height: 4, isCustom: false },
];

export default function SceneAspectRatioSelection({ className, scene, updateScene }: SceneAspectRatioSelectionProps) {
    return (
        <div
            className={cn('', className)}
            aria-labelledby='scene-aspect-ratio-selection-legend'
            role='radiogroup'>
            <legend id='scene-aspect-ratio-selection-legend' className='block text-sm font-medium mb-2 select-none w-fit'>Aspect ratio</legend>

            <div
                className='grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3'>
                <AspectRatioCard
                    checked={scene.requestedAspectRatio === undefined}
                    onClick={() => updateScene({ requestedAspectRatio: undefined })}>
                    Adjust
                </AspectRatioCard>
                {PREDEFINED_ASPECT_RATIOS.map((aspectRatio) => 
                    <AspectRatioCard
                        checked={!!scene.requestedAspectRatio && shallowEqual(aspectRatio, scene.requestedAspectRatio)}
                        onClick={() => updateScene({ requestedAspectRatio: { ...aspectRatio } })}>
                        <span>{aspectRatio.width} : {aspectRatio.height}</span>
                    </AspectRatioCard>)}
                <CustomAspectRatioCard
                    requiredAspectRatio={scene.requestedAspectRatio}
                    onChange={(aspectRatio) => updateScene({ requestedAspectRatio: { ...aspectRatio, isCustom: true } })}/>
            </div>
        </div>
    )
}

function CustomAspectRatioCard({ requiredAspectRatio, onChange }: CustomAspectRatioCardProps) {
    const defaultCustomAspectRatio = requiredAspectRatio?.isCustom ? { ...requiredAspectRatio } : { width: 1, height: 1, isCustom: true };
    const lastValidCustomAspectRatio = useRef<AspectRatio>(defaultCustomAspectRatio);
    const [customAspectRatio, setCustomAspectRatio] = useState(aspectRatioToString(defaultCustomAspectRatio));
    const aspectRatioPattern = /^\s*(\d+)\s*:\s*(\d+)\s*$/;
    const checked = !!requiredAspectRatio?.isCustom;

    useEffect(() => {
        if (requiredAspectRatio?.isCustom) {
            lastValidCustomAspectRatio.current = { ...requiredAspectRatio };
            setCustomAspectRatio(aspectRatioToString(lastValidCustomAspectRatio.current));
        }
    }, [requiredAspectRatio]);

    return (
        <AspectRatioCard
            checked={checked}
            onClick={() => onChange({ ...lastValidCustomAspectRatio.current })}>
            <input
                className='flex-1
                    border border-outline rounded-md
                    bg-surface-container text-on-surface-container disabled:text-on-surface-muted
                    p-0.5 px-1.5 min-w-0 h-full
                    text-xs
                    invalid:border-danger invalid:border-2'
                value={customAspectRatio}
                onChange={(e) => {
                    const value = e.target.value;

                    if (aspectRatioPattern.test(value)) {
                        const match = aspectRatioPattern.exec(value);
                        if (match) {
                            lastValidCustomAspectRatio.current = { width: parseInt(match[1]), height: parseInt(match[2]) };
                            if (checked) {
                                onChange({ ...lastValidCustomAspectRatio.current });
                            }
                        }
                    }
                    
                    setCustomAspectRatio(value);
                }}
                onBlur={(e) => {
                    setCustomAspectRatio(aspectRatioToString(lastValidCustomAspectRatio.current));
                }} />
        </AspectRatioCard>
    )
}

function AspectRatioCard({ className, checked, children, onClick }: AspectRatioCardProps) {
    return (
        <Button
            className={cn('flex justify-start gap-3 px-2 select-none h-11', className)}
            onClick={onClick}
            onKeyUp={(e) => e.key === 'Enter' && onClick()}
            tabIndex={0}
            role='radio'>
            <RadioCircle
                checked={checked} />
            {children}
        </Button>
    )
}

function aspectRatioToString(aspectRatio: AspectRatio) {
    return `${aspectRatio.width} : ${aspectRatio.height}`;
}