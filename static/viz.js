import * as precise from "../dist/index.js";

const { Illustration, Anchor, Shape, Ellipse } = window.Zdog;
const DEG = Math.PI / 180;

// Schematic, not to scale: sizes/distances chosen for visibility, not physical proportion. MOON_DIST/
// SUN_DIST aren't simply EARTH_R*2 scaled: the whole scene auto-zooms to fit the viewport (see
// Illustration's onResize below), so a uniform scale-up of every constant would render identically after
// that zoom. Instead these keep the same clearance gaps as before EARTH_R doubled, so Earth reads as
// bigger relative to the sun/moon, not just bigger in an auto-zoom-cancelled absolute sense.
const EARTH_R = 80;
const MOON_R = 11;
const SUN_R = 32;
const MOON_DIST = 135;
const SUN_DIST = 460;

function v(x, y, z) {
    return { x, y, z };
}
function vAdd(a, b) {
    return v(a.x + b.x, a.y + b.y, a.z + b.z);
}
function vScale(a, s) {
    return v(a.x * s, a.y * s, a.z * s);
}
function vCross(a, b) {
    return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function vNormalize(a) {
    const len = Math.hypot(a.x, a.y, a.z) || 1;
    return vScale(a, 1 / len);
}

// Earth-centered equatorial frame: RA=0/dec=0 is the +X axis, the celestial equator is the XZ plane,
// +dec is -Y (Zdog is screen-convention y-down, so "up"/north is negative y). Used for every body
// (sun/moon apparentPosition) and, via siderealTime + longitude standing in for RA, for points on Earth's
// own surface, so a ground point's position here rotates in sync with the sky exactly as it does in reality.
function sphericalToVector(raDeg, decDeg, radius) {
    const ra = raDeg * DEG;
    const dec = decDeg * DEG;
    return v(radius * Math.cos(dec) * Math.cos(ra), -radius * Math.sin(dec), radius * Math.cos(dec) * Math.sin(ra));
}

// Mirrors Zdog's Vector.prototype.rotate exactly (rotateZ, then rotateY, then rotateX; see
// node_modules/zdog/dist/zdog.dist.js), and Zdog's default rendering is plain orthographic (renderOrigin.x/y
// scaled by `zoom`, z only used for depth-sorting). That makes this an exact match for where Zdog will
// actually draw a point, used here to place the sun/moon distance labels on top of their body each frame.
function projectToScreen(p, rotX, rotY, zoom) {
    const cy = Math.cos(rotY);
    const sy = Math.sin(rotY);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.z * cy + p.x * sy;
    const cx = Math.cos(rotX);
    const sx = Math.sin(rotX);
    const y2 = p.y * cx - z1 * sx;
    return { x: x1 * zoom, y: y2 * zoom };
}

// A flat hollow ring (fill:false), not the point-stroke "filled dot" trick: a point-stroke can only ever
// render as a solid filled disc (round linecap on a zero-length path), so an outline look needed two
// coincident shapes (black outer, white inner) relying on z-sort to layer them, which z-fights once the
// scene rotates enough. A single Ellipse has nothing to mis-sort against; the trade-off is it doesn't
// billboard, so it'll squash toward a line at extreme rotation angles rather than staying a perfect circle
// (acceptable for a schematic, not-to-scale diagram).
function addOutlineCircle(parent, radius) {
    return new Ellipse({ addTo: parent, diameter: radius * 2, color: "#000", stroke: 1.5, fill: false });
}

const illustration = new Illustration({
    element: "#stage",
    zoom: 1,
    resize: true,
    // setSizeSvg() computes the viewBox from `zoom` before this callback runs, so a plain assignment here
    // would leave a stale viewBox until the next resize; setSize() re-derives it with the new zoom. Uses
    // `this` (Zdog calls it as this.onResize(...)) rather than closing over `illustration`: onResize fires
    // synchronously during the `new Illustration(...)` call below, before that const binding exists.
    onResize: function (width, height) {
        this.zoom = (Math.min(width, height) / 2 / (SUN_DIST + SUN_R)) * 0.92;
        this.setSize(width, height);
    },
});

// Earth is shown implicitly, not as a drawn sphere/grid: just the two circles that pass through the
// observer (their latitude ring and their meridian), crossing exactly at the observer marker. Both
// orientations are fixed (lat rings always have plane-normal Y, meridians always contain the Y axis, see
// sphericalToVector's comment); only diameter/translate/rotate change per frame to track lat/long.
const earthAnchor = new Anchor({ addTo: illustration });
// Three-tier line-style scheme, tracking how far a line is from "the answer": dotted = fixed reference,
// independent of both JD and location (equator, rotation axis, ecliptic pole below); dashed = construction
// lines derived from the inputs but not themselves the result (the observer's lat/long rings); solid = the
// actual current fact the rest exists to locate (the radius line + observer marker). Dash patterns are
// applied via raw SVG attributes each frame in frame(), Zdog itself has no dashed/dotted-stroke option.
const equatorRing = new Ellipse({ addTo: earthAnchor, diameter: 2 * EARTH_R, rotate: { x: Math.PI / 2 }, color: "#000", stroke: 1, fill: false });
const axisLine = new Shape({ addTo: earthAnchor, path: [v(0, -EARTH_R, 0), v(0, EARTH_R, 0)], stroke: 1, color: "#000" });
// The observer's own latitude/meridian rings: where they are right now.
const latitudeRing = new Ellipse({ addTo: earthAnchor, diameter: 2 * EARTH_R, rotate: { x: Math.PI / 2 }, color: "#000", stroke: 1, fill: false });
const meridianRing = new Ellipse({ addTo: earthAnchor, diameter: 2 * EARTH_R, color: "#000", stroke: 1, fill: false });
// The radius from center to the observer: the concrete result, solid.
const radiusLine = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1, color: "#000" });
// Earth's center, so the radius line has a visible point of origin to read from.
const centerDot = new Shape({ addTo: earthAnchor, stroke: 3, color: "#000" });
// The two rings cross at two antipodal points; this marks which one is actually the observer.
const observerMarker = new Shape({ addTo: earthAnchor, stroke: 7, color: "#000", translate: { z: 0.1 } });
// Everything below is opt-in: hidden until its checkbox is checked in the "earth" table (the leading
// column added there for exactly this; see index.js's ANNOTATABLE_NAMES/annotateCell). visible is set
// each frame from the checkedAnnotations Set carried by "inspector:annotate" (see the listener below).
//
// Ecliptic pole: the celestial pole (the solid vertical axis) rotated by obliquity about the X axis (the
// vernal equinox, our +X axis, is the ascending node of one plane on the other) — true and mean obliquity
// give slightly different angles, hence two lines; obliquityNutationLine is just the (tiny) gap between
// their pole tips, the nutation itself made visible rather than left as a number.
const trueEclipticAxis = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1, color: "#000", visible: false });
const meanEclipticAxis = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1, color: "#000", visible: false });
// The tilt itself, as a swept arc from the celestial pole to the true ecliptic pole, rather than a straight
// chord between them: a curve reads as "this many degrees of angle" more directly than a line does. Both
// axes extend through the origin in both directions (north and south pole), so the arc is mirrored too:
// trueObliquityArc for the north side, trueObliquityArcSouth for the (identical, negated) south side.
const trueObliquityArc = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0)], closed: false, stroke: 1, color: "#000", visible: false });
const trueObliquityArcSouth = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0)], closed: false, stroke: 1, color: "#000", visible: false });
const obliquityNutationLine = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1, color: "#000", visible: false });
// Longitude nutation: the true equinox (where RA is actually measured from right now) wanders a little
// from the mean/fixed one (our +X axis) within the equatorial plane; marked on the equator ring's surface.
const longitudeNutationLine = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1, color: "#000", visible: false });
const trueEquinoxDot = new Shape({ addTo: earthAnchor, stroke: 3, color: "#000", visible: false });
// Earth's (equivalently, from here, the sun's apparent) orbital ellipse, real eccentricity (~0.0167), so
// this will read as very nearly circular, which is itself the honest answer. Centered on Earth rather than
// offset to the correct focus: that needs the orbit's orientation (longitude of perihelion), which nothing
// in this codebase computes, so this shows the shape/flatness, not the correct sun-at-focus positioning.
const orbitEllipse = new Ellipse({ addTo: earthAnchor, rotate: { x: Math.PI / 2 }, color: "#000", stroke: 1, fill: false, visible: false });
// viewDistanceWithinAtmosphere, reinterpreted with a direction it doesn't otherwise have (unlike the fixed
// y=0.5 the table uses): y = sin(altitude) toward the sun, i.e. "how much atmosphere is between you and the
// sun right now", scaled from km using Earth's real-to-scene radius ratio since it's an earth-atmosphere
// quantity, not a schematic distance like sun/moon's.
const atmosphereRayLine = new Shape({ addTo: earthAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1.5, color: "#000", visible: false });
const atmosphereRayDot = new Shape({ addTo: earthAnchor, stroke: 3, color: "#000", visible: false });
// The atmosphere shell itself, sliced through the meridian plane containing both the pole and the point
// where the ray above exits it (a real oriented ring, like meridianRing, not a camera-facing billboard, so
// it squashes with rotation the same way everything else here does). stroke is set to the atmosphere's own
// thickness in scene units each frame, so the band's width literally *is* ATMOSPHERE_THICKNESS_KM, not a
// stand-in for it.
const atmosphereRing = new Ellipse({ addTo: earthAnchor, color: "rgba(135, 206, 250, 0.5)", fill: false, visible: false });

