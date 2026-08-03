export function toInt(value: number): number {
    return Math.trunc(value);
}

export function frac(value: number): number {
    return value - Math.trunc(value);
}

export function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

/** Normalizes an angle in degrees to the range [0, 360). */
export function normalizeDegrees(deg: number): number {
    return deg - Math.floor(deg / 360) * 360;
}

/** Fraction of a day represented by an hour/minute/second triple. */
export function dayFraction(hour: number, minute: number, second: number): number {
    return (hour + (minute + second / 60) / 60) / 24;
}
