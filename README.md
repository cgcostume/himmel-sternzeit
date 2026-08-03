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

## Development

```sh
pnpm install
pnpm build       # rolldown -> dist/*.js + dist/*.d.ts
pnpm typecheck   # tsc --noEmit
pnpm test        # playwright test
```
