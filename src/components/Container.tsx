import { cn } from '../utils/tailwind'

export default function Container(props: {
    children: React.ReactNode,
    className?: string
}) {
    return (
        <div
            className={cn('border border-outline bg-surface-container rounded-md', props.className)}>
            {props.children}
        </div>
    )
}