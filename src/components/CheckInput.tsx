import { cn } from '../utils/tailwind'

type CheckInputProps = {
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function CheckInput({ className, ...props }: CheckInputProps) {
    return (
        <input
            {...props}
            className={cn('w-4 h-4 text-on-surface-container-muted bg-surface-container border-outline', className)} />
    )
}