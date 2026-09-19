# Glossary

Astronomy terms used across this library, mostly following Meeus, "Astronomical Algorithms". Written for
readers comfortable with code but not necessarily with classical astronomy.

## Time

- **Julian Day (JD)**: A continuous day count starting at noon UTC on 4713 BCE January 1 (Julian proleptic
  calendar). Astronomers use it so calendar irregularities (varying month lengths, leap years, the
  Julian-to-Gregorian switch) don't have to be handled by the actual position formulas. `julianDay()` in
  `time.ts` converts a calendar date/time to this count.
- **Julian century (commonly `T`)**: The number of 36,525-day periods since J2000.0. Nearly every formula
  in this library is a polynomial in `T`, since century-scale drift terms are numerically nicer to work
  with in centuries than in raw days.
- **Standard equinox / J2000.0**: The reference epoch, 2000 January 1, 12:00 Terrestrial Time. Orbital
  elements ("mean" quantities, below) are defined relative to this fixed date rather than "now", which is
  why they need the corrections below (nutation, equation of the center, ...) to become an apparent,
  as-seen-right-now position.
- **Epoch (B1900, B1950, J2050)**: Alternative reference dates from older star catalogs/ephemerides. "B"
  epochs are Besselian (based on a slightly different definition of a year's length) rather than Julian.
- **Sidereal time**: The hour angle of the vernal equinox, i.e. "what time it is" for pointing a telescope,
  since it tracks Earth's rotation relative to the stars rather than the Sun (a sidereal day is ~4 minutes
  shorter than a solar day). `meanSiderealTime()` gives Greenwich's sidereal time.

## Coordinate systems

- **Equatorial coordinates (right ascension α, declination δ)**: Coordinates on the celestial sphere using
  Earth's rotational axis and equator as the reference plane, analogous to longitude/latitude on Earth but
  for the sky. Right ascension is measured eastward from the vernal equinox; declination is the
  celestial-equator equivalent of latitude.
- **Ecliptic coordinates (ecliptic longitude l, ecliptic latitude β)**: Coordinates using the plane of
  Earth's orbit (the ecliptic) as the reference plane instead of the equator. Since the Sun's ecliptic
  latitude is always ~0 by definition, and the Moon and planets orbit close to this plane, orbital
  calculations are often simplest here before converting to equatorial.
- **Horizontal coordinates (azimuth h, altitude A)**: Coordinates relative to one observer's local horizon:
  altitude is height above the horizon, azimuth is the compass-like direction along it. Unlike the other
  two systems, this is what you'd actually point at, and it depends on the observer's latitude/longitude
  and the current sidereal time.
- **Obliquity of the ecliptic (ε)**: The tilt angle (~23.4°) between Earth's equatorial plane and its
  orbital plane, i.e. the axial tilt responsible for seasons. Needed to convert between ecliptic and
  equatorial coordinates. "Mean" obliquity ignores nutation (below); "true" obliquity includes it.
- **Hour angle (H)**: How far a point on the sky has rotated past the local meridian (due south/north), i.e.
  sidereal time minus its right ascension. Used to convert equatorial coordinates to horizontal ones.

## Orbital elements and corrections

- **Mean anomaly (M)**: The angle a body would have traveled along its orbit if it moved at a constant
  average speed, i.e. its position ignoring that real orbits are elliptical (faster near perihelion, slower
  near aphelion). A simple near-linear function of time.
- **Mean longitude (L₀)**: Mean anomaly plus the longitude of perihelion, i.e. the mean anomaly re-expressed
  as an absolute ecliptic longitude rather than an angle measured from perihelion.
- **True anomaly / true longitude**: The mean anomaly/longitude corrected for orbital eccentricity (see
  "equation of the center"), giving the body's actual angular position along its real elliptical orbit.
- **Equation of the center (C)**: The correction added to mean anomaly to get true anomaly, arising because
  orbits are ellipses, not circles. Usually the single largest correction when approximating orbital motion
  as uniform circular motion.
- **Orbital eccentricity (e)**: How elongated an orbit's ellipse is (0 = perfect circle). Directly sets the
  size of the equation of the center and of orbital-distance variation over one orbit.
