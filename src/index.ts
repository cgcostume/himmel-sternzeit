// biome-ignore-all assist/source/organizeImports: exports are hand-grouped by domain, not alphabetical
import * as earthImpl from "./earth.js";
import * as moonImpl from "./moon.js";
import * as sunImpl from "./sun.js";

// Coordinate systems.
export type { EclipticalCoords, EquatorialCoords, HorizontalCoords } from "./coords.js";
export { eclipticalToEquatorial, equatorialToHorizontal } from "./coords.js";

// Time and Julian Day.
export type { AstronomicalTime, JulianDay } from "./time.js";
export { J2000, J2050, B1900, B1950, STANDARD_EQUINOX } from "./time.js"; // reference epochs
export {
    fromJulianDay,
    julianDay,
    julianDay0UT,
    julianDayUT,
    julianDaysSinceStandardEquinox,
    julianCenturiesSinceStandardEquinox,
    modifiedJulianDay,
    toUT,
} from "./time.js"; // Julian Day conversions

// Sidereal time.
export { meanSiderealTime as siderealTime } from "./siderealTime.js";

// Earth.
export const earth = {
    MEAN_RADIUS_KM: earthImpl.MEAN_RADIUS_KM,
    ATMOSPHERE_THICKNESS_KM: earthImpl.ATMOSPHERE_THICKNESS_KM,
    ATMOSPHERE_THICKNESS_NON_UNIFORM_KM: earthImpl.ATMOSPHERE_THICKNESS_NON_UNIFORM_KM,
    APPARENT_MAGNITUDE_LIMIT: earthImpl.APPARENT_MAGNITUDE_LIMIT,
    atmosphericRefraction: earthImpl.atmosphericRefraction,
    orbitEccentricity: earthImpl.orbitEccentricity,
    apparentAngularSunDiameter: earthImpl.apparentAngularSunDiameter,
    apparentAngularMoonDiameter: earthImpl.apparentAngularMoonDiameter,
    longitudeNutation: earthImpl.longitudeNutation,
    obliquityNutation: earthImpl.obliquityNutation,
    meanObliquity: earthImpl.meanObliquity,
    trueObliquity: earthImpl.trueObliquity,
    viewDistanceWithinAtmosphere: earthImpl.viewDistanceWithinAtmosphere,
};

// Sun.
export const sun = {
    MEAN_RADIUS_KM: sunImpl.MEAN_RADIUS_KM,
    meanAnomaly: sunImpl.meanAnomaly,
    meanLongitude: sunImpl.meanLongitude,
    center: sunImpl.center,
    trueAnomaly: sunImpl.trueAnomaly,
    trueLongitude: sunImpl.trueLongitude,
    apparentPosition: sunImpl.apparentPosition,
    horizontalPosition: sunImpl.horizontalPosition,
    distance: sunImpl.distance,
};

// Moon.
export type { MoonLibration } from "./moon.js";
export const moon = {
    MEAN_RADIUS_KM: moonImpl.MEAN_RADIUS_KM,
    meanLongitude: moonImpl.meanLongitude,
    meanElongation: moonImpl.meanElongation,
    meanAnomaly: moonImpl.meanAnomaly,
    meanArgumentOfLatitude: moonImpl.meanArgumentOfLatitude,
    meanAscendingNodeLongitude: moonImpl.meanAscendingNodeLongitude,
    position: moonImpl.position,
    apparentPosition: moonImpl.apparentPosition,
    horizontalPosition: moonImpl.horizontalPosition,
    distance: moonImpl.distance,
    opticalLibrations: moonImpl.opticalLibrations,
    parallacticAngle: moonImpl.parallacticAngle,
    positionAngleOfAxis: moonImpl.positionAngleOfAxis,
};
