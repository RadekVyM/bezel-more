import Input, { InputVariant } from './Input'

export default function NumberInput({ unit, ...rest }: {
    label?: string,
    unit?: string,
    inputClassName?: string,
    className?: string,
    variant?: InputVariant
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <Input
            {...rest}
            type='number'
            trailingContent={
                unit &&
                <div
                    className='absolute inset-y-0 right-0 flex items-center pointer-events-none z-20 pr-3'>
                    <span className='text-on-surface-muted text-sm'>{unit}</span>
                </div>
            }>
        </Input>
    )
}