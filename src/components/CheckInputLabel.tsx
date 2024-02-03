import { cn } from '../utils/tailwind'

type CheckInputLabelProps = {
    className?: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

export default function CheckInputLabel({ className, ...props }: CheckInputLabelProps) {
    return (
        <label
            {...props}
            className={cn('text-sm text-gray-500 pl-3 dark:text-gray-300', className)} />
    )
}