const sunAnchor = new Anchor({ addTo: illustration });
const sunOutline = addOutlineCircle(sunAnchor, SUN_R);

const moonAnchor = new Anchor({ addTo: illustration });
const moonOutline = addOutlineCircle(moonAnchor, MOON_R);
// Tidal lock emphasis: a line to the point on the moon nearest Earth (always there, since real
// libration is only a few degrees), plus a dot offset by the actual optical libration + position-angle-
// of-axis, which visibly wanders around that point as JD advances, particularly in live mode.
const moonFaceLine = new Shape({ addTo: moonAnchor, path: [v(0, 0, 0), v(0, 0, 0)], stroke: 1.5, color: "#000" });
const moonFaceDot = new Shape({ addTo: moonAnchor, stroke: 3, color: "#000", translate: { z: 0.1 } });

const stageEl = document.getElementById("stage");
const sceneEl = document.getElementById("scene");
const tooltipEl = document.getElementById("tooltip");
const sunLabelEl = document.getElementById("sunLabel");
const moonLabelEl = document.getElementById("moonLabel");
// jd/latitude/longitude are index.html's own toolbar inputs (index.js owns writing to them: "now",
// "live", geolocate); this scene only ever reads their current value, once per animation frame, so it
// stays in sync with whatever drives them without needing its own copy of that wiring.
const jdInput = document.getElementById("jd");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

