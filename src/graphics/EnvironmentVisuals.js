import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { activeTrack } from '../track.js';
import { environmentPlan, environmentView } from './EnvironmentPlan.js';

// All construction happens once per track. Spatial batches retain frustum culling.
function terrainShade(x, z) {
  return (
    .90 +
    .055 * Math.sin(x * .013 + Math.cos(z * .008) * 2) +
    .038 * Math.cos(-z * .019 + x * .003) +
    .025 * Math.sin((x + z) * .0045)
  );
}
function coloured(geometry, colour) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  g.deleteAttribute('uv');
  const c = new THREE.Color(colour), values = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < values.length; i += 3) {
    const ny = g.attributes.normal ? g.attributes.normal.getY(i / 3) : 1;
    const shade = ny > .35 ? 1.04 : ny < -.2 ? .82 : .94;
    values[i] = Math.min(1, c.r * shade);
    values[i + 1] = Math.min(1, c.g * shade);
    values[i + 2] = Math.min(1, c.b * shade);
  }
  g.setAttribute('color', new THREE.BufferAttribute(values, 3));
  return g;
}
export function groundGeometry() {
  const g = new THREE.PlaneGeometry(4200, 4200, 64, 64), a = g.attributes.position;
  const colors = new Float32Array(a.count * 3);
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), z = a.getY(i);
    const shade = terrainShade(x, -z);
    const meadow = Math.sin(x * .0065) * Math.cos(z * .0065) * .035;
    colors[i * 3] = Math.min(1, shade + meadow * .8);
    colors[i * 3 + 1] = Math.min(1, shade + meadow * 1.1);
    colors[i * 3 + 2] = Math.min(1, shade - meadow * .5);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}
