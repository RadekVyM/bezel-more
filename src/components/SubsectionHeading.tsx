import { cn } from '../utils/tailwind'

type SubsectionHeadingProps = {
    children: React.ReactNode,
    className?: string
}

export default function SubsectionHeading({ children, className }: SubsectionHeadingProps) {
    return (
        <h3 className={cn('font-bold text-xl mb-3', className)}>{children}</h3>
    )
}