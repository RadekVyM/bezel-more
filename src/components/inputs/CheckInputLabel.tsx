import { cn } from '../../utils/tailwind'

export default function CheckInputLabel({ className, ...props }: {
    className?: string
} & React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            {...props}
            className={cn('text-sm text-on-surface-container pl-3 select-none', className)} />
    )
}