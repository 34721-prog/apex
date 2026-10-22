import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  at,
  samples,
  length,
  TRACK_WIDTH,
  barrierOffset,
  curvature,
  signedCurvature,
  racingLineOffset,
  cornerList,
  activeTrack,
} from "../track.js";
import {
  ROAD_HEIGHT,
  KERB_RISE,
  KERB_WIDTH,
} from "./VehiclePresentation.js";
import {
  pitOuter,
  pitZone,
  signedPitS,
  PIT_ENTRY,
  PIT_EXIT,
} from "../strategy/PitLayout.js";

const THEME_KERBS = {
  forest: ["#d62839", "#f2f4ec"],
  highland: ["#c82333", "#eef2f5"],
  coast: ["#1d70b8", "#f4f6f8"],
  desert: ["#c93b2b", "#f5ebd6"],
  city: ["#e11d48", "#f8fafc"],
  snow: ["#2563eb", "#f1f5f9"],
};

function pushQuad(idx, a, b, c, d) {
  idx.push(a, b, c, a, c, d);
}

function getSharedVertexColorMat(world) {
  if (!world.sharedVertexColorMat) {
    world.sharedVertexColorMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shadowSide: THREE.FrontSide,
    });
  }
  return world.sharedVertexColorMat;
}

export function colouredBox(w, h, d, hex, matrix) {
  const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
  g.deleteAttribute("uv");
  if (matrix) g.applyMatrix4(matrix);
  const c = new THREE.Color(hex);
  const count = g.attributes.position.count;
  const cols = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ny = g.attributes.normal.getY(i);
    const shade = ny > 0.5 ? 1.06 : ny < -0.5 ? 0.78 : 0.94;
    cols[i * 3] = Math.min(1, c.r * shade);
    cols[i * 3 + 1] = Math.min(1, c.g * shade);
    cols[i * 3 + 2] = Math.min(1, c.b * shade);
  }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return g;
}

/**
 * Builds the multi-strip crowned asphalt mesh with vertex-colored rubbered racing
 * line, corner braking marks, and continuous painted white edge lines.
 */
