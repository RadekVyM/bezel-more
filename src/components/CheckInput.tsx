import { cn } from '../utils/tailwind'

type CheckInputProps = {
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function CheckInput({ className, ...props }: CheckInputProps) {
    return (
        <input
            {...props}
            className={cn('w-4 h-4 text-black dark:text-gray-700 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600', className)} />
    )
}