import { degToRad, normalizeDegrees, radToDeg } from "./math.js";
import type { JulianDay } from "./time.js";

export interface EquatorialCoords {
    /** Right ascension (α), in degrees: angle east of the vernal equinox along the celestial equator. */
    rightAscension: number;
    /** Declination (δ), in degrees. Positive north of the celestial equator. */
    declination: number;
}

export interface EclipticalCoords {
    /** Ecliptical longitude (l), in degrees, measured from the vernal equinox along the ecliptic. */
    longitude: number;
    /** Ecliptical latitude (β), in degrees. Positive north of the ecliptic. */
    latitude: number;
}

export interface HorizontalCoords {
    /** Azimuth (h), in degrees, measured westwards from the south. */
    azimuth: number;
    /** Altitude (A), in degrees. Positive above, negative below the horizon. */
    altitude: number;
}

/** Ecliptical to equatorial coordinates, per Meeus' "Astronomical Algorithms" (13.3, 13.4). */
export function eclipticalToEquatorial(ecl: EclipticalCoords, obliquity: number): EquatorialCoords {
    const e = degToRad(obliquity);
    const l = degToRad(ecl.longitude);
    const b = degToRad(ecl.latitude);

    const cose = Math.cos(e);
    const sine = Math.sin(e);
    const sinl = Math.sin(l);

    return {
        rightAscension: normalizeDegrees(radToDeg(Math.atan2(sinl * cose - Math.tan(b) * sine, Math.cos(l)))),
        declination: radToDeg(Math.asin(Math.sin(b) * cose + Math.cos(b) * sine * sinl)),
    };
}

/**
 * Equatorial to horizontal coordinates, per Meeus' "Astronomical Algorithms" (12.5, 12.6).
 * `observersLongitude` is positive west.
 */
export function equatorialToHorizontal(
    equ: EquatorialCoords,
    siderealTime: JulianDay,
    observersLatitude: number,
    observersLongitude: number,
): HorizontalCoords {
    // Local hour angle: H = θ - α (AA.p88).
    const H = degToRad(siderealTime + observersLongitude - equ.rightAscension);
    const declination = degToRad(equ.declination);

    const cosH = Math.cos(H);
    const sinLat = Math.sin(degToRad(observersLatitude));
    const cosLat = Math.cos(degToRad(observersLatitude));

    return {
        altitude: radToDeg(Math.asin(sinLat * Math.sin(declination) + cosLat * Math.cos(declination) * cosH)),
        azimuth: radToDeg(Math.atan2(Math.sin(H), cosH * sinLat - Math.tan(declination) * cosLat)),
    };
}