export function buildAsphaltSurface(world) {
  const N = samples.length;
  const stride = 2; // 960 longitudinal segments (~2.5-3.5m each)
  const steps = Math.floor(N / stride);
  const half = TRACK_WIDTH / 2;
  // Keep vertex 0 at -half and vertex 1 at +half so Math.hypot(v0 - v1) equals TRACK_WIDTH
  const latOffsets = [-half, half, -half * 0.52, 0, half * 0.52];
  const stripOrder = [0, 2, 3, 4, 1];
  const K = latOffsets.length;
  const corners = cornerList();

  // Precompute braking intensity per sample index
  const braking = new Float32Array(N);
  const stepS = length / N;
  for (const c of corners) {
    if (c.curvature < 0.0065) continue;
    const brakeLen = c.kind === "hairpin" ? 95 : c.kind === "medium" ? 70 : 45;
    const brakeSteps = Math.round(brakeLen / stepS);
    const entryIdx = Math.round((c.entryS / length) * N) % N;
    for (let k = -brakeSteps; k <= 12; k++) {
      const idx = (entryIdx + k + N) % N;
      const u = k < 0 ? 1 + k / brakeSteps : 1 - k / 14;
      const intensity =
        Math.max(0, Math.sin(Math.max(0, Math.min(1, u)) * Math.PI)) *
        (c.kind === "hairpin" ? 1.0 : c.kind === "medium" ? 0.75 : 0.5);
      if (intensity > braking[idx]) braking[idx] = intensity;
    }
  }

  const verts = [];
  const uvs = [];
  const colors = [];
  const idx = [];

  for (let step = 0; step <= steps; step++) {
    const sIdx = (step * stride) % N;
    const s = (sIdx * length) / N;
    const p = samples[sIdx];
    const next = samples[(sIdx + 1) % N];
    const dir = next.clone().sub(p).normalize();
    const r = new THREE.Vector3(dir.z, 0, -dir.x);
    const lineLat = racingLineOffset(s);
    const brakeAmt = braking[sIdx];
    const macroWave =
      0.96 + 0.035 * Math.sin(s * 0.029) + 0.02 * Math.cos(s * 0.071);

    for (let j = 0; j < K; j++) {
      const lat = latOffsets[j];
      const crown = (1 - (lat / half) ** 2) * 0.01;
      verts.push(p.x + r.x * lat, ROAD_HEIGHT + crown, p.z + r.z * lat);
      uvs.push((lat + half) / 5.6, s / 6.0);

      // Rubbered racing line darkening + tire-track double band in braking zones
      const dLine = Math.abs(lat - lineLat);
      const rubber = Math.exp(-((dLine / 1.65) ** 2));
      const wheelTrack =
        Math.exp(-(((dLine - 0.72) / 0.38) ** 2)) +
        Math.exp(-(((dLine + 0.72) / 0.38) ** 2));
      const darken =
        1.0 -
        0.19 * rubber -
        0.18 * brakeAmt * (0.55 * rubber + 0.45 * Math.min(1, wheelTrack));
      const edgeWear = Math.abs(lat) > half - 0.7 ? 0.94 : 1.0;
      const shade = macroWave * darken * edgeWear;
      colors.push(shade * 0.98, shade * 0.99, shade);
    }

    if (step < steps) {
      const rowA = step * K;
      const rowB = (step + 1) * K;
      for (let j = 0; j < K - 1; j++) {
        const c0 = stripOrder[j];
        const c1 = stripOrder[j + 1];
        idx.push(
          rowA + c0,
          rowB + c0,
          rowA + c1,
          rowA + c1,
          rowB + c0,
          rowB + c1,
        );
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  world.roadMaterial.vertexColors = true;
  world.roadMaterial.needsUpdate = true;
  const roadMesh = new THREE.Mesh(geo, world.roadMaterial);
  roadMesh.receiveShadow = true;
  roadMesh.name = "main-asphalt-surface";
  world.scene.add(roadMesh);

  // Continuous white track-edge lines (with dashed opening at pit entry/exit)
  const lineVerts = [];
  const lineColors = [];
  const lineIdx = [];
  let vCount = 0;
  const lineStride = 3;
  const lineCol = new THREE.Color("#eceee4");
  for (let i = 0; i < N; i += lineStride) {
    const iNext = (i + lineStride) % N;
    const s = (i * length) / N;
    const ps = signedPitS(s);
    const p0 = samples[i];
    const p1 = samples[iNext];
    const next2 = samples[(iNext + lineStride) % N];
    const d0 = p1.clone().sub(p0).normalize();
    const d1 = next2.clone().sub(p1).normalize();
    const r0 = new THREE.Vector3(d0.z, 0, -d0.x);
    const r1 = new THREE.Vector3(d1.z, 0, -d1.x);

    for (const side of [-1, 1]) {
      if (side === 1) {
        const inEntryMerge = ps >= PIT_ENTRY - 5 && ps <= -75;
        const inExitMerge = ps >= 205 && ps <= PIT_EXIT + 5;
        if ((inEntryMerge || inExitMerge) && (i / lineStride) % 2 === 1)
          continue;
      }
      const inOff = side * (half - 0.34);
      const outOff = side * (half - 0.14);
      const y = ROAD_HEIGHT + 0.008;
      lineVerts.push(
        p0.x + r0.x * inOff,
        y,
        p0.z + r0.z * inOff,
        p0.x + r0.x * outOff,
        y,
        p0.z + r0.z * outOff,
        p1.x + r1.x * outOff,
        y,
        p1.z + r1.z * outOff,
        p1.x + r1.x * inOff,
        y,
        p1.z + r1.z * inOff,
      );
      for (let k = 0; k < 4; k++) {
        lineColors.push(lineCol.r, lineCol.g, lineCol.b);
      }
      if (side > 0) {
        pushQuad(lineIdx, vCount, vCount + 2, vCount + 1, vCount + 3);
      } else {
        pushQuad(lineIdx, vCount, vCount + 1, vCount + 2, vCount + 3);
      }
      vCount += 4;
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lineVerts, 3),
  );
  lineGeo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(lineColors, 3),
  );
  lineGeo.setIndex(lineIdx);
  lineGeo.computeVertexNormals();
  const lineMesh = new THREE.Mesh(lineGeo, getSharedVertexColorMat(world));
  lineMesh.receiveShadow = true;
  lineMesh.name = "track-edge-lines";
  world.scene.add(lineMesh);
}

/**
 * Builds 3D-profiled stepped kerbs along corners and chicanes, flush verge curbs
 * on straights (excluding pit entry/exit openings), and yellow sausage kerbs at apexes.
 */
export function buildProfiledKerbs(world) {
  const N = samples.length;
  const half = TRACK_WIDTH / 2;
  const kw = KERB_WIDTH;
  const [colAHex, colBHex] =
    THEME_KERBS[activeTrack.theme] || THEME_KERBS.forest;
  const colA = new THREE.Color(colAHex);
  const colB = new THREE.Color(colBHex);
  const colFlushA = new THREE.Color("#7f8782");
  const colFlushB = new THREE.Color("#68706c");
  const colSausage = new THREE.Color("#eab308");
  const colSausageDark = new THREE.Color("#1e293b");

  // Determine where corner kerbs are active on left (-1) and right (+1)
  const leftActive = new Uint8Array(N);
  const rightActive = new Uint8Array(N);
  const stepS = length / N;
  const leadSamples = Math.round(34 / stepS);
  const tailSamples = Math.round(44 / stepS);

  for (let i = 0; i < N; i++) {
    const k = signedCurvature((i * length) / N);
    const absK = Math.abs(k);
    if (absK > 0.0042) {
      const insideRight = k > 0;
      for (let d = -leadSamples; d <= tailSamples; d++) {
        const idx = (i + d + N) % N;
        if (insideRight) {
          rightActive[idx] = 1;
          if (absK > 0.0055) leftActive[idx] = 1;
        } else {
          leftActive[idx] = 1;
          if (absK > 0.0055) rightActive[idx] = 1;
        }
      }
    }
  }

  // 3-point cross-section per side: inner road edge -> raised top crest -> outer ground edge
  const profOff = [0, 0.22, kw];
  const P = profOff.length;
  const verts = [];
  const colors = [];
  const idx = [];
  let vBase = 0;
  const stride = 2;

  for (const side of [-1, 1]) {
    const activeArr = side < 0 ? leftActive : rightActive;
    for (let i = 0; i < N; i += stride) {
      const iNext = (i + stride) % N;
      const s0 = (i * length) / N;
      const ps = signedPitS(s0);
      if (
        side === 1 &&
        ((ps >= PIT_ENTRY - 8 && ps <= -68) ||
          (ps >= 200 && ps <= PIT_EXIT + 8))
      ) {
        continue;
      }

      const isKerb = activeArr[i] === 1;
      const blockNum = Math.floor(s0 / 2.2);
      const even = blockNum % 2 === 0;
      const c = isKerb ? (even ? colA : colB) : even ? colFlushA : colFlushB;
      const stepLift = isKerb ? (even ? 0.004 : 0) : 0;
      const topY = isKerb
        ? ROAD_HEIGHT + KERB_RISE + stepLift
        : ROAD_HEIGHT + 0.003;
      const profY = [ROAD_HEIGHT + 0.001, topY, 0.095];

      const p0 = samples[i];
      const p1 = samples[iNext];
      const p2 = samples[(iNext + stride) % N];
      const d0 = p1.clone().sub(p0).normalize();
      const d1 = p2.clone().sub(p1).normalize();
      const r0 = new THREE.Vector3(d0.z, 0, -d0.x);
      const r1 = new THREE.Vector3(d1.z, 0, -d1.x);

      for (let row = 0; row < 2; row++) {
        const p = row === 0 ? p0 : p1;
        const r = row === 0 ? r0 : r1;
        for (let k = 0; k < P; k++) {
          const lat = side * (half + profOff[k]);
          verts.push(p.x + r.x * lat, profY[k], p.z + r.z * lat);
          const bevelShade = k === 1 ? 1.04 : 0.88;
          colors.push(
            Math.min(1, c.r * bevelShade),
            Math.min(1, c.g * bevelShade),
            Math.min(1, c.b * bevelShade),
          );
        }
      }

      for (let k = 0; k < P - 1; k++) {
        const a = vBase + k;
        const b = vBase + k + 1;
        const c0 = vBase + P + k;
        const d0Idx = vBase + P + k + 1;
        if (side > 0) {
          idx.push(a, c0, b, b, c0, d0Idx);
        } else {
          idx.push(a, b, c0, b, d0Idx, c0);
        }
      }
      vBase += P * 2;
    }
  }

  const kerbGeo = new THREE.BufferGeometry();
  kerbGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  kerbGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  kerbGeo.setIndex(idx);
  kerbGeo.computeVertexNormals();

  const kerbMesh = new THREE.Mesh(kerbGeo, getSharedVertexColorMat(world));
  kerbMesh.receiveShadow = true;
  kerbMesh.name = "profiled-3d-kerbs";
  world.scene.add(kerbMesh);

  // Add raised yellow sausage kerbs at tight corner apexes (except pure city tracks)
  if (activeTrack.theme !== "city") {
    const sausageParts = [];
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3(1, 1, 1);
    const euler = new THREE.Euler();

    for (const c of cornerList()) {
      if (c.curvature < 0.0095) continue;
      const side = c.direction;
      if (side === 1 && pitZone(c.s)) continue;
      for (let k = -2; k <= 2; k++) {
        const s = c.s + k * 2.1;
        const t = at(s);
        const lat = side * (half + kw + 0.28);
        pos.set(
          t.p.x + t.right.x * lat,
          0.095 + 0.042,
          t.p.z + t.right.z * lat,
        );
        euler.set(0, t.heading, 0);
        quat.setFromEuler(euler);
        m.compose(pos, quat, scl);
        sausageParts.push(
          colouredBox(
            0.36,
            0.085,
            1.45,
            k % 2 === 0 ? colSausage : colSausageDark,
            m,
          ),
        );
      }
    }
    if (sausageParts.length > 0) {
      const sGeo = mergeGeometries(sausageParts, false);
      sausageParts.forEach((g) => g.dispose());
      const sMesh = new THREE.Mesh(sGeo, getSharedVertexColorMat(world));
      sMesh.receiveShadow = true;
      sMesh.name = "sausage-kerbs";
      world.scene.add(sMesh);
    }
  }
}

/**
 * Builds the 2 mandatory #898d81 shoulder ribbons plus contextual runoff areas
 * (gravel traps with arrestor ripples, striped asphalt runoffs, and astroturf/verge).
 */
export function buildRunoffAreas(world) {
  const N = samples.length;
  const half = TRACK_WIDTH / 2;

  // Preserve exact 2 shoulder meshes with material color #898d81 (checked by tests/environment.spec.js)
  const shoulderMaterial = new THREE.MeshLambertMaterial({
    color: "#898d81",
    side: THREE.DoubleSide,
  });
  for (const [inner, outer] of [
    [-half - 3.5, -half],
    [half, half + 3.5],
  ]) {
    const sh = world.ribbon(inner, outer, shoulderMaterial);
    sh.position.y = -0.025;
    sh.name = "track-shoulder";
  }

  // Contextual outer runoff strips from ±(half + 3.5) out to the barrier (±15.3m)
  const corners = cornerList();
  const stepS = length / N;
  const leftKind = new Uint8Array(N);
  const rightKind = new Uint8Array(N);

  for (const c of corners) {
    const outsideRight = c.direction < 0;
    const target = outsideRight ? rightKind : leftKind;
    const entryIdx = Math.round((c.entryS / length) * N) % N;
    const exitIdx = Math.round((c.exitS / length) * N) % N;
    const span = (exitIdx - entryIdx + N) % N;
    const pre = Math.round(28 / stepS);
    const post = Math.round(38 / stepS);
    const usePaved = activeTrack.theme === "city" || c.number % 3 === 0;
    for (let k = -pre; k <= span + post; k++) {
      const idx = (entryIdx + k + N) % N;
      target[idx] = usePaved ? 2 : 1;
    }
  }

  const gravelColA = new THREE.Color(
    activeTrack.theme === "snow" ? "#cbd5e1" : "#d4be94",
  );
  const gravelColB = new THREE.Color(
    activeTrack.theme === "snow" ? "#94a3b8" : "#b89f72",
  );
  const pavedBase = new THREE.Color("#475569");
  const pavedStripeA = new THREE.Color(
    THEME_KERBS[activeTrack.theme]?.[0] || "#d62839",
  );
  const pavedStripeB = new THREE.Color("#e2e8f0");
  const vergeCol = new THREE.Color(activeTrack.grass).multiplyScalar(0.92);

  const verts = [];
  const colors = [];
  const uvs = [];
  const idx = [];
  let vBase = 0;
  const stride = 3;

  for (const side of [-1, 1]) {
    const kindArr = side < 0 ? leftKind : rightKind;
    for (let i = 0; i < N; i += stride) {
      const iNext = (i + stride) % N;
      const s0 = (i * length) / N;
      const s1 = (iNext * length) / N;
      if (side === 1 && pitZone(s0)) continue;

      const kind = kindArr[i];
      const innerOff = side * (half + 3.45);
      const outerOff = side * (barrierOffset() + 0.25);
      const midOff = (innerOff + outerOff) * 0.5;

      const p0 = samples[i];
      const p1 = samples[iNext];
      const p2 = samples[(iNext + stride) % N];
      const d0 = p1.clone().sub(p0).normalize();
      const d1 = p2.clone().sub(p1).normalize();
      const r0 = new THREE.Vector3(d0.z, 0, -d0.x);
      const r1 = new THREE.Vector3(d1.z, 0, -d1.x);

      let cInner, cMid, cOuter;
      if (kind === 1) {
        const furrow = (i / stride) % 2 === 0 ? gravelColA : gravelColB;
        cInner = furrow;
        cMid = furrow;
        cOuter = vergeCol;
      } else if (kind === 2) {
        const band = Math.floor(s0 / 3.8) % 3;
        cInner = pavedBase;
        cMid = band === 0 ? pavedStripeA : band === 1 ? pavedStripeB : pavedBase;
        cOuter = pavedBase;
      } else {
        const shade = 0.94 + 0.06 * Math.sin(s0 * 0.04 + side);
        cInner = vergeCol.clone().multiplyScalar(shade);
        cMid = cInner;
        cOuter = vergeCol.clone().multiplyScalar(shade * 0.94);
      }

      const offs = [innerOff, midOff, outerOff];
      const ys = [0.092, kind === 1 ? 0.065 : 0.055, -0.04];
      const cols = [cInner, cMid, cOuter];

      for (let row = 0; row < 2; row++) {
        const p = row === 0 ? p0 : p1;
        const r = row === 0 ? r0 : r1;
        const s = row === 0 ? s0 : s1;
        for (let k = 0; k < 3; k++) {
          verts.push(p.x + r.x * offs[k], ys[k], p.z + r.z * offs[k]);
          uvs.push(k * 0.5, s / 8);
          colors.push(cols[k].r, cols[k].g, cols[k].b);
        }
      }

      for (let k = 0; k < 2; k++) {
        const a = vBase + k;
        const b = vBase + k + 1;
        const c0 = vBase + 3 + k;
        const d0Idx = vBase + 3 + k + 1;
        if (side > 0) {
          idx.push(a, c0, b, b, c0, d0Idx);
        } else {
          idx.push(a, b, c0, b, d0Idx, c0);
        }
      }
      vBase += 6;
    }
  }

  const runoffGeo = new THREE.BufferGeometry();
  runoffGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  runoffGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  runoffGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  runoffGeo.setIndex(idx);
  runoffGeo.computeVertexNormals();

  const runoffMat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    map: world.texture("dirt", 24, 24),
    side: THREE.DoubleSide,
  });
  const runoffMesh = new THREE.Mesh(runoffGeo, runoffMat);
  runoffMesh.receiveShadow = true;
  runoffMesh.name = "contextual-runoff-zones";
  world.scene.add(runoffMesh);
}

