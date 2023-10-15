import { cn } from '../utils/tailwind'

export default function CheckInputLabel({ className, ...props }) {
    return (
        <label
            {...props}
            className={cn('text-sm text-gray-500 pl-3 dark:text-gray-300', className)}/>
    )
}