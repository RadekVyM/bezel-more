import { cn } from '../utils/tailwind'

type LoadingProps = {
    className?: string
}

export default function Loading({ className }: LoadingProps) {
    return (
        <div
            className={cn('animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full', className)}
            role='status'
            aria-label='loading'>
            <span className='sr-only'>Loading...</span>
        </div>
    )
}