export function round(n: number, decimalPlaces: number) {
    const e = Math.pow(10, decimalPlaces);
    return Math.round((n * e) * (1 + Number.EPSILON)) / e;
}