import { cn } from '../utils/tailwind'

export default function Loading({ className }) {
    return (
        <div
            className={cn('animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full', className)}
            role='status'
            aria-label='loading'>
            <span className='sr-only'>Loading...</span>
        </div>
    )
}