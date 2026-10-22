import * as THREE from "three";
import { batchModel, batchWheel } from "./optimize.js";
const box = new THREE.BoxGeometry(1, 1, 1);
const mat = (c, metalness = 0, roughness = 0.7) =>
  new THREE.MeshStandardMaterial({
    color: c,
    metalness,
    roughness,
    flatShading: true,
  });
import { liveries } from "./data/liveries.js";
export { liveries };

/**
 * Builds a multi-slice lofted 3D prism along Z with octagonal rounded cross-sections.
 * Each slice is [z, width, height, yBottom, topWidthRatio].
 */
function makeLoft(slices, m, xOffset = 0) {
  const ringPts = 8;
  const verts = [];
  const idx = [];
  for (let s = 0; s < slices.length; s++) {
    const [z, w, h, y0, topRatio = 0.78] = slices[s];
    const hw = w / 2;
    const tw = hw * topRatio;
    const ch = Math.min(hw * 0.22, h * 0.24);
    const pts = [
      [-hw + ch, y0],
      [hw - ch, y0],
      [hw, y0 + ch],
      [hw * 0.96, y0 + h - ch],
      [tw, y0 + h],
      [-tw, y0 + h],
      [-hw * 0.96, y0 + h - ch],
      [-hw, y0 + ch],
    ];
    for (const [px, py] of pts) {
      verts.push(px + xOffset, py, z);
    }
    if (s > 0) {
      const a0 = (s - 1) * ringPts;
      const b0 = s * ringPts;
      for (let k = 0; k < ringPts; k++) {
        const k1 = (k + 1) % ringPts;
        idx.push(a0 + k, b0 + k, b0 + k1, a0 + k, b0 + k1, a0 + k1);
      }
    }
  }
  // Cap front and rear ends
  const last = (slices.length - 1) * ringPts;
  for (let k = 1; k < ringPts - 1; k++) {
    idx.push(0, k + 1, k);
    idx.push(last, last + k, last + k + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function makeCar(index = 0, custom = {}) {
  const l = {
      ...liveries[index],
      ...(custom.primary
        ? {
            color: custom.primary,
            accent: custom.secondary,
            number: custom.number,
          }
        : {}),
    },
    g = new THREE.Group();
  g.name = "formula-" + l.number;
  const body = mat(l.color, 0.55, 0.32),
    accent = mat(l.accent, 0.38, 0.36),
    black = mat(custom.detail || "#151a20", 0.18, 0.58),
    rubber = mat("#16191d", 0.06, 0.82),
    rim = mat("#7b8591", 0.78, 0.3),
    helmet = mat("#f3e6c8", 0.32, 0.28);
  helmet.name = "helmet";
  body.name = "body";
  accent.name = "accent";
  black.name = "carbon";

  function cube(name, x, y, z, sx, sy, sz, m, rx = 0, ry = 0, rz = 0) {
    let o = new THREE.Mesh(box, m);
    o.name = name;
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    o.rotation.set(rx, ry, rz);
    o.castShadow = true;
    o.receiveShadow = true;
    g.add(o);
    return o;
  }

  // 1. Carbon Underfloor, Plank, Edge Wings & Venturi Rear Diffuser
  cube("carbon-floor", 0, 0.28, -0.15, 2.08, 0.075, 4.18, black);
  cube("floor-spine", 0, 0.33, -0.2, 0.72, 0.07, 4.35, black);
  for (const side of [-1, 1]) {
    cube("floor-edge-strip", side * 1.03, 0.31, -0.18, 0.06, 0.055, 3.25, accent);
    cube("bargeboard", side * 0.92, 0.45, 0.88, 0.05, 0.3, 0.62, black, 0, side * 0.16, 0);
    // Diffuser strakes at the rear
    cube("diffuser-wall", side * 0.68, 0.38, -2.18, 0.045, 0.24, 0.52, black, 0.18, 0, 0);
    cube("diffuser-strake", side * 0.34, 0.36, -2.18, 0.035, 0.2, 0.48, black, 0.16, 0, 0);
  }
  cube("diffuser-roof", 0, 0.46, -2.16, 1.42, 0.045, 0.52, black, 0.2, 0, 0);

  // 2. Sculpted Multi-Section Monocoque Tub & Tapered Aerodynamic Nosecone
  const wVar = (index % 4) * 0.015;
  const monocoque = makeLoft(
    [
      [-1.75, 0.56 + wVar, 0.46, 0.38, 0.65],
      [-0.85, 0.92 + wVar, 0.62, 0.38, 0.72],
      [-0.05, 0.96 + wVar, 0.66, 0.40, 0.76],
      [0.65, 0.78 + wVar, 0.58, 0.42, 0.78],
      [1.35, 0.54, 0.42, 0.42, 0.75],
      [2.05, 0.36, 0.26, 0.38, 0.72],
      [2.64, 0.20, 0.13, 0.33, 0.68],
    ],
    body,
  );
  monocoque.name = "chassis";
  g.add(monocoque);

  // Livery nose & top accent stripe
  const noseStripe = makeLoft(
    [
      [0.48, 0.34, 0.025, 0.99, 0.85],
      [1.35, 0.26, 0.025, 0.83, 0.85],
      [2.05, 0.19, 0.025, 0.63, 0.85],
      [2.60, 0.11, 0.022, 0.45, 0.85],
    ],
    accent,
  );
  noseStripe.name = "nose-stripe";
  g.add(noseStripe);

  // 3. Sculpted Sidepods with Downwash Ramp, Undercut & Radiator Inlets + Engine Cover
  const podW = 0.58 + (index % 3) * 0.04;
  const podH = 0.54 + (index % 4) * 0.025;
  for (const side of [-1, 1]) {
    const pod = makeLoft(
      [
        [-1.65, 0.24, 0.28, 0.38, 0.62],
        [-1.05, podW * 0.82, podH * 0.86, 0.36, 0.74],
        [-0.35, podW, podH, 0.35, 0.80],
        [0.35, podW * 0.96, podH * 0.98, 0.38, 0.82],
        [0.74, podW * 0.82, podH * 0.86, 0.44, 0.84],
      ],
      body,
      side * 0.68,
    );
    pod.name = "sidepod";
    g.add(pod);

    // Sidepod livery flash & radiator inlet scoop
    cube("sidepod-accent", side * 0.99, 0.63, -0.22, 0.045, 0.18, 1.55, accent, 0, -side * 0.05, 0);
    cube("air-inlet-frame", side * 0.70, 0.73, 0.73, 0.48, 0.27, 0.12, body);
    cube("air-inlet", side * 0.70, 0.73, 0.76, 0.40, 0.20, 0.08, black);
    cube("mirror-stalk", side * 0.58, 0.98, 0.48, 0.22, 0.03, 0.05, black, 0, 0, side * 0.25);
    cube("mirror-housing", side * 0.72, 1.02, 0.46, 0.18, 0.08, 0.12, index % 2 ? accent : body);
  }

  // Sculpted Engine Cover, Roll Hoop Airbox & Dorsal Shark Fin
  const engineCover = makeLoft(
    [
      [-1.95, 0.20, 0.38, 0.58, 0.45],
      [-1.35, 0.44, 0.68 + (index % 3) * 0.02, 0.65, 0.52],
      [-0.70, 0.58, 0.86 + (index % 3) * 0.02, 0.72, 0.58],
      [-0.35, 0.52, 0.72, 0.78, 0.65],
    ],
    body,
  );
  engineCover.name = "engine-cover";
  g.add(engineCover);

  cube("airbox-scoop", 0, 1.62, -0.62, 0.30, 0.24, 0.38, body);
  cube("airbox-intake", 0, 1.64, -0.44, 0.22, 0.17, 0.08, black);
  cube("t-cam-stanchion", 0, 1.78, -0.58, 0.05, 0.12, 0.08, black);
  cube("t-cam-bar", 0, 1.84, -0.58, 0.34, 0.045, 0.07, accent);
  cube(
    "shark-fin",
    0,
    1.54,
    -1.36,
    0.055,
    0.34 + (index % 3) * 0.05,
    1.18,
    index >= 6 ? accent : body,
    0.12,
    0,
    0,
  );
  cube("engine-stripe", 0, 1.56, -1.28, 0.09, 0.07, 1.12, accent, 0.16, 0, 0);
  // Central Rear Exhaust Pipe & Twin Wastegate Pipes
  let exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.36, 10),
    rim,
  );
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(0, 0.68, -2.14);
  g.add(exhaust);
  for (const side of [-1, 1]) {
    let wg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.04, 0.28, 8),
      rim,
    );
    wg.rotation.x = Math.PI / 2;
    wg.position.set(side * 0.12, 0.64, -2.11);
    g.add(wg);
  }
  cube("pitot-tube", 0, 0.72, 1.88, 0.022, 0.09, 0.16, rim);

  // Optional aero package details for higher-tier cars
  if (index >= 6) {
    for (const side of [-1, 1]) {
      cube("canard", side * 0.38, 0.62, 1.82, 0.28, 0.04, 0.28, accent, 0.15, side * 0.22, 0);
      cube("cooling-louvers", side * 0.68, 0.94, -0.62, 0.28, 0.04, 0.68, black);
    }
  }

  // 4. Cockpit Coaming, Driver Torso/Hands/Helmet, Steering Wheel & Sculpted 3D Halo
  cube("cockpit-opening", 0, 0.98, -0.05, 0.62, 0.14, 1.08, black);
  cube("headrest-collar", 0, 1.08, -0.34, 0.58, 0.14, 0.42, body);
  cube("driver-shoulders", 0, 1.01, -0.10, 0.44, 0.16, 0.34, body);
  cube("hans-collar", 0, 1.09, -0.13, 0.28, 0.08, 0.26, black);
  cube("steering-column", 0, 1.04, 0.34, 0.055, 0.055, 0.24, black, -0.22, 0, 0);
  cube("steering-wheel", 0, 1.08, 0.24, 0.28, 0.18, 0.05, black, -0.25, 0, 0);
  cube("steering-leds", 0, 1.15, 0.23, 0.18, 0.03, 0.06, accent, -0.25, 0, 0);
  for (const side of [-1, 1]) {
    cube("driver-arm", side * 0.16, 1.03, 0.08, 0.085, 0.085, 0.30, body, -0.15, -side * 0.16, 0);
    cube("driver-glove", side * 0.13, 1.08, 0.23, 0.068, 0.075, 0.075, accent, -0.25, 0, 0);
  }

  let head = new THREE.Mesh(new THREE.SphereGeometry(0.235, 14, 10), helmet);
  head.position.set(0, 1.2, -0.12);
  head.scale.set(0.95, 1.0, 1.08);
  g.add(head);
  cube("helmet-spoiler", 0, 1.28, -0.28, 0.24, 0.09, 0.16, helmet, -0.2, 0, 0);
  cube("visor", 0, 1.22, 0.075, 0.34, 0.095, 0.16, black, 0.08, 0, 0);
  cube("visor-strip", 0, 1.265, 0.08, 0.33, 0.025, 0.15, accent, 0.08, 0, 0);

  // Sculpted 3D Halo (central V-pillar + curved side hoops + rear mounts)
  cube("halo-pillar", 0, 1.21, 0.48, 0.068, 0.42, 0.11, black, -0.32, 0, 0);
  cube("halo-apex", 0, 1.39, 0.36, 0.24, 0.075, 0.16, black);
  for (const side of [-1, 1]) {
    cube("halo-arm-front", side * 0.22, 1.38, 0.16, 0.075, 0.072, 0.48, black, 0.05, -side * 0.42, 0);
    cube("halo-arm-rear", side * 0.33, 1.33, -0.22, 0.075, 0.075, 0.46, black, 0.18, -side * 0.08, 0);
    cube("halo-fairing", side * 0.28, 1.39, 0.02, 0.082, 0.03, 0.56, body, 0.1, -side * 0.24, 0);
  }

  // 5. Multi-Element Front Wing with Nose Pillars, Flaps & Curved Endplates
  cube("front-wing-main", 0, 0.34, 2.48, 3.12, 0.065, 0.42, black, 0.04, 0, 0);
  cube("front-wing-flap1", 0, 0.40, 2.34, 3.06, 0.05, 0.26, body, -0.14, 0, 0);
  cube("front-wing-flap2", 0, 0.46, 2.22, 2.98, 0.042, 0.20, accent, -0.24, 0, 0);
  cube("front-trim", 0, 0.36, 2.70, 3.10, 0.038, 0.09, accent);
  for (const side of [-1, 1]) {
    cube("nose-pillar", side * 0.14, 0.39, 2.42, 0.045, 0.16, 0.28, black);
    cube("front-endplate", side * 1.56, 0.48, 2.45, 0.065, 0.36, 0.72, body);
    cube("front-endplate-foot", side * 1.59, 0.33, 2.45, 0.14, 0.045, 0.68, black);
    cube("front-diveplane", side * 1.61, 0.52, 2.48, 0.08, 0.04, 0.38, accent, -0.18, 0, 0);
  }

  // 6. Swan-Neck Rear Wing, Beam Wing, DRS Pod & Louvered Endplates
  for (const side of [-1, 1]) {
    cube("rear-swan-pillar", side * 0.09, 1.16, -2.14, 0.045, 0.88, 0.18, black, 0.12, 0, 0);
  }
  cube("rear-beam-wing", 0, 0.74, -2.18, 2.15, 0.055, 0.28, black, 0.14, 0, 0);
  cube(
    "rear-wing",
    0,
    1.52,
    -2.22,
    2.46 + index * 0.03,
    0.095,
    0.46,
    body,
    0.1,
    0,
    0,
  );
  cube(
    "rear-flap",
    0,
    1.66,
    -2.36,
    2.44 + index * 0.03,
    0.06,
    0.26,
    accent,
    0.28,
    0,
    0,
  );
  cube("drs-pod", 0, 1.67, -2.22, 0.12, 0.14, 0.34, black);
  for (const side of [-1, 1]) {
    const epX = side * (1.23 + index * 0.015);
    cube(
      "rear-endplate",
      epX,
      1.38,
      -2.24,
      0.065,
      0.72,
      0.72,
      index % 2 ? accent : black,
    );
    cube("rear-endplate-lower", epX * 0.94, 0.92, -2.20, 0.055, 0.36, 0.52, black);
  }
  cube("rear-light-housing", 0, 0.48, -2.38, 0.16, 0.18, 0.12, black);
  cube("rear-light", 0, 0.48, -2.44, 0.12, 0.14, 0.035, accent);

  // 7. Double-Wishbone Suspension + Pushrods & 18-Inch Sculpted Wheels (Exact Contract: R=0.58, Y=0.59, X=±1.35, Z=-1.64/1.61)
  for (const side of [-1, 1]) {
    for (const z of [-1.64, 1.61]) {
      const isFront = z > 0;
      // Upper and lower carbon A-arms + pushrod
      cube(
        "lower-wishbone-a",
        side * 0.88,
        0.44,
        z - 0.08,
        0.96,
        0.042,
        0.075,
        black,
        0,
        side * 0.18,
        0,
      );
      cube(
        "lower-wishbone-b",
        side * 0.88,
        0.44,
        z + 0.09,
        0.96,
        0.042,
        0.075,
        black,
        0,
        -side * 0.16,
        0,
      );
      cube(
        "upper-wishbone-a",
        side * 0.86,
        0.64,
        z - 0.06,
        0.92,
        0.038,
        0.07,
        black,
        0,
        side * 0.16,
        0,
      );
      cube(
        "upper-wishbone-b",
        side * 0.86,
        0.64,
        z + 0.08,
        0.92,
        0.038,
        0.07,
        black,
        0,
        -side * 0.18,
        0,
      );
      cube(
        "pushrod",
        side * 0.84,
        0.62,
        z + 0.02,
        0.92,
        0.035,
        0.045,
        accent,
        0,
        0,
        -side * 0.34,
      );
      // Carbon brake duct scoop + 18-inch wheel wake deflector winglet
      cube(
        "brake-duct",
        side * 1.02,
        0.59,
        z,
        0.12,
        0.42,
        0.44,
        black,
      );
      cube(
        "wheel-wake-fin",
        side * 1.03,
        0.98,
        z + 0.08,
        0.18,
        0.055,
        0.48,
        black,
        -0.18,
        0,
        -side * 0.24,
      );
      if (isFront) {
        cube(
          "tie-rod",
          side * 0.86,
          0.54,
          z - 0.14,
          0.94,
          0.032,
          0.045,
          rim,
        );
      }

      // Articulated Wheel Group (exact position & outer radius 0.58m)
      let wheel = new THREE.Group();
      wheel.name = "wheel";
      wheel.position.set(side * 1.35, 0.59, z);
      const wWidth = isFront ? 0.58 : 0.64;

      // Main slick tire tread (exact outer radius 0.58m, 14 segments)
      let tread = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.58, wWidth, 14),
        rubber,
      );
      tread.rotation.z = Math.PI / 2;
      tread.castShadow = true;
      wheel.add(tread);

      // Sculpted tire shoulder bevels (radius 0.545m, strictly inside 0.58m)
      let shoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.545, 0.545, wWidth + 0.036, 14),
        rubber,
      );
      shoulder.rotation.z = Math.PI / 2;
      wheel.add(shoulder);

      // Metallic 18-inch rim barrel & outer lip
      let barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, wWidth + 0.048, 12),
        rim,
      );
      barrel.rotation.z = Math.PI / 2;
      wheel.add(barrel);

      // Internal ventilated brake rotor disc & caliper on inner hub face
      let brakeDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.06, 10),
        rim,
      );
      brakeDisc.rotation.z = Math.PI / 2;
      brakeDisc.position.x = -side * (wWidth * 0.32);
      wheel.add(brakeDisc);

      let caliper = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.22, 0.14),
        accent,
      );
      caliper.position.set(-side * (wWidth * 0.32), 0.14, -0.12);
      wheel.add(caliper);

      // Dark aero wheel cover recess
      let cover = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.33, wWidth + 0.056, 10),
        black,
      );
      cover.rotation.z = Math.PI / 2;
      wheel.add(cover);

      // 5-spoke metallic star detail on outer wheel face
      for (let sp = 0; sp < 5; sp++) {
        let spoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.64, 0.065), rim);
        spoke.position.x = side * (wWidth / 2 + 0.026);
        spoke.rotation.x = (sp * Math.PI) / 5;
        wheel.add(spoke);
      }

      // Center-lock wheel nut in team accent colour
      let nut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, wWidth + 0.072, 8),
        accent,
      );
      nut.rotation.z = Math.PI / 2;
      wheel.add(nut);

      // Pirex sidewall compound rings on outer and inner sidewalls (radius 0.46m + 0.02m < 0.58m)
      for (const face of [-1, 1]) {
        let line = new THREE.Mesh(
          new THREE.TorusGeometry(0.46, 0.02, 4, 12),
          accent,
        );
        line.rotation.y = Math.PI / 2;
        line.position.x = face * (wWidth / 2 + 0.02);
        wheel.add(line);
      }

      g.add(wheel);
    }
  }

  // 8. Seven-segment nose number plate
  const segs = {
    0: "ab cdef".replaceAll(" ", ""),
    1: "bc",
    2: "abged",
    3: "abgcd",
    4: "fgbc",
    5: "afgcd",
    6: "afgecd",
    7: "abc",
    8: "abcdefg",
    9: "abfgcd",
  };
  const xy = {
    a: [0, 0.13, 0.14, 0.025],
    g: [0, 0, 0.14, 0.025],
    d: [0, -0.13, 0.14, 0.025],
    f: [-0.08, 0.065, 0.025, 0.11],
    b: [0.08, 0.065, 0.025, 0.11],
    e: [-0.08, -0.065, 0.025, 0.11],
    c: [0.08, -0.065, 0.025, 0.11],
  };
  String(l.number)
    .split("")
    .forEach((n, k, ar) => {
      for (const s of segs[n]) {
        const [x, z, w, h] = xy[s];
        cube(
          "number-" + n,
          x + (k - (ar.length - 1) / 2) * 0.22,
          0.86,
          1.26 - z,
          w,
          0.012,
          h,
          black,
        );
      }
    });

  const wheels = g.children.filter((o) => o.name === "wheel");
  wheels.forEach((o) => g.remove(o));
  const merged = batchModel(g);
  for (const wheel of wheels) {
    merged.add(batchWheel(wheel));
  }
  return merged;
}

