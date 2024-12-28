import { cn } from '../utils/tailwind'

export default function RadioCircle(props: {
    checked?: boolean,
    className?: string
}) {
    return (
        <div
            aria-hidden
            className={cn('w-5 h-5 flex justify-center items-center',
                'rounded-full border border-outline',
                props.checked ?
                    'bg-on-surface-container-muted before:content-[""] before:block before:w-2 before:h-2 before:aspect-square before:bg-white before:rounded-full' :
                    'bg-surface-container',
                props.className)}>
        </div>
    )
}