/**
 * Builds continuous 3D Concrete Jersey Barriers / Armco Guardrails, continuous
 * corner-outside Tire & TecPro barriers, curved debris catch fences with posts,
 * and trackside Marshal Posts.
 */
export function buildSafetyBarriers(world) {
  const N = samples.length;
  const [accentHex] = THEME_KERBS[activeTrack.theme] || THEME_KERBS.forest;
  const concreteLow = new THREE.Color("#b8bdb8");
  const concreteHigh = new THREE.Color("#d4d8d2");
  const stripeAccent = new THREE.Color(accentHex);
  const stripeWhite = new THREE.Color("#f1f5f9");
  const armcoSteel = new THREE.Color("#9fa8b2");

  const wallVerts = [];
  const wallColors = [];
  const wallIdx = [];
  let wBase = 0;

  const stride = 6;
  for (const side of [-1, 1]) {
    for (let i = 0; i < N; i += stride) {
      const iNext = (i + stride) % N;
      const s0 = (i * length) / N;
      const s1 = (iNext * length) / N;
      const inPit0 = side === 1 && pitZone(s0);
      const inPit1 = side === 1 && pitZone(s1);
      const off0 = inPit0 ? pitOuter(s0) : barrierOffset();
      const off1 = inPit1 ? pitOuter(s1) : barrierOffset();

      const p0 = samples[i];
      const p1 = samples[iNext];
      const p2 = samples[(iNext + stride) % N];
      const d0 = p1.clone().sub(p0).normalize();
      const d1 = p2.clone().sub(p1).normalize();
      const r0 = new THREE.Vector3(d0.z, 0, -d0.x);
      const r1 = new THREE.Vector3(d1.z, 0, -d1.x);

      const isMainOrCity =
        activeTrack.theme === "city" ||
        Math.abs(signedPitS(s0)) < 280 ||
        curvature(s0) > 0.0065;
      const topCol = isMainOrCity
        ? Math.floor(s0 / 8) % 2 === 0
          ? stripeAccent
          : stripeWhite
        : armcoSteel;
      const bodyCol = isMainOrCity ? concreteHigh : armcoSteel;

      const profLat = [0, 0.06, 0.08, 0.42];
      const profY = [-0.05, 0.82, 1.06, -0.05];
      const profCol = [concreteLow, bodyCol, topCol, concreteLow];

      for (let row = 0; row < 2; row++) {
        const p = row === 0 ? p0 : p1;
        const r = row === 0 ? r0 : r1;
        const baseOff = row === 0 ? off0 : off1;
        for (let k = 0; k < 4; k++) {
          const lat = side * (baseOff + profLat[k]);
          wallVerts.push(p.x + r.x * lat, profY[k], p.z + r.z * lat);
          wallColors.push(profCol[k].r, profCol[k].g, profCol[k].b);
        }
      }

      for (let k = 0; k < 3; k++) {
        const a = wBase + k;
        const b = wBase + k + 1;
        const c0 = wBase + 4 + k;
        const d0Idx = wBase + 4 + k + 1;
        if (side > 0) {
          wallIdx.push(a, c0, b, b, c0, d0Idx);
        } else {
          wallIdx.push(a, b, c0, b, d0Idx, c0);
        }
      }
      wBase += 8;
    }
  }

  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(wallVerts, 3),
  );
  wallGeo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(wallColors, 3),
  );
  wallGeo.setIndex(wallIdx);
  wallGeo.computeVertexNormals();

  const wallMesh = new THREE.Mesh(wallGeo, getSharedVertexColorMat(world));
  wallMesh.receiveShadow = true;
  wallMesh.name = "continuous-safety-walls";
  world.scene.add(wallMesh);

  // Curved Debris Catch Fences + Steel Support Posts along main straight, venues, and corners
  const fenceVerts = [];
  const fenceColors = [];
  const fenceIdx = [];
  const postMatrices = [];
  let fBase = 0;
  const dummy = new THREE.Object3D();
  const fenceWire = new THREE.Color("#64748b");
  const fenceTop = new THREE.Color("#475569");
  const fStride = 12;

  for (const side of [-1, 1]) {
    for (let i = 0; i < N; i += fStride) {
      const s0 = (i * length) / N;
      const inPit = side === 1 && pitZone(s0);
      if (inPit) continue;

      const isStraightNearStart = Math.abs(signedPitS(s0)) < 320;
      const isCornerOutside =
        Math.abs(signedCurvature(s0)) > 0.0045 &&
        Math.sign(signedCurvature(s0)) === -side;
      if (
        !isStraightNearStart &&
        !isCornerOutside &&
        activeTrack.theme !== "city"
      )
        continue;

      const off = barrierOffset() + 0.28;
      const p0 = samples[i];
      const p1 = samples[(i + fStride) % N];
      const p2 = samples[(i + fStride * 2) % N];
      const d0 = p1.clone().sub(p0).normalize();
      const d1 = p2.clone().sub(p1).normalize();
      const r0 = new THREE.Vector3(d0.z, 0, -d0.x);
      const r1 = new THREE.Vector3(d1.z, 0, -d1.x);

      const fLat = [0, 0, -0.42];
      const fY = [1.04, 3.35, 3.75];
      const fCol = [fenceWire, fenceWire, fenceTop];

      for (let row = 0; row < 2; row++) {
        const p = row === 0 ? p0 : p1;
        const r = row === 0 ? r0 : r1;
        for (let k = 0; k < 3; k++) {
          const lat = side * (off + fLat[k]);
          fenceVerts.push(p.x + r.x * lat, fY[k], p.z + r.z * lat);
          fenceColors.push(fCol[k].r, fCol[k].g, fCol[k].b);
        }
      }

      for (let k = 0; k < 2; k++) {
        const a = fBase + k;
        const b = fBase + k + 1;
        const c0 = fBase + 3 + k;
        const d0Idx = fBase + 3 + k + 1;
        fenceIdx.push(a, c0, b, b, c0, d0Idx);
      }
      fBase += 6;

      dummy.position.set(
        p0.x + r0.x * side * (off + 0.06),
        2.2,
        p0.z + r0.z * side * (off + 0.06),
      );
      dummy.rotation.set(0, Math.atan2(d0.x, d0.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      postMatrices.push(dummy.matrix.clone());
    }
  }

  if (fenceVerts.length > 0) {
    const fenceGeo = new THREE.BufferGeometry();
    fenceGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(fenceVerts, 3),
    );
    fenceGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(fenceColors, 3),
    );
    fenceGeo.setIndex(fenceIdx);
    fenceGeo.computeVertexNormals();
    const fenceMat = new THREE.MeshLambertMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fenceMesh = new THREE.Mesh(fenceGeo, fenceMat);
    fenceMesh.name = "debris-catch-fences";
    world.scene.add(fenceMesh);

    const postGeo = new THREE.BoxGeometry(0.11, 2.5, 0.11);
    const postMat = new THREE.MeshLambertMaterial({ color: "#475569" });
    const postInst = new THREE.InstancedMesh(
      postGeo,
      postMat,
      postMatrices.length,
    );
    postMatrices.forEach((m, idx) => postInst.setMatrixAt(idx, m));
    postInst.instanceMatrix.needsUpdate = true;
    postInst.name = "catch-fence-posts";
    world.scene.add(postInst);
  }

  // Continuous Corner-Outside Tire / TecPro Barriers
  const tirePoints = [];
  for (const c of cornerList()) {
    const outsideSide = -c.direction;
    const startS = c.entryS - 20;
    const endS = c.exitS + 24;
    const span = (((endS - startS) % length) + length) % length;
    const blockLen = 3.8;
    const nBlocks = Math.max(4, Math.round(span / blockLen));
    for (let b = 0; b < nBlocks; b++) {
      const s = (startS + b * blockLen + length) % length;
      if (outsideSide === 1 && pitZone(s)) continue;
      if (Math.abs(signedPitS(s)) < 55) continue;
      const a = at(s);
      const off = barrierOffset() - 0.36;
      tirePoints.push({
        x: a.p.x + a.right.x * outsideSide * off,
        z: a.p.z + a.right.z * outsideSide * off,
        heading: a.heading + Math.PI / 2,
        red: b % 2 === 0,
      });
    }
  }

  if (tirePoints.length > 0) {
    const tireGeo = new THREE.BoxGeometry(3.85, 0.94, 0.78);
    const tireMat = new THREE.MeshLambertMaterial({ color: "#ffffff" });
    const tireWall = new THREE.InstancedMesh(
      tireGeo,
      tireMat,
      tirePoints.length,
    );
    const redCol = new THREE.Color(accentHex);
    const whiteCol = new THREE.Color("#f1f5f9");
    for (let idx = 0; idx < tirePoints.length; idx++) {
      const tp = tirePoints[idx];
      dummy.position.set(tp.x, 0.47, tp.z);
      dummy.rotation.set(0, tp.heading, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      tireWall.setMatrixAt(idx, dummy.matrix);
      tireWall.setColorAt(idx, tp.red ? redCol : whiteCol);
    }
    tireWall.instanceMatrix.needsUpdate = true;
    if (tireWall.instanceColor) tireWall.instanceColor.needsUpdate = true;
    tireWall.receiveShadow = true;
    tireWall.name = "corner-tecpro-tire-barriers";
    world.scene.add(tireWall);
  }

  // Trackside Marshal Posts & Flag Stations every ~380m
  const marshalParts = [];
  const mCount = Math.max(6, Math.floor(length / 380));
  const mMat = new THREE.Matrix4();
  const mPos = new THREE.Vector3();
  const mQuat = new THREE.Quaternion();
  const mScl = new THREE.Vector3(1, 1, 1);
  const mEuler = new THREE.Euler();

  const addLocalBox = (pose, rOff, fOff, y, w, h, d, hex) => {
    mPos.set(
      pose.p.x + pose.right.x * rOff + pose.dir.x * fOff,
      y,
      pose.p.z + pose.right.z * rOff + pose.dir.z * fOff,
    );
    mEuler.set(0, pose.heading, 0);
    mQuat.setFromEuler(mEuler);
    mMat.compose(mPos, mQuat, mScl);
    marshalParts.push(colouredBox(w, h, d, hex, mMat));
  };

  for (let i = 0; i < mCount; i++) {
    const s = ((i + 0.45) * length) / mCount;
    const side = i % 2 === 0 ? -1 : 1;
    if (side === 1 && pitZone(s)) continue;
    const pose = at(s);
    const baseLat = side * (barrierOffset() + 2.8);
    addLocalBox(pose, baseLat, 0, 1.1, 2.4, 2.2, 2.4, "#f1f5f9");
    addLocalBox(pose, baseLat, 0, 1.15, 2.46, 0.45, 2.46, "#f97316");
    addLocalBox(pose, baseLat, 0, 2.3, 2.8, 0.18, 2.8, "#1e293b");
    addLocalBox(
      pose,
      baseLat - side * 1.4,
      1.6,
      0.85,
      0.48,
      1.5,
      0.38,
      "#ff6b00",
    );
    addLocalBox(
      pose,
      baseLat - side * 1.4,
      1.6,
      1.72,
      0.32,
      0.32,
      0.32,
      "#fde047",
    );
  }
  if (marshalParts.length > 0) {
    const mGeo = mergeGeometries(marshalParts, false);
    marshalParts.forEach((g) => g.dispose());
    const mMesh = new THREE.Mesh(mGeo, getSharedVertexColorMat(world));
    mMesh.castShadow = false;
    mMesh.receiveShadow = true;
    mMesh.name = "trackside-marshal-posts";
    world.scene.add(mMesh);
  }
}