- **Mean elongation (D)**: The angular separation of the Moon from the Sun as seen from Earth (mean, not yet
  corrected for either body's orbital eccentricity). Used throughout the Moon's periodic perturbation series
  alongside its mean anomaly.
- **Argument of latitude (F)**: The Moon's mean angular distance from its orbit's ascending node (where it
  crosses the ecliptic heading north). This is *not* the Moon's ecliptic latitude itself, it's an input used
  to compute it.
- **Longitude of the ascending node (Ω)**: The ecliptic longitude of the point where the Moon's orbit
  crosses the ecliptic plane heading north. The Moon's orbital plane itself precesses, so this slowly
  regresses over an 18.6-year cycle, and it drives most of the nutation terms below.
- **Nutation (in longitude Δψ, in obliquity Δε)**: A small, roughly-18.6-year periodic wobble in Earth's
  axis, caused mainly by the Moon's varying gravitational pull as its orbital plane precesses. Layered on
  top of the much larger, slow (26,000-year) precession. "In longitude" nutates ecliptic longitude; "in
  obliquity" nutates the obliquity angle itself.
- **Apparent position**: A body's actual, as-observed-right-now position: its mean/true orbital position
  further corrected for nutation and, for the Sun and stars, aberration (a small angular shift caused by
  Earth's own orbital velocity, similar to rain appearing to slant when you run through it).
- **Atmospheric refraction**: The bending of light by Earth's atmosphere, which makes objects near the
  horizon appear higher than their true geometric altitude (the Sun stays visible for a bit after it has
  geometrically already set).
- **Apparent angular diameter**: How large a body (Sun/Moon) looks in the sky, as an angle, given its
  physical radius and current distance.

## Moon-specific

- **Libration (optical)**: The Moon keeps (nearly) the same face toward Earth, but its orbit and axis tilt
  let an observer see slightly different slivers of its far side over time, as if it were slowly
  nodding/rocking. "Optical" as opposed to "physical" libration (a real wobble in its rotation), which this
  library doesn't model.
- **Parallactic angle**: The angle between "straight up" (the local zenith direction) and celestial north as
  seen from a given point on the Moon/sky. Relevant for orienting how a crescent or terminator will actually
  appear tilted for a specific observer.
- **Position angle of axis**: The angle, on the sky, between celestial north and the Moon's own north
  pole/rotation axis, needed to draw the Moon's surface features (or a lit crescent) correctly oriented
  rather than always "upright".
- **Parallax (equatorial horizontal / topocentric position)**: The Moon is close enough (~384,000 km) that
  its apparent position shifts noticeably (up to ~1°) depending on where on Earth's surface you're standing,
  unlike the Sun or stars. `equatorialHorizontalParallax` is the size of that shift for an observer at
  Earth's equator with the Moon on their horizon; `topocentricPosition` applies the actual correction for a
  given observer, which `horizontalPosition` then uses.

## Eclipses

- **Eclipse phase**: Both `solarEclipseState` and `lunarEclipseState` express "how much" as a single 0-1+
  `phase` axis rather than separate magnitude/type fields: 0 is the deepest possible eclipse (centered), 1 is
  the outer edge of any eclipse effect at all (Sun/Moon discs just touching for a solar eclipse, the Moon at
  the penumbra's outer edge for a lunar one), above 1 means no eclipse. 0.5 is always the boundary between the
  "deep" zone (total/annular for solar, umbral for lunar) and the "shallow" zone (partial for solar, penumbral
  for lunar) - fixed at 0.5 regardless of how that boundary's actual size varies eclipse to eclipse, since a
  lookup-texture-style consumer needs a stable coordinate for it, not one that drifts with the day's actual
  distances. This follows the phase parameterization from Limberger et al., "Single-Pass Rendering of Day and
  Night Sky Phenomena" (VMV 2012), which defined it for lunar eclipses; the same shape (deep zone/shallow zone,
  fixed 0.5 boundary) is applied here to solar eclipses too, which that paper didn't cover. `linearPhase` is
  the same distance instead expressed as one global linear fraction (no fixed 0.5 anchor). Total-vs-annular
  and umbral-vs-penumbral distinctions aren't encoded as a discrete label: compare `sun.apparentAngularDiameter`
  vs `moon.apparentAngularDiameter` directly if that's needed. Unlike a solar eclipse, whether a lunar eclipse
  *occurs* is the same for every observer who can see the Moon at all, a real geocentric event, not a
  perspective effect.
- **Position angle**: The compass-like direction from one point to another (e.g. from the Sun's center to the
  Moon's, or from the axis of Earth's shadow to the Moon), measured in degrees from "north" through "east", so
  that magnitude alone (how much) can be paired with position angle (which side) to actually place the
  overlap when drawing it, not just size it.
