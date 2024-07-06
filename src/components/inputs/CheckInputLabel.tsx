import { cn } from '../../utils/tailwind'

type CheckInputLabelProps = {
    className?: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

export default function CheckInputLabel({ className, ...props }: CheckInputLabelProps) {
    return (
        <label
            {...props}
            className={cn('text-sm text-on-surface-container pl-3 select-none', className)} />
    )
}