export function makeBarrier() {
  let g = new THREE.Group();
  g.name = "concrete-barrier-4m";
  let base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.38, 0.78),
    mat("#9fa6a2"),
  );
  base.position.y = 0.19;
  g.add(base);
  let m = new THREE.Mesh(new THREE.BoxGeometry(4, 0.78, 0.56), mat("#cbd1cd"));
  m.position.y = 0.76;
  g.add(m);
  let stripe = new THREE.Mesh(
    new THREE.BoxGeometry(3.92, 0.24, 0.59),
    mat("#ea2445"),
  );
  stripe.position.y = 0.96;
  g.add(stripe);
  return g;
}

export function makeSegment(curved = false) {
  let g = new THREE.Group();
  let vs = [],
    uv = [],
    ix = [];
  const n = curved ? 40 : 1;
  for (let i = 0; i <= n; i++) {
    const a = ((i / n) * Math.PI) / 2;
    for (let side of [-1, 1]) {
      let x = curved ? Math.sin(a) * (40 + side * 8) : side * 8,
        z = curved ? Math.cos(a) * (40 + side * 8) - 40 : i * 30;
      vs.push(x, 0, z);
      uv.push((side + 1) / 2, (i / n) * 5);
    }
  }
  for (let i = 0; i < n; i++) {
    let a = i * 2;
    ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vs, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(ix);
  geo.computeVertexNormals();
  let m = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: "#44484c",
      side: THREE.DoubleSide,
    }),
  );
  g.add(m);
  return g;
}
