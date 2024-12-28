import { cn } from '../utils/tailwind'

export default function Loading(props: {
    className?: string
}) {
    return (
        <div
            className={cn('animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full', props.className)}
            role='status'
            aria-label='loading'>
            <span className='sr-only'>Loading...</span>
        </div>
    )
}