export class EnvironmentVisuals {
  constructor(world) {
    this.cityBuildings = world.cityBuildings;
    this.plan = environmentPlan(world.venues.plan, world.cityBuildings);
    this.root = new THREE.Group();
    this.root.name = 'environment-spatial-batches';
    world.scene.add(this.root);
    this.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    this.view = {};
    this.lods = [];
    this.ground = world.ground;
    this.buildLandscape();
    this.buildFacilities();
    this.buildVegetation();
    this.stats = {
      identity: this.plan.profile.identity,
      vegetation: this.plan.vegetation.length,
      facilities: this.plan.facilities.length,
      spatialBatches: this.root.children.length,
      lodCells: this.lods.length,
    };
  }
  addBatch(g, x = 0, z = 0) {
    const mesh = new THREE.Mesh(g, this.material);
    mesh.position.set(x, -.06, z);
    mesh.receiveShadow = true;
    this.root.add(mesh);
    return mesh;
  }
  buildLandscape() {
    const { profile: p, centre: c, radius } = this.plan, n = 120, rows = 12, positions = [], colours = [], indices = [], uv = [];
    const base = new THREE.Color(activeTrack.grass);
    const midRock = new THREE.Color(p.ridge).multiplyScalar(1.04);
    const summit = new THREE.Color(
      activeTrack.theme === 'snow' || activeTrack.id === 'alpine'
        ? '#e4ece9'
        : activeTrack.theme === 'desert'
          ? '#d6b485'
          : p.ridge,
    ).multiplyScalar(1.22);

    for (let j = 0; j <= rows; j++) for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, r = radius + j * 135;
      const shape =
        .62 +
        .22 * Math.sin(a * 5 + .7) +
        .14 * Math.sin(a * 11 + 1.4) +
        .09 * Math.cos(a * 19 + .4) +
        .05 * Math.sin(a * 29);
      // Flat first strip shares the ground normal (normal.y > 0): no circular lighting seam.
      const rowFrac = Math.max(0, j - 1) / (rows - 1);
      const foothill = j >= 2 && j <= 5 ? Math.sin(((j - 1) / 4) * Math.PI) * 0.22 : 0;
      const mainPeak = Math.sin(rowFrac * Math.PI) ** 1.85;
      const h = Math.max(foothill, mainPeak) * p.relief * shape;
      positions.push(Math.cos(a) * r, h, Math.sin(a) * r);
      uv.push((c.x + Math.cos(a) * r) / 4200 + .5, .5 - (c.z + Math.sin(a) * r) / 4200);
      const elevRatio = Math.min(1, Math.max(0, h / Math.max(1, p.relief)));
      const col = elevRatio < 0.55
        ? base.clone().lerp(midRock, elevRatio / 0.55)
        : midRock.clone().lerp(summit, (elevRatio - 0.55) / 0.45);
      col.multiplyScalar(terrainShade(c.x + Math.cos(a) * r, c.z + Math.sin(a) * r));
      colours.push(col.r, col.g, col.b);
      if (j < rows && i < n) {
        const k = j * (n + 1) + i;
        indices.push(k, k + 1, k + n + 1, k + 1, k + n + 2, k + n + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    const mesh = this.addBatch(g, c.x, c.z);
    mesh.name = 'continuous-distant-landscape';
    mesh.material = new THREE.MeshLambertMaterial({ vertexColors: true, map: this.ground.material.map });
  }
  buildFacilities() {
    const groups = new Map(), matrix = new THREE.Matrix4(), obj = new THREE.Object3D();
    const box = new THREE.BoxGeometry(1, 1, 1), pyramid = new THREE.ConeGeometry(1, 1, 4);
    pyramid.rotateY(Math.PI / 4);
    const rockRaw = new THREE.DodecahedronGeometry(1, 0);
    const add = (f, x, y, z, w, h, d, colour, kind = 'box') => {
      const key = `${Math.floor(f.x / 320)},${Math.floor(f.z / 320)}`;
      if (!groups.has(key)) groups.set(key, []);
      const baseGeo = kind === 'roof' ? pyramid : kind === 'rock' ? rockRaw : box;
      const g = coloured(baseGeo, colour);
      obj.position.set(
        f.x + Math.cos(f.heading) * x + Math.sin(f.heading) * z,
        y,
        f.z - Math.sin(f.heading) * x + Math.cos(f.heading) * z,
      );
      obj.rotation.set(0, f.heading, 0);
      obj.scale.set(w, h, d);
      obj.updateMatrix();
      matrix.copy(obj.matrix);
      g.applyMatrix4(matrix);
      groups.get(key).push(g);
    };
    const p = this.plan.profile;
    // Blend apron colour with dark slate/earth so aerial views don't show bright white rectangles
    const apronCol = activeTrack.theme === 'desert' ? '#8c7a62' : activeTrack.theme === 'snow' ? '#8b9ba6' : '#4a554c';
    const pathCol = activeTrack.theme === 'desert' ? '#a39074' : '#5c665d';

    for (const f of this.plan.facilities) {
      const district = !!f.district, width = district ? 42 : 30, depth = district ? 34 : 23;
      add(f, 0, .0125, 0, width, .025, depth, apronCol);
      const count = district ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const x = (i - (count - 1) / 2) * (district ? 13 : 14), z = district ? -4.5 : -3.5;
        const h = activeTrack.id === 'neon' ? 12 + (f.index % 4) * 5 : 4.8 + (f.index % 3) * 1.6;
        // Main building volume + architectural plinth & cornice
        add(f, x, 0.35, z, 10.4, 0.7, 9.4, '#475569');
        add(f, x, h / 2, z, 10, h, 9, p.wall);
        const pitched = ['oldtown', 'veloce', 'alpine', 'nordic', 'aurora', 'emerald', 'discovery'].includes(activeTrack.id);
        if (pitched) add(f, x, h + 1.45, z, 8.4, 2.9, 7.8, p.roof, 'roof');
        else {
          add(f, x, h + .25, z, 10.8, .5, 9.8, p.roof);
          add(f, x + 1.8, h + .85, z - 1.2, 2.2, .7, 2.2, '#64748b');
        }
        // Recessed entrance & window strips
        add(f, x, 1.35, z + 4.56, 2.4, 2.7, .14, '#1e293b');
        add(f, x, 2.85, z + 4.85, 3.2, .18, .75, p.roof);
        for (const side of [-1, 1]) add(f, x + side * 3.1, h * .58, z + 4.56, 2.3, 1.25, .14, '#38bdf8');
        if (activeTrack.id === 'neon') {
          for (let y = 5; y < h - 1; y += 3.2) add(f, x, y, z + 4.57, 8.2, .48, .12, '#7dd3fc');
        }
      }
      // Team / Broadcast service vehicles parked on apron
      for (let i = 0; i < (district ? 6 : 4); i++) {
        const x = (i - ((district ? 6 : 4) - 1) / 2) * 5.2, z = depth / 2 - 4.2;
        add(f, x, .62, z, 2.1, 1.2, 4.3, ['#cbd5e1', '#475569', '#991b1b', '#1e3a8a'][i % 4]);
        add(f, x, 1.38, z - .2, 1.8, .58, 2.3, '#1e293b');
      }
      add(f, 0, .018, 1.2, width - 2, .03, 1.4, pathCol);
      // Natural rock boulder accent near outer edge of facility pad
      if (f.index % 2 === 0) {
        add(f, width / 2 - 2.5, 0.7, -depth / 2 + 2.5, 2.4, 1.5, 2.1, p.ridge, 'rock');
      }
    }
    // Urban buildings roof & facade detail
    for (const b of this.cityBuildings) {
      const f = { ...b, heading: 0 };
      add(f, 0, b.height + .3, 0, 24, .6, 25, p.roof);
      for (let y = 3; y < b.height - 1; y += 3)
        for (const side of [-1, 1]) add(f, 0, y, side * 12.07, 19, .65, .12, '#708e9a');
      if (activeTrack.id === 'oldtown') add(f, 0, b.height + 3, 0, 18, 6, 19, p.roof, 'roof');
    }
    for (const geos of groups.values()) {
      const g = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      const mesh = this.addBatch(g);
      mesh.name = 'district-and-concourse';
      mesh.castShadow = true;
    }
    box.dispose();
    pyramid.dispose();
    rockRaw.dispose();
  }
  treeGeometry(far = false) {
    const p = this.plan.profile, h = p.height, parts = [];
    const baseCol = new THREE.Color(p.foliage);
    const midCol = baseCol.clone().multiplyScalar(1.1);
    const topCol = baseCol.clone().multiplyScalar(1.22);
    const darkCol = baseCol.clone().multiplyScalar(0.86);

    if (p.form === 'rock') {
      // Multi-spire desert/canyon rock outcrop + scrub bush, resting below y=0
      const mainRock = new THREE.DodecahedronGeometry(1, 0);
      mainRock.scale(h * .72, h * .52, h * .62);
      mainRock.translate(0, h * .34, 0);
      parts.push(coloured(mainRock, baseCol));
      mainRock.dispose();
      const sideSpire = new THREE.IcosahedronGeometry(1, 0);
      sideSpire.scale(h * .44, h * .68, h * .42);
      sideSpire.translate(h * .38, h * .42, h * .18);
      parts.push(coloured(sideSpire, midCol));
      sideSpire.dispose();
      if (!far) {
        const scrub = new THREE.IcosahedronGeometry(1, 0);
        scrub.scale(h * .28, h * .18, h * .28);
        scrub.translate(-h * .42, h * .12, -h * .22);
        parts.push(coloured(scrub, '#6b7048'));
        scrub.dispose();
      }
    } else if (p.form === 'conifer') {
      // Pine / Fir tree with flared trunk and 3 stepped conical foliage tiers
      const trunk = new THREE.CylinderGeometry(.24, .52, h * .36, far ? 4 : 6);
      trunk.translate(0, h * .17, 0);
      parts.push(coloured(trunk, '#5c4938'));
      trunk.dispose();

      const tiers = far
        ? [
            [h * .34, h * .52, h * .44, darkCol],
            [h * .24, h * .46, h * .72, topCol],
          ]
        : [
            [h * .36, h * .42, h * .38, darkCol],
            [h * .29, h * .40, h * .60, baseCol],
            [h * .20, h * .38, h * .81, topCol],
          ];
      for (const [rad, ch, cy, col] of tiers) {
        const cone = new THREE.ConeGeometry(rad, ch, far ? 5 : 7);
        cone.translate(0, cy, 0);
        parts.push(coloured(cone, col));
        cone.dispose();
      }
    } else if (p.form === 'palm') {
      // Coastal / Urban Palm with tapered trunk and radiating crown fronds
      const trunk = new THREE.CylinderGeometry(.18, .42, h * .68, far ? 4 : 6);
      trunk.translate(0, h * .33, 0);
      parts.push(coloured(trunk, '#7c654d'));
      trunk.dispose();

      const crownCenter = new THREE.IcosahedronGeometry(h * .16, 0);
      crownCenter.translate(0, h * .68, 0);
      parts.push(coloured(crownCenter, darkCol));
      crownCenter.dispose();

      const frondCount = far ? 4 : 6;
      for (let i = 0; i < frondCount; i++) {
        const ang = (i / frondCount) * Math.PI * 2;
        const frond = new THREE.BoxGeometry(h * .42, h * .06, h * .14);
        frond.rotateZ(-0.28);
        frond.translate(h * .18, 0, 0);
        frond.rotateY(ang);
        frond.translate(0, h * .71, 0);
        parts.push(coloured(frond, i % 2 === 0 ? topCol : midCol));
        frond.dispose();
      }
    } else {
      // Broadleaf deciduous tree with trunk, lower understory bush, and multi-lobe crown
      const trunk = new THREE.CylinderGeometry(.28, .58, h * .42, far ? 4 : 6);
      trunk.translate(0, h * .20, 0);
      parts.push(coloured(trunk, '#655341'));
      trunk.dispose();

      const mainCrown = new THREE.IcosahedronGeometry(1, 0);
      mainCrown.scale(h * .34, h * .36, h * .34);
      mainCrown.translate(0, h * .64, 0);
      parts.push(coloured(mainCrown, baseCol));
      mainCrown.dispose();

      const upperLobe = new THREE.IcosahedronGeometry(1, 0);
      upperLobe.scale(h * .26, h * .24, h * .26);
      upperLobe.translate(-h * .08, h * .82, h * .06);
      parts.push(coloured(upperLobe, topCol));
      upperLobe.dispose();

      if (!far) {
        const sideLobe = new THREE.IcosahedronGeometry(h * .24, 0);
        sideLobe.translate(h * .19, h * .54, -h * .10);
        parts.push(coloured(sideLobe, midCol));
        sideLobe.dispose();
      }
    }
    const g = mergeGeometries(parts, false);
    parts.forEach((g) => g.dispose());
    return g;
  }
  buildVegetation() {
    const near = this.treeGeometry(), far = this.treeGeometry(true), groups = new Map();
    for (const p of this.plan.vegetation) {
      const key = `${Math.floor(p.x / 320)},${Math.floor(p.z / 320)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }
    const o = new THREE.Object3D(), color = new THREE.Color();
    for (const points of groups.values()) {
      const a = new THREE.InstancedMesh(near, this.material, points.length),
        b = new THREE.InstancedMesh(far, this.material, points.length);
      points.forEach((p, i) => {
        o.position.set(p.x, -.06, p.z);
        o.rotation.y = p.heading;
        o.scale.setScalar(p.scale);
        o.updateMatrix();
        a.setMatrixAt(i, o.matrix);
        a.setColorAt(i, color.setRGB(p.tone * 0.96, p.tone * 1.02, p.tone * 0.94));
      });
      b.instanceMatrix = a.instanceMatrix;
      b.instanceColor = a.instanceColor;
      a.computeBoundingSphere();
      b.computeBoundingSphere();
      a.castShadow = b.castShadow = true;
      a.receiveShadow = b.receiveShadow = true;
      a.name = 'vegetation-near';
      b.name = 'vegetation-far';
      this.root.add(a, b);
      b.visible = false;
      this.lods.push({ near: a, far: b, centre: a.boundingSphere.center, radius: a.boundingSphere.radius });
    }
    if (!groups.size) { near.dispose(); far.dispose(); }
  }
  update(camera, look, world) {
    const view = environmentView(camera.position.y, camera.position.distanceTo(look), this.plan.radius, this.view);
    if (world.mode !== 'track-preview' && (camera.near !== view.near || camera.far !== view.far)) {
      camera.near = view.near;
      camera.far = view.far;
      camera.updateProjectionMatrix();
    }
    world.scene.fog.near = view.fogNear;
    world.scene.fog.far = Math.max(view.fogFar, this.plan.radius + 2100);
    for (const cell of this.lods) {
      const distance = camera.position.distanceTo(cell.centre) - cell.radius;
      const limit = cell.near.visible ? 360 : 310;
      const near = distance < limit;
      cell.near.visible = near;
      cell.far.visible = !near;
    }
  }
}
