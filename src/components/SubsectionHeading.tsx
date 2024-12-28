import { cn } from '../utils/tailwind'

export default function SubsectionHeading(props: {
    children: React.ReactNode,
    className?: string
}) {
    return (
        <h3 className={cn('font-bold text-xl mb-3', props.className)}>{props.children}</h3>
    )
}