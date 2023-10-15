import { cn } from '../utils/tailwind'

export default function Button({ children, className, href, ...rest }) {
    const styling = 'rounded-md text-sm font-semibold px-4 py-2 bg-black dark:bg-gray-50 text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 dark:disabled:bg-gray-600';

    return (
        href ?
        <a
            {...rest}
            href={href}
            className={cn(styling, className)}>
            {children}
        </a> :
        <button
            {...rest}
            className={cn(styling, className)}>
            {children}
        </button>
    )
}