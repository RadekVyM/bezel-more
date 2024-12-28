import { cn } from '../utils/tailwind'

export default function SectionHeading(props: {
    children: React.ReactNode,
    className?: string
}) {
    return (
        <h2 className={cn('font-bold text-3xl mb-4', props.className)}>{props.children}</h2>
    )
}