// See ../GLOSSARY.md for equatorial/ecliptic/horizontal coordinates, obliquity, and hour angle.
import { DEG_TO_RAD, normalizeDegrees, RAD_TO_DEG } from "./math.js";
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
    const e = obliquity * DEG_TO_RAD;
    const l = ecl.longitude * DEG_TO_RAD;
    const b = ecl.latitude * DEG_TO_RAD;

    const cose = Math.cos(e);
    const sine = Math.sin(e);
    const sinl = Math.sin(l);

    return {
        rightAscension: normalizeDegrees(Math.atan2(sinl * cose - Math.tan(b) * sine, Math.cos(l)) * RAD_TO_DEG),
        declination: Math.asin(Math.sin(b) * cose + Math.cos(b) * sine * sinl) * RAD_TO_DEG,
    };
}

/**
 * Equatorial to horizontal coordinates, per Meeus' "Astronomical Algorithms" (12.5, 12.6).
 * `observersLongitude` is positive east (standard geographic convention: LST = GST + east longitude),
 * verified against the 2024-04-08 total solar eclipse via eclipse.ts's solarEclipseState.
 */
export function equatorialToHorizontal(
    equ: EquatorialCoords,
    siderealTime: JulianDay,
    observersLatitude: number,
    observersLongitude: number,
): HorizontalCoords {
    // Local hour angle: H = θ - α (AA.p88).
    const H = (siderealTime + observersLongitude - equ.rightAscension) * DEG_TO_RAD;
    const declination = equ.declination * DEG_TO_RAD;

    const cosH = Math.cos(H);
    const sinLat = Math.sin(observersLatitude * DEG_TO_RAD);
    const cosLat = Math.cos(observersLatitude * DEG_TO_RAD);

    return {
        altitude: Math.asin(sinLat * Math.sin(declination) + cosLat * Math.cos(declination) * cosH) * RAD_TO_DEG,
        azimuth: Math.atan2(Math.sin(H), cosH * sinLat - Math.tan(declination) * cosLat) * RAD_TO_DEG,
    };
}