// Manual drag-rotate (rather than Zdog's built-in dragRotate); also used by projectToScreen() to place
// the sun/moon distance labels and to hit-test hover, so it needs to be readable state, not hidden
// inside Zdog's Dragger.
let rotX = -0.3;
let rotY = 0.5;
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let scenePointer = null;

stageEl.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastPointer = { x: e.clientX, y: e.clientY };
    stageEl.setPointerCapture(e.pointerId);
});
window.addEventListener("pointerup", () => {
    dragging = false;
});
stageEl.addEventListener("pointermove", (e) => {
    if (dragging) {
        const dx = e.clientX - lastPointer.x;
        const dy = e.clientY - lastPointer.y;
        lastPointer = { x: e.clientX, y: e.clientY };
        rotY += dx * 0.008;
        rotX += dy * 0.008;
    }
    const rect = sceneEl.getBoundingClientRect();
    scenePointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
stageEl.addEventListener("pointerleave", () => {
    scenePointer = null;
});

// Two hover sources feed the same highlight: index.js dispatches this when the pointer enters/leaves an
// inspector table row; frame() below also hit-tests scenePointer directly against the bodies. Whichever
// is active drives the highlight, and hovering the scene dispatches "viz:hover" right back so index.js
// can highlight the matching table row(s) too.
let hovered = null;
window.addEventListener("inspector:hover", (event) => {
    hovered = event.detail;
});
let lastDispatchedSceneDomain;

// Which of the checkbox-gated annotations (see the big comment above trueEclipticAxis) are currently on;
// index.js is the source of truth (checkedAnnotations there, since it survives that table's re-renders).
// Seeded here by reading the DOM directly rather than waiting for an "inspector:annotate" event: index.js
// runs to completion (including building the checked checkboxes into tablesDiv, and any dispatch it might
// fire) before this module script even starts, per module-script document-order execution, so an event
// fired from index.js's own top-level code would already be lost by the time this listener existed.
let annotated = new Set([...document.querySelectorAll("input[data-annotate]:checked")].map((cb) => cb.dataset.annotate));
window.addEventListener("inspector:annotate", (event) => {
    annotated = new Set(event.detail);
});

const KM_TO_SCENE = EARTH_R / precise.earth.MEAN_RADIUS_KM;

function formatKm(n) {
    return `${Math.round(n).toLocaleString("en-US")} km`;
}

function frame() {
    const jd = Number(jdInput.value);
    const latitude = Number(latitudeInput.value);
    const longitude = Number(longitudeInput.value);
    const time = precise.fromJulianDay(jd);

    const sunEqu = precise.sun.apparentPosition(jd);
    const moonEqu = precise.moon.apparentPosition(jd);
    const sunDistanceKm = precise.sun.distance(jd);
    const moonDistanceKm = precise.moon.distance(jd);
    const libration = precise.moon.opticalLibrations(jd);
    const positionAngleOfAxis = precise.moon.positionAngleOfAxis(jd);
    const siderealTime = precise.siderealTime(time);
    const obliquity = precise.earth.trueObliquity(jd);
    const sunHorizontal = precise.sun.horizontalPosition(time, latitude, longitude);

    const sunPos = sphericalToVector(sunEqu.rightAscension, sunEqu.declination, SUN_DIST);
    const moonPos = sphericalToVector(moonEqu.rightAscension, moonEqu.declination, MOON_DIST);
    const observerRa = siderealTime + longitude;
    const observerPos = sphericalToVector(observerRa, latitude, EARTH_R);

    sunAnchor.translate = sunPos;
    moonAnchor.translate = moonPos;
    // observerPos already has magnitude EARTH_R (sphericalToVector's radius arg), so this only needs a
    // plain 1.02x nudge above the surface, not a divide-by-EARTH_R (that previously collapsed the whole
    // vector down to magnitude ~1, putting the dot at the center instead of on the sphere).
    observerMarker.translate = vScale(observerPos, 1.02);
    latitudeRing.diameter = 2 * EARTH_R * Math.cos(latitude * DEG);
    latitudeRing.translate = { y: -EARTH_R * Math.sin(latitude * DEG) };
    latitudeRing.updatePath();
    meridianRing.rotate = { y: observerRa * DEG };
    radiusLine.path[1] = observerPos;
    radiusLine.updatePath();

    // Same rotate-the-Y-axis-by-obliquity-about-X derivation the ecliptic-plane ring used, applied to just
    // the pole direction instead of a whole ring.
    const eclipticPoleAt = (obliquityDeg) => v(0, -Math.cos(obliquityDeg * DEG) * EARTH_R, Math.sin(obliquityDeg * DEG) * EARTH_R);
    const truePole = eclipticPoleAt(obliquity);
    trueEclipticAxis.visible = annotated.has("trueObliquity");
    trueEclipticAxis.path[0] = vScale(truePole, -1);
    trueEclipticAxis.path[1] = truePole;
    trueEclipticAxis.updatePath();

    const OBLIQUITY_ARC_SEGMENTS = 16;
    const northArcPath = Array.from({ length: OBLIQUITY_ARC_SEGMENTS + 1 }, (_, i) => eclipticPoleAt((obliquity * i) / OBLIQUITY_ARC_SEGMENTS));
    trueObliquityArc.visible = annotated.has("trueObliquity");
    trueObliquityArc.path = northArcPath;
    trueObliquityArc.updatePath();
    trueObliquityArcSouth.visible = annotated.has("trueObliquity");
    trueObliquityArcSouth.path = northArcPath.map((p) => vScale(p, -1));
    trueObliquityArcSouth.updatePath();

    const meanObliquity = precise.earth.meanObliquity(jd);
    const meanPole = eclipticPoleAt(meanObliquity);
    meanEclipticAxis.visible = annotated.has("meanObliquity");
    meanEclipticAxis.path[0] = vScale(meanPole, -1);
    meanEclipticAxis.path[1] = meanPole;
    meanEclipticAxis.updatePath();

    obliquityNutationLine.visible = annotated.has("obliquityNutation");
    obliquityNutationLine.path[0] = meanPole;
    obliquityNutationLine.path[1] = truePole;
    obliquityNutationLine.updatePath();

    // The true equinox, shifted from the mean one (our +X axis) by longitudeNutation within the equatorial
    // plane; marked on the equator's surface (dec 0) rather than at the pole, since that's what "longitude"
    // (as opposed to obliquity, an angle *between* poles) refers to here.
    const longitudeNutation = precise.earth.longitudeNutation(jd);
    const trueEquinoxPoint = sphericalToVector(longitudeNutation, 0, EARTH_R);
    longitudeNutationLine.visible = annotated.has("longitudeNutation");
    longitudeNutationLine.path[0] = sphericalToVector(0, 0, EARTH_R);
    longitudeNutationLine.path[1] = trueEquinoxPoint;
    longitudeNutationLine.updatePath();
    trueEquinoxDot.visible = annotated.has("longitudeNutation");
    trueEquinoxDot.translate = vScale(trueEquinoxPoint, 1.02);

    const orbitEccentricity = precise.earth.orbitEccentricity(jd);
    orbitEllipse.visible = annotated.has("orbitEccentricity");
    orbitEllipse.width = 2 * SUN_DIST;
    orbitEllipse.height = 2 * SUN_DIST * Math.sqrt(1 - orbitEccentricity * orbitEccentricity);
    orbitEllipse.rotate = { x: Math.PI / 2 + obliquity * DEG };
    orbitEllipse.updatePath();

    // y = sin(altitude): the same "vertical component of the view direction" viewDistanceWithinAtmosphere
    // takes in the table, here derived from the sun's actual current altitude instead of a fixed 0.5.
    const viewDistanceKm = precise.earth.viewDistanceWithinAtmosphere(Math.sin(sunHorizontal.altitude * DEG));
    const towardSun = vNormalize(vAdd(sunPos, vScale(observerPos, -1)));
    const atmosphereRayEnd = vAdd(observerPos, vScale(towardSun, viewDistanceKm * KM_TO_SCENE));
    atmosphereRayLine.visible = annotated.has("viewDistanceWithinAtmosphere");
    atmosphereRayLine.path[0] = observerPos;
    atmosphereRayLine.path[1] = atmosphereRayEnd;
    atmosphereRayLine.updatePath();
    atmosphereRayDot.visible = annotated.has("viewDistanceWithinAtmosphere");
    atmosphereRayDot.translate = atmosphereRayEnd;

    // The shell the ray above terminates at: a meridian-style ring (same construction as meridianRing)
    // through both poles and through towardSun's own longitude, so it passes through the ray's actual exit
    // point rather than just being a generic indicator. stroke = the atmosphere's real thickness in scene
    // units, so the rendered band's width literally is ATMOSPHERE_THICKNESS_KM, not a stand-in for it.
    const atmosphereThicknessScene = precise.earth.ATMOSPHERE_THICKNESS_KM * KM_TO_SCENE;
    const towardSunRaRad = Math.atan2(towardSun.z, towardSun.x); // atan2 is already in radians, what rotate expects
    atmosphereRing.visible = annotated.has("viewDistanceWithinAtmosphere");
    atmosphereRing.diameter = 2 * (EARTH_R + atmosphereThicknessScene / 2);
    atmosphereRing.stroke = atmosphereThicknessScene;
    atmosphereRing.rotate = { y: towardSunRaRad };
    atmosphereRing.updatePath();

    // Moon face marker geometry, see comment at moonFaceLine's declaration.
    const earthward = vNormalize(vScale(moonPos, -1));
    const ref = Math.abs(earthward.y) < 0.9 ? v(0, 1, 0) : v(1, 0, 0);
    let u = vNormalize(vCross(ref, earthward));
    let vAxis = vCross(earthward, u);
    const paa = positionAngleOfAxis * DEG;
    const cosPaa = Math.cos(paa);
    const sinPaa = Math.sin(paa);
    const u2 = vAdd(vScale(u, cosPaa), vScale(vAxis, sinPaa));
    const v2 = vAdd(vScale(u, -sinPaa), vScale(vAxis, cosPaa));
    const wobble = vAdd(vScale(u2, Math.sin(libration.longitude * DEG)), vScale(v2, Math.sin(libration.latitude * DEG)));
    const nearSidePoint = vScale(earthward, MOON_R * 0.85);
    const wobblePoint = vScale(vNormalize(vAdd(earthward, vScale(wobble, 1.5))), MOON_R * 0.95);
    moonFaceLine.path[1] = nearSidePoint;
    moonFaceLine.updatePath();
    moonFaceDot.translate = { ...wobblePoint, z: wobblePoint.z + 0.1 };

    illustration.rotate = { x: rotX, y: rotY, z: 0 };
    illustration.updateRenderGraph();
    // svgElement only exists once a shape has rendered at least once, hence setting this here rather than
    // at construction; idempotent, so doing it every frame is fine. See the earthAnchor comment for the
    // three-tier rationale. radiusLine, obliquityNutationLine, longitudeNutationLine, and atmosphereRayLine
    // are deliberately left alone here: each is itself the "answer" its checkbox reveals, so solid, the
    // default, same as radiusLine's tier; orbitEllipse joins the dotted fixed-reference tier instead, next
    // to the equator/axis/ecliptic-pole lines it's drawn alongside.
    for (const shape of [equatorRing, axisLine, trueEclipticAxis, meanEclipticAxis, orbitEllipse, trueObliquityArc, trueObliquityArcSouth]) {
        shape.svgElement?.setAttribute("stroke-dasharray", "0.1,4");
        shape.svgElement?.setAttribute("stroke-linecap", "round");
    }
    latitudeRing.svgElement?.setAttribute("stroke-dasharray", "3,3");
    meridianRing.svgElement?.setAttribute("stroke-dasharray", "3,3");

    positionLabel(sunLabelEl, sunPos);
    positionLabel(moonLabelEl, moonPos);
    sunLabelEl.textContent = `☉ ${formatKm(sunDistanceKm)}`;
    moonLabelEl.textContent = `☾ ${formatKm(moonDistanceKm)}`;

    // Hit-test the pointer against the bodies directly (screen-space, via projectToScreen), so hovering
    // the scene itself highlights too, not just hovering a table row.
    let sceneDomain = null;
    if (scenePointer) {
        const rect = sceneEl.getBoundingClientRect();
        const local = { x: scenePointer.x - rect.width / 2, y: scenePointer.y - rect.height / 2 };
        const candidates = [
            { domain: "earth", pos: v(0, 0, 0), radius: EARTH_R },
            { domain: "sun", pos: sunPos, radius: SUN_R },
            { domain: "moon", pos: moonPos, radius: MOON_R },
        ];
        let bestDist = Infinity;
        for (const c of candidates) {
            const screen = projectToScreen(c.pos, rotX, rotY, illustration.zoom);
            const dist = Math.hypot(local.x - screen.x, local.y - screen.y);
            if (dist <= c.radius * illustration.zoom * 1.1 && dist < bestDist) {
                sceneDomain = c.domain;
                bestDist = dist;
            }
        }
    }
    if (sceneDomain !== lastDispatchedSceneDomain) {
        lastDispatchedSceneDomain = sceneDomain;
        window.dispatchEvent(new CustomEvent("viz:hover", { detail: sceneDomain }));
    }

    // Whichever source is active drives the highlight; a table-row hover wins if both fire at once, since
    // it carries the more specific name/field for the tooltip text.
    // .diameter alone wouldn't take effect: transform() each frame only re-applies translate/rotate/scale
    // to the already-built pathCommands, it doesn't rebuild them from .diameter, hence updatePath().
    const activeDomain = hovered?.domain ?? sceneDomain;
    sunOutline.diameter = (activeDomain === "sun" ? SUN_R + 4 : SUN_R) * 2;
    sunOutline.updatePath();
    moonOutline.diameter = (activeDomain === "moon" ? MOON_R + 4 : MOON_R) * 2;
    moonOutline.updatePath();
    // A table row carries the specific property + its actual value ("longitudeNutation: (0.0026°) ..."),
    // not just which body it belongs to; scene-hover alone (no row involved) only knows the body, so it
    // falls back to naming that.
    tooltipEl.hidden = !activeDomain;
    if (hovered?.domain === activeDomain) {
        const label = hovered.field ? `${hovered.name}.${hovered.field}` : hovered.name;
        tooltipEl.textContent = `${label}: ${hovered.value}`;
    } else if (activeDomain) {
        tooltipEl.textContent = activeDomain;
    }

    requestAnimationFrame(frame);
}

function positionLabel(el, worldPos) {
    const screen = projectToScreen(worldPos, rotX, rotY, illustration.zoom);
    const rect = sceneEl.getBoundingClientRect();
    el.style.left = `${rect.width / 2 + screen.x}px`;
    el.style.top = `${rect.height / 2 + screen.y}px`;
}

requestAnimationFrame(frame);
