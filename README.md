# @himmel/sternzeit

Sidereal time and astronomical position math (sun, moon, stars) for sky
rendering. A TypeScript port of the astronomy core of
[osgHimmel](https://github.com/cgcostume/osghimmel), with no rendering or
DOM dependencies, usable from Node, a worker, or any renderer.

Part of the `@himmel/*` family (see [himmel-dunstkreis](https://github.com/cgcostume/himmel-dunstkreis)
for atmosphere rendering). Modules are intentionally decoupled: consumers
compute positions here and pass plain vectors/angles into the rendering
packages themselves.

## Status

Early port in progress. Currently implemented: Julian Day conversions and
mean sidereal time (`julianday.*`, `atime.*`, `siderealtime.*` from the
original). Sun/moon/star position math follows next.

## Development

```sh
pnpm install
pnpm build       # rolldown -> dist/*.js + dist/*.d.ts
pnpm typecheck   # tsc --noEmit
pnpm test        # playwright test
```
