// biome-ignore-all assist/source/organizeImports: exports are hand-grouped by domain, not alphabetical, mirroring index.ts
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
    julianDay,
    julianDay0UT,
    julianDayUT,
    fromJulianDay,
    modifiedJulianDay,
    toUT,
    julianDaysSinceStandardEquinox,
    julianCenturiesSinceStandardEquinox,
} from "./time.js"; // Julian Day conversions

// Sidereal time.
export { meanSiderealTimeApprox as siderealTime } from "./siderealTime.js";

// Earth. Same shape as the precise `earth` namespace in `index.ts`, minus `viewDistanceWithinAtmosphere`'s
// refraction flag. MEAN_RADIUS_KM/ATMOSPHERE_THICKNESS_KM/ATMOSPHERE_THICKNESS_NON_UNIFORM_KM/
// APPARENT_MAGNITUDE_LIMIT/atmosphericRefraction have no approximate variant, same values either way.
export const earth = {
    MEAN_RADIUS_KM: earthImpl.MEAN_RADIUS_KM,
    ATMOSPHERE_THICKNESS_KM: earthImpl.ATMOSPHERE_THICKNESS_KM,
    ATMOSPHERE_THICKNESS_NON_UNIFORM_KM: earthImpl.ATMOSPHERE_THICKNESS_NON_UNIFORM_KM,
    APPARENT_MAGNITUDE_LIMIT: earthImpl.APPARENT_MAGNITUDE_LIMIT,
    atmosphericRefraction: earthImpl.atmosphericRefraction,
    orbitEccentricity: earthImpl.orbitEccentricityApprox,
    apparentAngularSunDiameter: earthImpl.apparentAngularSunDiameterApprox,
    apparentAngularMoonDiameter: earthImpl.apparentAngularMoonDiameterApprox,
    longitudeNutation: earthImpl.longitudeNutationApprox,
    obliquityNutation: earthImpl.obliquityNutationApprox,
    meanObliquity: earthImpl.meanObliquityApprox,
    trueObliquity: earthImpl.trueObliquityApprox,
    viewDistanceWithinAtmosphere: earthImpl.viewDistanceWithinAtmosphereApprox,
};

// Sun. Same shape as the precise `sun` namespace in `index.ts`, minus `center`/`trueAnomaly`/`trueLongitude`
// (no approximate variant of those exists).
export const sun = {
    MEAN_RADIUS_KM: sunImpl.MEAN_RADIUS_KM,
    meanAnomaly: sunImpl.meanAnomalyApprox,
    meanLongitude: sunImpl.meanLongitudeApprox,
    apparentPosition: sunImpl.apparentPositionApprox,
    horizontalPosition: sunImpl.horizontalPositionApprox,
    distance: sunImpl.distanceApprox,
};

// Moon. Same shape as the precise `moon` namespace in `index.ts`.
export type { MoonLibration } from "./moon.js";
export const moon = {
    MEAN_RADIUS_KM: moonImpl.MEAN_RADIUS_KM,
    meanLongitude: moonImpl.meanLongitudeApprox,
    meanElongation: moonImpl.meanElongationApprox,
    meanAnomaly: moonImpl.meanAnomalyApprox,
    meanArgumentOfLatitude: moonImpl.meanArgumentOfLatitudeApprox,
    meanAscendingNodeLongitude: moonImpl.meanAscendingNodeLongitudeApprox,
    position: moonImpl.positionApprox,
    apparentPosition: moonImpl.apparentPositionApprox,
    horizontalPosition: moonImpl.horizontalPositionApprox,
    distance: moonImpl.distanceApprox,
    opticalLibrations: moonImpl.opticalLibrationsApprox,
    parallacticAngle: moonImpl.parallacticAngleApprox,
    positionAngleOfAxis: moonImpl.positionAngleOfAxisApprox,
};
