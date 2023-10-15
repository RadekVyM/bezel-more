import { cn } from '../utils/tailwind'

export default function ContentContainer({ className, children, hoverable }) {
    return (
        <div
            className={cn(
                'border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
                hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : '',
                className)}>
            {children}
        </div>
    )
}