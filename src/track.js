import * as THREE from "three";
import { trackCatalog, trackById } from "./data/tracks.js";
export let TRACK_WIDTH = 18;
export const barrierOffset = () => TRACK_WIDTH / 2 + 6.3;
export let activeTrack = trackCatalog[0];
const N = 1920;
export let curve, samples, length;
let cachedBounds, tangents, maxSampleStep = 4;

const trackCache = new Map();

// Ring buffer of reusable pose objects so hot simulation paths allocate zero Vector3s
const POSE_POOL_SIZE = 32;
const posePool = Array.from({ length: POSE_POOL_SIZE }, () => ({
  p: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  right: new THREE.Vector3(),
  heading: 0,
}));
let poseCursor = 0;

export function configureTrack(id = "aurora") {
  activeTrack = typeof id === "string" ? trackById(id) : id;
  TRACK_WIDTH = activeTrack.width || 18;
  const cacheKey = `${activeTrack.id}:${TRACK_WIDTH}:${activeTrack.points.length}:${activeTrack.points[0]?.[0]}`;
  let entry = trackCache.get(cacheKey);
  if (!entry) {
    const c = new THREE.CatmullRomCurve3(
      activeTrack.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      true,
      "catmullrom",
      0.32,
    );
    c.arcLengthDivisions = 4000;
    c.updateArcLengths();
    const len = c.getLength();
    const sArr = new Array(N);
    const tArr = new Array(N);
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const t = c.getUtoTmapping(u);
      const p = c.getPoint(t);
      const tan = c.getTangent(t).normalize();
      sArr[i] = p;
      tArr[i] = tan;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    entry = {
      curve: c,
      length: len,
      samples: sArr,
      tangents: tArr,
      bounds: { minX, maxX, minZ, maxZ },
      maxStep: (len / N) * 1.4,
    };
    trackCache.set(cacheKey, entry);
  }
  curve = entry.curve;
  length = entry.length;
  samples = entry.samples;
  tangents = entry.tangents;
  cachedBounds = entry.bounds;
  maxSampleStep = entry.maxStep;
  return activeTrack;
}
configureTrack();

export function bounds() {
  return cachedBounds;
}

export function mapPoint(p, w = 260, h = 145) {
  const b = bounds(),
    scale = Math.min(w / (b.maxX - b.minX), h / (b.maxZ - b.minZ));
  return [
    (p.x - b.minX) * scale + (w - (b.maxX - b.minX) * scale) / 2 + 10,
    (p.z - b.minZ) * scale + (h - (b.maxZ - b.minZ) * scale) / 2 + 10,
  ];
}

// One shared, track-local arc-length table. Rendering, physics and AI use
// identical interpolation; graphics settings never select a different path.
export function at(s, out = null) {
  const f = ((((s / length) % 1) + 1) % 1) * N,
    i = Math.floor(f),
    j = (i + 1) % N,
    u = f - i;
  const slot = out || posePool[poseCursor = (poseCursor + 1) & (POSE_POOL_SIZE - 1)];
  slot.p.lerpVectors(samples[i], samples[j], u);
  slot.dir.lerpVectors(tangents[i], tangents[j], u).normalize();
  slot.right.set(slot.dir.z, 0, -slot.dir.x);
  slot.heading = Math.atan2(slot.dir.x, slot.dir.z);
  return slot;
}

export function headingAt(s) {
  const f = ((((s / length) % 1) + 1) % 1) * N,
    i = Math.floor(f),
    j = (i + 1) % N,
    u = f - i;
  return Math.atan2(
    tangents[i].x + (tangents[j].x - tangents[i].x) * u,
    tangents[i].z + (tangents[j].z - tangents[i].z) * u,
  );
}

export function closest(x, z, last = -1) {
  let best = Infinity,
    idx = 0;
  const scan = (i) => {
    i = (i + N) % N;
    let p = samples[i];
    let d = (x - p.x) ** 2 + (z - p.z) ** 2;
    if (d < best) {
      best = d;
      idx = i;
    }
  };
  if (last >= 0) {
    for (let i = last - 24; i <= last + 24; i++) scan(i);
  }
  if (last < 0 || best > 45 ** 2) {
    const COARSE = 8;
    let coarseBest = Infinity;
    for (let i = 0; i < N; i += COARSE) {
      const p = samples[i];
      const d = (x - p.x) ** 2 + (z - p.z) ** 2;
      if (d < coarseBest) coarseBest = d;
    }
    const margin = COARSE * maxSampleStep + 4;
    const thresholdSq = (Math.sqrt(coarseBest) + margin) ** 2;
    for (let i = 0; i < N; i += COARSE) {
      const p = samples[i];
      const d = (x - p.x) ** 2 + (z - p.z) ** 2;
      if (d <= thresholdSq) {
        for (let k = i - COARSE + 1; k < i + COARSE; k++) scan(k);
      }
    }
  }
  const a = samples[idx],
    b = samples[(idx + 1) % N],
    prev = samples[(idx - 1 + N) % N];
  let dx = b.x - a.x,
    dz = b.z - a.z,
    proj = ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz);
  if (proj < 0) {
    idx = (idx - 1 + N) % N;
    dx = a.x - prev.x;
    dz = a.z - prev.z;
    proj = ((x - prev.x) * dx + (z - prev.z) * dz) / (dx * dx + dz * dz);
  }
  proj = THREE.MathUtils.clamp(proj, 0, 1);
  const base = samples[idx],
    px = base.x + dx * proj,
    pz = base.z + dz * proj,
    n = Math.hypot(dx, dz);
  return {
    s: ((idx + proj) / N) * length,
    index: idx,
    lateral: ((x - px) * dz - (z - pz) * dx) / n,
    distance: Math.hypot(x - px, z - pz),
    x: px,
    z: pz,
    heading: Math.atan2(dx, dz),
  };
}

export function curvature(s) {
  let a = headingAt(s),
    b = headingAt(s + 22);
  return Math.abs(angle(b - a)) / 22;
}

export const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function outlineSVG() {
  const points = samples
    .filter((_, i) => i % 16 === 0)
    .map((p) =>
      mapPoint(p)
        .map((v) => v.toFixed(1))
        .join(","),
    );
  const start = mapPoint(samples[0]);
  return `<svg viewBox="0 0 280 170" aria-label="Traçado de ${activeTrack.name}"><polyline points="${[...points, points[0]].join(" ")}" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><circle cx="${start[0]}" cy="${start[1]}" r="4" fill="#ed2147"/></svg>`;
}
