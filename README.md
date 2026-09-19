# @himmel/sternzeit

Sidereal time and astronomical position math (sun, moon, stars) for sky
rendering. A TypeScript port of the astronomy core of
[osgHimmel](https://github.com/cgcostume/osghimmel), with no rendering or
DOM dependencies, usable from Node, a worker, or any renderer.

Part of the `@himmel/*` family (see [himmel-dunstkreis](https://github.com/cgcostume/himmel-dunstkreis)
for atmosphere rendering). Modules are intentionally decoupled: consumers
compute positions here and pass plain vectors/angles into the rendering
packages themselves.

New to terms like nutation, obliquity, or libration? See [GLOSSARY.md](./GLOSSARY.md).

## Status

Julian Day conversions, mean sidereal time, and Sun/Moon/Earth position math
(coordinates, orbital elements, nutation, apparent position, distance,
libration, parallactic angle) are implemented, each with a precise (Meeus)
and a cheaper approximate (Jensen et al.) variant; see `.` vs. `./approx` in
`package.json#exports`. The bright star catalog is checked in
(`src/data/`), but apparent star position (accounting for proper motion and
precession) isn't implemented yet.

## References

osgHimmel itself originated as [Daniel Limberger](https://daniellimberger.de)'s (né Müller) master's thesis at
HPI: ["Photorealistisches Rendering atmosphärischer Effekte in geovirtuellen 3D-Umgebungen in
Echtzeit"](https://daniellimberger.de/resources/2012%20%E2%80%93%20Mueller%20%28now%20Limberger%29%20%E2%80%93%20Photorealistisches%20Rendering%20atmosphaerischer%20Effekte%20in%20geovirtuellen%203D-Umgebungen%20in%20Echtzeit.pdf)
(2012, German).

The primary sources cited throughout the code (see individual function docstrings for exact section/equation numbers):

- Jean Meeus, *Astronomical Algorithms* (2nd ed., Willmann-Bell, 1998) — the precise variants' main source.
- H. Wann Jensen, F. Durand, J. Dorsey, M. M. Stark, P. Shirley, S. Premože,
  ["A Physically-Based Night Sky Model"](https://graphics.cs.yale.edu/publications/physically-based-night-sky-model)
  (SIGGRAPH 2001) — the approximate variants' main source.
- NSSDC planetary fact sheets: [Earth](http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html),
  [Moon](http://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html),
  [Sun](http://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html) — mean radii and similar constants.
- P. Bretagnon, *Théorie du mouvement de l'ensemble des planètes. Solution VSOP82* (1982) — Earth's orbital eccentricity.
- G. G. Bennett, "The Calculation of the Astronomical Refraction in Marine Navigation" (1982), and
  Þorsteinn Sæmundsson, *Sky and Telescope* (1982) — atmospheric refraction.
- T. Nishita, T. Sirai, K. Tadamura, E. Nakamae, "Display of the Earth Taking into Account Atmospheric
  Scattering" (SIGGRAPH 1993), and E. Bruneton, F. Neyret, "Precomputed Atmospheric Scattering" (2008) —
  atmosphere thickness constant.

## Development

```sh
pnpm install
pnpm build       # rolldown -> dist/*.js + dist/*.d.ts
pnpm typecheck   # tsc --noEmit
pnpm test        # playwright test
```