/**
 * Builds the 3D Space-Frame Start/Finish Gantry, F1 5-Light Pod Array (preserving
 * world.lights for countdown), and Braking Distance Boards (150m/100m/50m).
 */
export function buildGantryAndSignage(world) {
  const start = at(0);
  world.gantry = new THREE.Group();
  world.gantry.name = "start-finish-gantry";
  world.gantry.position.copy(start.p);
  world.gantry.rotation.y = start.heading;

  const trussParts = [];
  const mat4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3(1, 1, 1);
  const euler = new THREE.Euler();

  const pushBox = (x, y, z, w, h, d, hex, rx = 0, ry = 0, rz = 0) => {
    pos.set(x, y, z);
    euler.set(rx, ry, rz);
    quat.setFromEuler(euler);
    mat4.compose(pos, quat, scl);
    trussParts.push(colouredBox(w, h, d, hex, mat4));
  };

  const spanHalf = TRACK_WIDTH / 2 + 3.2;
  const H = 8.6;
  for (const side of [-1, 1]) {
    const cx = side * spanHalf;
    pushBox(cx, 0.55, 0, 1.35, 1.1, 1.45, "#94a3b8");
    pushBox(cx, 0.95, 0, 1.4, 0.25, 1.5, "#dc2626");
    for (const dx of [-0.42, 0.42]) {
      for (const dz of [-0.45, 0.45]) {
        pushBox(cx + dx, H / 2 + 0.4, dz, 0.16, H, 0.16, "#1e293b");
      }
    }
    for (let y = 1.6; y < H; y += 1.4) {
      pushBox(cx, y, -0.45, 0.95, 0.1, 0.1, "#475569");
      pushBox(cx, y, 0.45, 0.95, 0.1, 0.1, "#475569");
      pushBox(cx - 0.42, y, 0, 0.1, 0.1, 0.98, "#475569");
      pushBox(cx + 0.42, y, 0, 0.1, 0.1, 0.98, "#475569");
    }
  }

  const fullSpan = spanHalf * 2 + 1.4;
  pushBox(0, H + 0.2, 0, fullSpan, 1.85, 1.1, "#0f172a");
  for (const dy of [H - 0.8, H + 1.2]) {
    for (const dz of [-0.62, 0.62]) {
      pushBox(0, dy, dz, fullSpan + 0.4, 0.14, 0.14, "#cbd5e1");
    }
  }
  for (let x = -spanHalf; x <= spanHalf; x += 2.2) {
    pushBox(x, H + 0.2, -0.62, 0.1, 2.0, 0.1, "#64748b");
    pushBox(x, H + 0.2, 0.62, 0.1, 2.0, 0.1, "#64748b");
  }

  // Suspended 5-column FIA F1 start-light panel with individual pods & sun-visor hoods
  pushBox(0, 6.32, -0.52, 7.05, 1.58, 0.38, "#0b0f17");
  pushBox(0, 7.18, -0.52, 7.15, 0.12, 0.46, "#1e293b");
  pushBox(0, 5.48, -0.52, 7.15, 0.1, 0.44, "#1e293b");
  for (const sx of [-2.8, -1.4, 0, 1.4, 2.8]) {
    pushBox(sx, 7.55, -0.45, 0.12, 0.72, 0.14, "#475569");
  }
  for (let i = 0; i < 5; i++) {
    const lx = (i - 2) * 1.25;
    // Individual module housing & metallic bezel frame
    pushBox(lx, 6.32, -0.68, 0.82, 1.44, 0.24, "#111827");
    pushBox(lx, 6.32, -0.78, 0.72, 1.34, 0.08, "#1e293b");
    // Upper sun visor hood (above upper launch lamp)
    pushBox(lx, 6.88, -0.88, 0.56, 0.06, 0.24, "#090d14", 0.18, 0, 0);
    // Lower sun visor hood (above primary red countdown lamp)
    pushBox(lx, 6.36, -0.88, 0.56, 0.06, 0.26, "#090d14", 0.18, 0, 0);
    // Lamp socket bezels
    pushBox(lx, 6.64, -0.81, 0.44, 0.38, 0.06, "#090d14");
    pushBox(lx, 6.04, -0.81, 0.48, 0.44, 0.06, "#090d14");
  }

  const gantryGeo = mergeGeometries(trussParts, false);
  trussParts.forEach((g) => g.dispose());
  const gantryMesh = new THREE.Mesh(gantryGeo, getSharedVertexColorMat(world));
  gantryMesh.castShadow = true;
  gantryMesh.receiveShadow = true;
  world.gantry.add(gantryMesh);

  // Double-sided Championship Banner on the Gantry
  const gantrySign = world.sign(
    "APEX DYNASTY · GRAND PRIX",
    1024,
    128,
    "#f8fafc",
    "#0f172a",
  );
  const bannerMat = new THREE.MeshBasicMaterial({
    map: gantrySign,
    side: THREE.DoubleSide,
  });
  for (const [zOff, rotY] of [
    [-0.64, Math.PI],
    [0.64, 0],
  ]) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(17.5, 1.65),
      bannerMat,
    );
    panel.position.set(0, H + 0.2, zOff);
    panel.rotation.y = rotY;
    world.gantry.add(panel);
  }

  // 5 Dynamic Start Light Spheres (exact contract for world.lights) + Glow Halos + Green Launch Lights
  world.lights = [];
  world.lightHalos = [];
  world.launchLights = [];
  const redGeo = new THREE.SphereGeometry(0.24, 14, 10);
  const haloGeo = new THREE.RingGeometry(0.22, 0.34, 16);
  const greenGeo = new THREE.SphereGeometry(0.18, 12, 8);
  for (let i = 0; i < 5; i++) {
    const lx = (i - 2) * 1.25;
    const m = new THREE.Mesh(
      redGeo,
      new THREE.MeshBasicMaterial({ color: "#32121b" }),
    );
    m.position.set(lx, 6.04, -0.83);
    world.gantry.add(m);
    world.lights.push(m);

    const halo = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ color: "#ff2a4b" }),
    );
    halo.position.set(lx, 6.04, -0.86);
    halo.visible = false;
    world.gantry.add(halo);
    world.lightHalos.push(halo);

    const launch = new THREE.Mesh(
      greenGeo,
      new THREE.MeshBasicMaterial({ color: "#0f291e" }),
    );
    launch.position.set(lx, 6.64, -0.83);
    world.gantry.add(launch);
    world.launchLights.push(launch);
  }
  world.scene.add(world.gantry);

  // Braking Distance Markers (150m / 100m / 50m) using world.sign so textures are cached
  const brakeSpecs = [
    [150, "#f8fafc", "#0f172a"],
    [100, "#f8fafc", "#0f172a"],
    [50, "#fef08a", "#991b1b"],
  ];
  const brakeMats = brakeSpecs.map(
    ([dist, fg, bg]) =>
      new THREE.MeshBasicMaterial({
        map: world.sign(`${dist} m`, 256, 128, fg, bg),
        side: THREE.DoubleSide,
      }),
  );
  const brakeGeo = new THREE.PlaneGeometry(2.1, 1.35);
  const postParts = [];

  for (const c of cornerList()) {
    if (c.curvature < 0.0068) continue;
    const outsideSide = -c.direction;
    for (let idx = 0; idx < 3; idx++) {
      const [dist] = brakeSpecs[idx];
      const s = (c.entryS - dist + length) % length;
      if (outsideSide === 1 && pitZone(s)) continue;
      if (curvature(s) > 0.011) continue;
      const a = at(s);
      const lat = outsideSide * (TRACK_WIDTH / 2 + KERB_WIDTH + 2.3);
      const bx = a.p.x + a.right.x * lat;
      const bz = a.p.z + a.right.z * lat;

      const board = new THREE.Mesh(brakeGeo, brakeMats[idx]);
      board.position.set(bx, 1.55, bz);
      board.rotation.y = a.heading + Math.PI;
      world.scene.add(board);

      pos.set(bx + a.dir.x * 0.08, 0.72, bz + a.dir.z * 0.08);
      euler.set(0, a.heading, 0);
      quat.setFromEuler(euler);
      mat4.compose(pos, quat, scl);
      postParts.push(colouredBox(0.14, 1.44, 0.14, "#334155", mat4));
    }
  }

  if (postParts.length > 0) {
    const pGeo = mergeGeometries(postParts, false);
    postParts.forEach((g) => g.dispose());
    const pMesh = new THREE.Mesh(pGeo, getSharedVertexColorMat(world));
    pMesh.name = "braking-marker-posts";
    world.scene.add(pMesh);
  }
}

