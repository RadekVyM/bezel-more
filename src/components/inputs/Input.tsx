import { cn } from '../../utils/tailwind'

export type InputVariant = 'default' | 'sm'

export default function Input({ className, id, label, trailingContent, inputClassName, value, variant, onChange, ...rest }: {
    label?: string,
    trailingContent?: React.ReactNode,
    inputClassName?: string,
    className?: string,
    variant?: InputVariant
} & React.InputHTMLAttributes<HTMLInputElement>) {
    variant = (variant || 'default') as InputVariant;
    
    return (
        <div
            className={className}>
            {label &&
                <label
                    htmlFor={id}
                    className={cn(
                        'block text-sm font-medium text-on-surface select-none',
                        variant === 'default' ?
                            'mb-2' :
                            variant === 'sm' && 'mb-0.5')}>
                    {label}
                </label>}
            <div
                className='relative'>
                <input
                    {...rest}
                    className={cn(
                        'block w-full border border-outline rounded-md bg-surface-container text-on-surface-container disabled:text-on-surface-muted',
                        variant === 'default' ?
                            'py-2 px-3' :
                            variant === 'sm' && 'text-sm px-2 py-1.5',
                        inputClassName)}
                    id={id}
                    value={value}
                    onChange={onChange} />
                {trailingContent}
            </div>
        </div>
    )
}