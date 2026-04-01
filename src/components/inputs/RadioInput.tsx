import { cn } from "../../utils/tailwind"

export default function RadioInput({ className, ...props }: {
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type='radio'
            className={cn('form-radio w-4 h-4 text-on-surface-container-muted bg-surface-container border-outline', className)} />
    )
}