/**
 * Builds 2 overhead sponsor bridges across straights and TV camera towers at corners.
 */
export function buildBridgesAndTowers(world) {
  const parts = [];
  const mat4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3(1, 1, 1);
  const euler = new THREE.Euler();

  const addOrientedBox = (pose, rOff, fOff, y, w, h, d, hex) => {
    pos.set(
      pose.p.x + pose.right.x * rOff + pose.dir.x * fOff,
      y,
      pose.p.z + pose.right.z * rOff + pose.dir.z * fOff,
    );
    euler.set(0, pose.heading, 0);
    quat.setFromEuler(euler);
    mat4.compose(pos, quat, scl);
    parts.push(colouredBox(w, h, d, hex, mat4));
  };

  const bridgeTargets = [0.37, 0.71];
  const bridgeBannerSpecs = [
    ["PIREX MOTORSPORT · ZERO DEGRADATION", "#fef2f2", "#991b1b"],
    ["AETHER AI · OFFICIAL TELEMETRY PARTNER", "#e0f2fe", "#0c4a6e"],
  ];

  bridgeTargets.forEach((frac, bIdx) => {
    let s = frac * length;
    for (let step = 0; step < 30; step++) {
      if (
        curvature(s) < 0.0055 &&
        !pitZone(s) &&
        !world.venues?.contains(at(s).p.x, at(s).p.z, 28)
      )
        break;
      s = (s + 22) % length;
    }
    if (pitZone(s)) return;
    const pose = at(s);
    const spanLat = barrierOffset() + 2.4;
    const H = 6.6;

    for (const side of [-1, 1]) {
      const lat = side * (spanLat + 1.8);
      addOrientedBox(pose, lat, 0, H / 2 + 0.8, 3.2, H + 1.6, 3.4, "#334155");
      addOrientedBox(pose, lat, 0, H + 1.75, 3.6, 0.35, 3.8, "#dc2626");
      addOrientedBox(
        pose,
        lat + side * 2.1,
        0,
        H * 0.45,
        1.4,
        H * 0.9,
        2.6,
        "#64748b",
      );
    }
    addOrientedBox(
      pose,
      0,
      0,
      H + 0.6,
      spanLat * 2 + 3.6,
      1.65,
      2.8,
      "#0f172a",
    );
    addOrientedBox(
      pose,
      0,
      0,
      H + 1.55,
      spanLat * 2 + 4.0,
      0.22,
      3.1,
      "#cbd5e1",
    );

    const [text, fg, bg] = bridgeBannerSpecs[bIdx % bridgeBannerSpecs.length];
    const bMat = new THREE.MeshBasicMaterial({
      map: world.sign(text, 1024, 128, fg, bg),
      side: THREE.DoubleSide,
    });
    for (const fSign of [-1, 1]) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(spanLat * 1.65, 1.45),
        bMat,
      );
      panel.position.set(
        pose.p.x + pose.dir.x * fSign * 1.48,
        H + 0.6,
        pose.p.z + pose.dir.z * fSign * 1.48,
      );
      panel.rotation.y = pose.heading + (fSign < 0 ? Math.PI : 0);
      world.scene.add(panel);
    }
  });

  // TV Camera Towers & Floodlight Pylons at key corners
  for (const c of cornerList().slice(0, 6)) {
    const side = -c.direction;
    if (side === 1 && pitZone(c.s)) continue;
    const pose = at(c.s + 14);
    const lat = side * (barrierOffset() + 5.8);
    if (
      world.venues?.contains(
        pose.p.x + pose.right.x * lat,
        pose.p.z + pose.right.z * lat,
        10,
      )
    )
      continue;
    addOrientedBox(pose, lat, 0, 5.5, 1.4, 11.0, 1.4, "#475569");
    addOrientedBox(pose, lat, 0, 11.2, 2.6, 0.35, 2.6, "#1e293b");
    addOrientedBox(pose, lat, 0, 11.9, 2.4, 1.0, 2.4, "#cbd5e1");
    addOrientedBox(pose, lat - side * 0.4, 0, 12.1, 0.9, 0.7, 0.9, "#0f172a");
  }

  if (parts.length > 0) {
    const bGeo = mergeGeometries(parts, false);
    parts.forEach((g) => g.dispose());
    const bMesh = new THREE.Mesh(bGeo, getSharedVertexColorMat(world));
    bMesh.castShadow = false;
    bMesh.receiveShadow = true;
    bMesh.name = "overhead-bridges-and-tv-towers";
    world.scene.add(bMesh);
  }
}
