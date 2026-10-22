import { activeTrack, at, samples, length, TRACK_WIDTH, bounds } from '../track.js';
import { footprintDistance } from '../venue/VenueLayout.js';
import { pitSceneryClear, pitFacilities } from '../strategy/PitLayout.js';

const PROFILES = {
  aurora:       { identity:'Bosques e campus',       form:'broad',   foliage:'#4d6d43', ridge:'#556b4d', wall:'#d5d1c3', roof:'#596859', density:1.05, relief:46, height:13 },
  veloce:       { identity:'Parque real italiano',   form:'conifer', foliage:'#3f5f3c', ridge:'#5b6b50', wall:'#d8c5a7', roof:'#8f4d3b', density:1.15, relief:40, height:15 },
  serpente:     { identity:'Vale montanhoso',        form:'conifer', foliage:'#3b5d44', ridge:'#5d6e61', wall:'#c8c4b8', roof:'#5b4c45', density:1.05, relief:74, height:14 },
  neon:         { identity:'Metrópole costeira',     form:'palm',    foliage:'#3c685a', ridge:'#334455', wall:'#637586', roof:'#394b59', density:.58,  relief:28, height:11 },
  titan:        { identity:'Planalto industrial',    form:'broad',   foliage:'#5f6e49', ridge:'#6d6a58', wall:'#c2BEB2', roof:'#586068', density:.78,  relief:42, height:11 },
  vento:        { identity:' enseada atlântica',     form:'palm',    foliage:'#4d7559', ridge:'#67806e', wall:'#e2ddd0', roof:'#4f7386', density:.82,  relief:36, height:12 },
  sahara:       { identity:'Oásis e dunas',          form:'rock',    foliage:'#9b7f58', ridge:'#b99362', wall:'#dfd0b4', roof:'#9e6946', density:.62,  relief:54, height:9 },
  alpine:       { identity:' Passo alpino',          form:'conifer', foliage:'#35553d', ridge:'#677579', wall:'#d8d3c8', roof:'#644b3e', density:1.12, relief:92, height:15 },
  emerald:      { identity:'Colinas britânicas',     form:'broad',   foliage:'#426843', ridge:'#516b51', wall:'#cfc8b8', roof:'#525a61', density:1.15, relief:38, height:13 },
  oldtown:      { identity:'Centro histórico',       form:'broad',   foliage:'#496444', ridge:'#63685e', wall:'#d7c1a3', roof:'#8e4f3e', density:.62,  relief:34, height:11 },
  sunset:       { identity:'Penhascos dourados',     form:'palm',    foliage:'#586d46', ridge:'#876b4f', wall:'#dfd1ba', roof:'#8b5842', density:.82,  relief:56, height:12 },
  nordic:       { identity:'Taiga boreal',           form:'conifer', foliage:'#365149', ridge:'#7d9098', wall:'#d7dfe2', roof:'#516575', density:.95,  relief:66, height:14 },
  'desert-night':{ identity:'Paddock iluminado',     form:'rock',    foliage:'#846d52', ridge:'#6a5846', wall:'#cbbda6', roof:'#505d6b', density:.58,  relief:48, height:9 },
  imperiale:    { identity:'Bosque real lombardo',   form:'conifer', foliage:'#3d633b', ridge:'#52684b', wall:'#ded2bd', roof:'#8c4738', density:1.12, relief:38, height:15 },
  sakura:       { identity:'Colinas de Kansai',      form:'broad',   foliage:'#4f6d4a', ridge:'#5e6f64', wall:'#d9d2c7', roof:'#4a5568', density:1.08, relief:64, height:14 },
  lumina:       { identity:'Baía financeira',        form:'palm',    foliage:'#365f54', ridge:'#2d3c4d', wall:'#5a6d80', roof:'#2f4254', density:.60,  relief:26, height:12 },
  discovery:    { identity:'Anfiteatro vulcânico',   form:'conifer', foliage:'#466444', ridge:'#5f6458', wall:'#cbc6b9', roof:'#665347', density:1.0,  relief:68, height:13 },
};
const cache = new Map();

