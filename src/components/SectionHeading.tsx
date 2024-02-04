import { cn } from '../utils/tailwind'

type SectionHeadingProps = {
    children: React.ReactNode,
    className?: string
}

export default function SectionHeading({ children, className }: SectionHeadingProps) {
    return (
        <h2 className={cn('font-bold text-3xl mb-4', className)}>{children}</h2>
    )
}