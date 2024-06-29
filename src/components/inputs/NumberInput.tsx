import { cn } from '../../utils/tailwind'

type NumberInputProps = {
    label?: string,
    unit?: string,
    inputClassName?: string,
    className?: string,
    variant?: NumberInputVariant
} & React.InputHTMLAttributes<HTMLInputElement>

type NumberInputVariant = 'default' | 'sm'

export default function NumberInput({ className, id, label, min, max, unit, inputClassName, value, variant, onChange, ...rest }: NumberInputProps) {
    variant = (variant || 'default') as NumberInputVariant;
    
    return (
        <div
            className={className}>
            <label
                htmlFor={id}
                className={cn(
                    'block text-sm font-medium text-on-surface select-none',
                    variant === 'default' ?
                        'mb-2' :
                        variant === 'sm' && 'mb-0.5')}>
                {label}
            </label>
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
                    type='number'
                    min={min} max={max}
                    value={value}
                    onChange={onChange} />
                {
                    unit &&
                    <div
                        className='absolute inset-y-0 right-0 flex items-center pointer-events-none z-20 pr-3'>
                        <span className='text-on-surface-muted text-sm'>{unit}</span>
                    </div>
                }
            </div>
        </div>
    )
}