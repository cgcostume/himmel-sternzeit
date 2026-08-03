import {
    type EquatorialCoords,
    eclipticalToEquatorial,
    equatorialToHorizontal,
    type HorizontalCoords,
} from "./coords.js";
import * as earth from "./earth.js";
import { auToKm, degToRad, normalizeDegrees, radToDeg } from "./math.js";
import * as moon from "./moon.js";
import { meanSiderealTime, meanSiderealTimeApprox } from "./siderealTime.js";
import { type AstronomicalTime, type JulianDay, julianCenturiesSinceStandardEquinox, julianDayUT } from "./time.js";

/** http://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html */
export const SUN_MEAN_RADIUS_KM = 0.696e6;

/** Mean anomaly, in degrees, per Meeus' "Astronomical Algorithms" (45.3). */
export function meanAnomaly(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);

    const M = 357.5291092 + T * (35999.0502909 + T * (-0.0001536 + T * (1.0 / 24490000.0)));

    return normalizeDegrees(M);
}

/** ("A Physically-Based Night Sky Model" - 2001 - Wann Jensen et al.) */
export function meanAnomalyApprox(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);
    const M = radToDeg(6.24 + 628.302 * T);

    return normalizeDegrees(M);
}

export function meanLongitude(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);
    const L0 = 280.46645 + T * (36000.76983 + T * 0.0003032);

    return normalizeDegrees(L0);
}

export function meanLongitudeApprox(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);
    const L0 = 280.4665 + T * 36000.7698;

    return normalizeDegrees(L0);
}

/** Equation of the center (AA p152). */
export function center(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);
    const M = degToRad(meanAnomaly(t));

    return (
        (1.9146 - T * (0.004817 - T * 0.000014)) * Math.sin(M) +
        (0.019993 - T * 0.000101) * Math.sin(2.0 * M) +
        0.00029 * Math.sin(3.0 * M)
    );
}

/** v = M + C */
export function trueAnomaly(t: JulianDay): number {
    return meanAnomaly(t) + center(t);
}

/** True geometric longitude referred to the mean equinox of the date (Θ). */
export function trueLongitude(t: JulianDay): number {
    return meanLongitude(t) + center(t);
}

export function apparentPosition(t: JulianDay): EquatorialCoords {
    const O = degToRad(moon.meanOrbitLongitude(t));
    const e = degToRad(earth.trueObliquity(t) + 0.00256 * Math.cos(O));
    const l = degToRad(trueLongitude(t) - 0.00569 - 0.00478 * Math.sin(O));

    const sinl = Math.sin(l);

    return {
        rightAscension: normalizeDegrees(radToDeg(Math.atan2(Math.cos(e) * sinl, Math.cos(l)))),
        declination: radToDeg(Math.asin(Math.sin(e) * sinl)),
    };
}

/** ("A Physically-Based Night Sky Model" - 2001 - Wann Jensen et al.) */
export function apparentPositionApprox(t: JulianDay): EquatorialCoords {
    const T = julianCenturiesSinceStandardEquinox(t);
    const M = degToRad(meanAnomalyApprox(t));

    const longitude = radToDeg(
        4.895048 + 628.331951 * T + (0.033417 - 0.000084 * T) * Math.sin(M) + 0.000351 * Math.sin(2 * M),
    );

    return eclipticalToEquatorial({ longitude, latitude: 0 }, earth.trueObliquityApprox(t));
}

export function horizontalPosition(time: AstronomicalTime, latitude: number, longitude: number): HorizontalCoords {
    const t = julianDayUT(time);
    const s = meanSiderealTime(time);

    return equatorialToHorizontal(apparentPosition(t), s, latitude, longitude);
}

export function horizontalPositionApprox(
    time: AstronomicalTime,
    latitude: number,
    longitude: number,
): HorizontalCoords {
    const t = julianDayUT(time);
    const s = meanSiderealTimeApprox(time);

    return equatorialToHorizontal(apparentPositionApprox(t), s, latitude, longitude);
}

/** Distance from the center of the Sun to the center of the Earth, in kilometers (AA.24.5). */
export function distance(t: JulianDay): number {
    const e = earth.orbitEccentricity(t);
    const R = (1.000001018 * (1.0 - e * e)) / (1.0 + e * Math.cos(degToRad(trueAnomaly(t))));

    return auToKm(R);
}

/** ("A Physically-Based Night Sky Model" - 2001 - Wann Jensen et al.) */
export function distanceApprox(t: JulianDay): number {
    const T = julianCenturiesSinceStandardEquinox(t);
    const M = 6.24 + 628.302 * T;

    const R = 1.00014 - (0.016708 - 0.000042 * T) * Math.cos(M) - 0.000141 * Math.cos(2 * M);

    return auToKm(R);
}
