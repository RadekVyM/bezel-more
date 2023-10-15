import { cn } from '../utils/tailwind'

export default function NumberInput({ id, label, min, max, unit, inputClassName, value, onChange, ...rest }) {
    return (
        <div>
            <label
                htmlFor={id}
                className='block text-sm font-medium mb-2 dark:text-white'>
                {label}
            </label>
            <div
                className='relative'>
                <input
                    {...rest}
                    className={cn('py-2 px-3 block w-full border-gray-200 rounded-md text-sm dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100', inputClassName)}
                    id={id}
                    type='number'
                    min={min} max={max}
                    value={value}
                    onChange={onChange}/>
                {
                    unit &&
                    <div
                        className='absolute inset-y-0 right-0 flex items-center pointer-events-none z-20 pr-3'>
                        <span className='text-gray-500 dark:text-gray-400 text-sm'>{unit}</span>
                    </div>
                }
            </div>
        </div>
    )
}