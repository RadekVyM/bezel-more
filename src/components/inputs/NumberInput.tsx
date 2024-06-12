import { cn } from '../../utils/tailwind'

type NumberInputProps = {
    label?: string,
    unit?: string,
    inputClassName?: string,
    className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function NumberInput({ className, id, label, min, max, unit, inputClassName, value, onChange, ...rest }: NumberInputProps) {
    return (
        <div
            className={className}>
            <label
                htmlFor={id}
                className='block text-sm font-medium mb-2 text-on-surface'>
                {label}
            </label>
            <div
                className='relative'>
                <input
                    {...rest}
                    className={cn('py-2 px-3 block w-full border border-outline rounded-md bg-surface-container text-on-surface-container disabled:text-on-surface-muted', inputClassName)}
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