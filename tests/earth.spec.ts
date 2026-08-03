import { expect, test } from "@playwright/test";
import * as approx from "../src/approx.js";
import * as precise from "../src/index.js";

test("earth.meanObliquity matches the standard J2000.0 value (23°26'21.448\")", () => {
    expect(precise.earth.meanObliquity(precise.J2000)).toBeCloseTo(23 + 26 / 60 + 21.448 / 3600, 9);
});

test("earth.orbitEccentricityApprox is the constant from the approximate model", () => {
    expect(approx.earth.orbitEccentricity()).toBeCloseTo(0.01671022, 8);
});

test("precise and approx sun/moon namespaces expose the same call sites", () => {
    // Same date, different accuracy: switching the import should be the only thing that changes.
    const t = precise.J2000;

    expect(typeof precise.sun.apparentPosition(t).rightAscension).toBe("number");
    expect(typeof approx.sun.apparentPosition(t).rightAscension).toBe("number");
    expect(typeof precise.moon.apparentPosition(t).declination).toBe("number");
    expect(typeof approx.moon.apparentPosition(t).declination).toBe("number");
});
