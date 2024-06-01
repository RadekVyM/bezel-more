import { cn } from '../utils/tailwind'

type ContainerProps = {
    children: React.ReactNode,
    className?: string
}

export default function Container({ children, className }: ContainerProps) {
    return (
        <div
            className={cn('border border-outline bg-surface-container rounded-md', className)}>
            {children}
        </div>
    )
}