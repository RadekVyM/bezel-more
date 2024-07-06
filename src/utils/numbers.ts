export function round(n: number, decimalPlaces: number) {
    const e = Math.pow(10, decimalPlaces);
    return Math.round((n * e) * (1 + Number.EPSILON)) / e;
}

export function roundToEven(n: number) {
    return Math.round(n / 2) * 2;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(value, min));
}