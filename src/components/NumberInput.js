export default function NumberInput({ label, min, max, value, onChange }) {
    return (
        <div>
            <label
                className='form-label'>
                {label}
            </label>
            <input
                className='form-control'
                type='number'
                min={min} max={max}
                value={value}
                onChange={onChange}/>
        </div>
    )
}