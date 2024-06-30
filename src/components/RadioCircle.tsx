import { cn } from '../utils/tailwind'

type RadioCircleProps = {
    checked?: boolean,
    className?: string
}

export default function RadioCircle({ checked, className }: RadioCircleProps) {
    return (
        <div
            aria-hidden
            className={cn('w-5 h-5 flex justify-center items-center',
                'rounded-full border border-outline',
                checked ?
                    'bg-on-surface-container-muted before:content-[""] before:block before:w-2 before:h-2 before:aspect-square before:bg-white before:rounded-full' :
                    'bg-surface-container',
                className)}>
        </div>
    )
}