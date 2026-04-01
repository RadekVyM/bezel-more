import { cn } from '../../utils/tailwind'

export default function CheckInput({ className, ...props }: {
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type='checkbox'
            className={cn('form-checkbox rounded w-4 h-4 text-on-surface-container-muted bg-surface-container border-outline', className)} />
    )
}