export function environmentProfile(id = activeTrack.id) {
  return PROFILES[id] || PROFILES.aurora;
}
export function environmentView(cameraY, targetDistance, radius, out = {}) {
  const high = cameraY > 240 || targetDistance > 420;
  out.near = high ? 20 : .2;
  out.far = Math.max(high ? 5200 : 3200, targetDistance + radius + 1650);
  out.fogNear = high ? Math.max(520, targetDistance * .45) : 340;
  out.fogFar = out.far - 180;
  return out;
}
function hash(a, b) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
export function environmentPlan(venues = [], buildings = []) {
  const key = `${activeTrack.id}:${length}:${TRACK_WIDTH}:${venues.length}:${buildings.length}`;
  if (cache.has(key)) return cache.get(key);
  const profile = environmentProfile(activeTrack.id);
  const b = bounds(), cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const maxSpan = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  const radius = Math.max(660, maxSpan * .74 + 270);
  const cell = 24, roadMap = new Map();
  for (const p of samples) {
    const gx = Math.floor(p.x / cell), gz = Math.floor(p.z / cell);
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
      const k = `${gx + dx},${gz + dz}`;
      let list = roadMap.get(k); if (!list) { list = []; roadMap.set(k, list); }
      list.push(p);
    }
  }
  const roadClear = (x, z, r) => {
    const limit = TRACK_WIDTH / 2 + 20 + r, l2 = limit * limit;
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    const near = roadMap.get(`${gx},${gz}`);
    if (near) {
      for (const p of near) if ((p.x - x) ** 2 + (p.z - z) ** 2 < l2) return false;
      return true;
    }
    for (let i = 0; i < samples.length; i += 3) {
      const p = samples[i];
      if ((p.x - x) ** 2 + (p.z - z) ** 2 < (limit + 12) ** 2) {
        for (let j = Math.max(0, i - 3); j < Math.min(samples.length, i + 4); j++)
          if ((samples[j].x - x) ** 2 + (samples[j].z - z) ** 2 < l2) return false;
      }
    }
    return true;
  };
  const waterLimit = activeTrack.theme === 'coast' ? b.maxX + 42 : Infinity;
  const items = [];
  const clear = (x, z, r) => {
    if (x + r > waterLimit) return false;
    if (Math.hypot(x - cx, z - cz) + r > radius - 22) return false;
    if (!roadClear(x, z, r) || !pitSceneryClear(x, z, r + 4)) return false;
    for (let s = -250; s <= 350; s += 20) {
      const t = at(s);
      for (const off of [26, 50, 80]) {
        if (Math.hypot(t.p.x + t.right.x * off - x, t.p.z + t.right.z * off - z) < r + 24) return false;
      }
    }
    for (const f of pitFacilities()) if (footprintDistance({ ...f, halfDepth: f.halfLength }, x, z) < r + 8) return false;
    for (const v of venues) if (footprintDistance(v, x, z) < r + 8) return false;
    for (const u of buildings) if (footprintDistance({ ...u, heading: u.heading || 0, halfDepth: u.halfLength }, x, z) < r + 6) return false;
    for (const o of items) if ((o.x - x) ** 2 + (o.z - z) ** 2 < (o.radius + r + 2.2) ** 2) return false;
    return true;
  };

  // Zones 1, 2 & 5: Concourse & District Service Facilities
  const facilities = [];
  for (let i = 0; i < 18; i++) {
    const s = ((i + .35) / 18) * length, t = at(s);
    for (const side of i % 2 ? [1, -1] : [-1, 1]) {
      for (const dist of [54, 72, 92, 116, 144]) {
        const x = t.p.x + t.right.x * side * dist, z = t.p.z + t.right.z * side * dist;
        if (clear(x, z, 22)) {
          const item = { kind:'concourse', index:i, x, z, heading:t.heading + (side > 0 ? -Math.PI / 2 : Math.PI / 2), radius:22, side, s };
          facilities.push(item); items.push(item); break;
        }
      }
      if (facilities.length > i) break;
    }
  }
  for (let i = 0; i < 8; i++) {
    const s = ((i + .12) / 8) * length, t = at(s);
    for (const side of [-1, 1]) for (const dist of [128, 162, 198]) {
      const x = t.p.x + t.right.x * side * dist, z = t.p.z + t.right.z * side * dist;
      if (clear(x, z, 28)) {
        const item = { kind:'district', district:true, index:i, x, z, heading:t.heading, radius:28, side, s };
        facilities.push(item); items.push(item); break;
      }
    }
  }

  const vegetation = [];
  const tryAddTree = (x, z, seedA, seedB, scaleBoost = 1.0) => {
    const scale = (.76 + hash(seedA, seedB) * .62) * scaleBoost;
    const r = 3.0 * scale;
    if (!clear(x, z, r)) return false;
    const item = {
      x,
      z,
      scale,
      radius: r,
      heading: hash(seedB, seedA) * Math.PI * 2,
      tone: .84 + hash(seedA + 7, seedB + 13) * .28,
    };
    vegetation.push(item);
    items.push(item);
    return true;
  };

  // Zone 3 & 4: Trackside Tree Corridors & Corner Framing (33m to 72m from centerline)
  // Places trees close enough to frame straights and corners without intruding into safety strip
  const corridorStep = Math.max(16, Math.round(22 / profile.density));
  for (let s = 0; s < length; s += corridorStep) {
    const t = at(s);
    const wave = Math.sin(s * 0.014) * 0.5 + Math.cos(s * 0.029) * 0.5;
    for (const side of [-1, 1]) {
      // Vary corridor depth organically so it forms natural groves rather than rigid lines
      const d1 = 33 + hash(s, side * 11) * 14 + Math.max(0, wave * side) * 8;
      const j1 = (hash(s + 3, side * 19) - 0.5) * 10;
      tryAddTree(
        t.p.x + t.right.x * side * d1 + t.dir.x * j1,
        t.p.z + t.right.z * side * d1 + t.dir.z * j1,
        s + 1,
        side * 31,
        0.95,
      );
      if (profile.density >= 0.75 || hash(s, side * 43) > 0.35) {
        const d2 = 50 + hash(s + 9, side * 23) * 22;
        const j2 = (hash(s + 15, side * 37) - 0.5) * 14;
        tryAddTree(
          t.p.x + t.right.x * side * d2 + t.dir.x * j2,
          t.p.z + t.right.z * side * d2 + t.dir.z * j2,
          s + 5,
          side * 59,
          1.08,
        );
      }
    }
  }

  // Zone 6: Organic Infield & Outfield Regional Woodlands (eliminating artificial polka-dot rings)
  const midStep = Math.max(20, Math.round(26 / profile.density));
  for (let s = 10; s < length; s += midStep) {
    const t = at(s);
    for (const side of [-1, 1]) {
      for (const band of [82, 114, 152, 196]) {
        if (hash(s * 0.7, band + side * 17) > profile.density * 0.78) continue;
        const dist = band + (hash(s, band * side) - 0.5) * 26;
        const along = (hash(band, s + side * 7) - 0.5) * 22;
        tryAddTree(
          t.p.x + t.right.x * side * dist + t.dir.x * along,
          t.p.z + t.right.z * side * dist + t.dir.z * along,
          s + band,
          side * 97 + band,
          1.12,
        );
      }
    }
  }

  // Naturalistic golden-angle spiral fill across the infield & outer valley floor
  const fillCount = Math.round(280 * profile.density);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < fillCount; i++) {
    const frac = (i + 0.5) / fillCount;
    const r = Math.sqrt(frac) * (radius - 48);
    const theta = i * goldenAngle + (activeTrack.id.charCodeAt(0) * 0.17);
    // Modulate density with organic multi-wave noise so natural meadows/clearings remain
    const patch = Math.sin(r * 0.018 + theta * 3) + Math.cos(r * 0.011 - theta * 2);
    if (patch < -0.45) continue;
    const x = cx + Math.cos(theta) * r + (hash(i, 19) - 0.5) * 18;
    const z = cz + Math.sin(theta) * r + (hash(i, 73) - 0.5) * 18;
    tryAddTree(x, z, i * 13, i * 29 + 7, 1.15);
  }

  const plan = { profile, centre:{ x:cx, z:cz }, radius, facilities, vegetation };
  cache.set(key, plan);
  return plan;
}
