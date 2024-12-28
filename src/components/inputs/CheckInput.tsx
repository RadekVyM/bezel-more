import { cn } from '../../utils/tailwind'

export default function CheckInput({ className, ...props }: {
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={cn('w-4 h-4 text-on-surface-container-muted bg-surface-container border-outline', className)} />
    )
}