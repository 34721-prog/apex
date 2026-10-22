import { serviceLift } from "./VehicleMotion.js";
import { PIT_HEIGHT } from "./VehiclePresentation.js";
import { batchScenery } from "../optimize.js";
import { compounds } from "../strategy/Resources.js";
import * as THREE from "three";
import { at, barrierOffset } from "../track.js";
import {
  pitLayout,
  pitPoint,
  pitOffset,
  apron,
  PIT_ENTRY,
  PIT_EXIT,
  SERVICE_LANE,
} from "../strategy/PitLayout.js";
const temp = new THREE.Object3D(),
  color = new THREE.Color();
export function buildPit(world) {
  if (world.pitRoot) return world.pitRoot;
  const root = (world.pitRoot = new THREE.Group());
  root.name = "physical-pit";
  world.scene.add(root);
  const vs = [],
    uv = [],
    cols = [],
    ix = [],
    n = 270;
  for (let i = 0; i <= n; i++) {
    const s = PIT_ENTRY - 5 + (i * (PIT_EXIT - PIT_ENTRY + 10)) / n,
      t = at(s),
      off = pitOffset(s);
    const shade = 0.88 + 0.04 * Math.sin(s * 0.04);
    for (const x of [off - 4.8, off + 4.8 + 12 * apron(s)]) {
      vs.push(t.p.x + t.right.x * x, PIT_HEIGHT, t.p.z + t.right.z * x);
      uv.push(x / 10, s / 6);
      cols.push(shade * 0.96, shade * 0.98, shade);
    }
    if (i < n) {
      const k = i * 2;
      ix.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vs, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  geo.setIndex(ix);
  geo.computeVertexNormals();
  const surface = new THREE.Mesh(geo, world.roadMaterial);
  surface.receiveShadow = true;
  surface.name = "pit-surface";
  root.add(surface);
  const boxes = [];
  const box = (s, x, y, w, h, d, c, z = 0) => {
    const t = at(s);
    boxes.push({
      x: t.p.x + t.right.x * x + t.dir.x * z,
      y,
      z: t.p.z + t.right.z * x + t.dir.z * z,
      w,
      h,
      d,
      c,
      heading: t.heading,
    });
  };
  for (const bay of pitLayout()) {
    const gl = bay.garageLength;
    // Epoxy garage floor + dark central service pad
    box(bay.s, 50, 0.17, 17, 0.14, gl, "#94a3b8");
    box(bay.s, 49.5, 0.245, 13.5, 0.02, gl - 2.4, "#334155");
    // Back wall and side partition walls
    box(bay.s, 58, 3.3, 0.5, 6.6, gl, "#1e293b");
    for (const z of [-gl / 2, gl / 2]) {
      box(bay.s, 50, 3.3, 16, 6.6, 0.4, "#334155", z);
      // Front portal pilaster column in team accent
      box(bay.s, 41.8, 3.3, 0.65, 6.6, 0.75, bay.color, z * 0.96);
    }
    // First-floor ceiling slab & team header fascia
    box(bay.s, 50, 6.65, 17.4, 0.42, gl, "#cbd5e1");
    box(bay.s, 41.75, 5.7, 0.42, 1.48, gl - 0.8, bay.color);
    box(bay.s, 41.68, 4.92, 0.48, 0.16, gl - 0.6, "#0f172a");

    // 2nd-floor Paddock Club VIP Hospitality Suite & Rooftop Canopy
    box(bay.s, 50.8, 8.35, 15.2, 3.1, gl - 0.4, "#1e293b");
    // Tinted panoramic hospitality windows facing the track
    box(bay.s, 43.1, 8.35, 0.22, 2.4, gl - 1.8, "#38bdf8");
    // Front VIP viewing terrace & glass balustrade
    box(bay.s, 42.1, 7.35, 0.18, 0.95, gl - 0.6, "#64748b");
    box(bay.s, 42.1, 7.88, 0.24, 0.12, gl - 0.4, "#e2e8f0");
    // Sloped cantilevered stadium roof above Paddock Club
    box(bay.s, 49.5, 10.05, 18.2, 0.38, gl + 0.2, "#cbd5e1");
    box(bay.s, 40.5, 10.08, 0.45, 0.42, gl + 0.2, bay.color);

    // Interior recessed LED lighting strips
    for (const lx of [45.5, 50, 54.5]) {
      box(bay.s, lx, 6.32, 0.45, 0.12, gl - 4, "#fef9c3");
    }
    // Overhead twin pit-stop air boom gantries extending toward service bay
    for (const bz of [-3.4, 3.4]) {
      box(bay.s, 40.2, 4.55, 5.2, 0.18, 0.22, "#cbd5e1", bz);
      box(bay.s, 37.8, 4.15, 0.12, 0.75, 0.12, bay.color, bz);
    }

    // Tool cabinets, telemetry island, nitrogen rack, and spare tire racks
    box(bay.s, 56, 1.05, 2, 2, 12, bay.color);
    box(bay.s, 55, 2.1, 3, 0.16, 12, "#cbd5e1");
    // Telemetry monitor wall
    box(bay.s, 54.2, 2.95, 0.22, 1.35, 4.8, "#0f172a");
    box(bay.s, 54.05, 2.95, 0.08, 1.05, 4.2, "#0284c7");
    // Spare tire racks on both sides of the garage
    box(bay.s, 51, 1.35, 1.8, 2.6, 2.8, "#1e293b", 7.8);
    box(bay.s, 51, 1.35, 1.8, 2.6, 2.8, "#1e293b", -7.8);
    box(bay.s, 44, 1.2, 1.0, 2.4, 1.1, bay.color, -9.8);

    // Pit Wall Engineer Perch (Signaling booth on the pit wall opposite each garage)
    const wOff = barrierOffset();
    box(bay.s, wOff + 0.55, 1.65, 1.1, 1.3, 4.2, "#1e293b");
    box(bay.s, wOff + 0.5, 2.85, 1.4, 0.18, 4.6, bay.color);
    box(bay.s, wOff + 0.85, 1.75, 0.12, 0.65, 3.2, "#38bdf8");

    // Stall frame, wheel stop markers, and fast-lane directional arrows
    for (const z of [-4.2, 4.2])
      box(bay.s, SERVICE_LANE, 0.17, 5.7, 0.035, 0.22, bay.color, z);
    for (const x of [-2.85, 2.85])
      box(bay.s, SERVICE_LANE + x, 0.17, 0.2, 0.035, 8.5, bay.color);
    // White inner guidelines inside pit box
    for (const x of [-1.45, 1.45])
      box(bay.s, SERVICE_LANE + x, 0.172, 0.12, 0.036, 6.2, "#f8fafc");
    box(bay.s, 26, 0.17, 0.16, 0.04, 7, "#f4eee1");
    box(bay.s, 26, 0.18, 1.5, 0.04, 0.32, "#f4eee1", 3);
  }
  // Pit wall with concrete base, blue/white F1 pit-wall stripe, and top safety fence posts
  const wOff = barrierOffset();
  // Yellow/black impact attenuator nose at pit wall start
  box(-55.2, wOff, 0.58, 0.68, 1.05, 1.8, "#eab308");
  box(-54.2, wOff, 0.62, 0.52, 1.12, 1.2, "#1e293b");
  for (let s = -53; s < 204; s += 4) {
    box(s, wOff, 0.55, 0.36, 1.0, 4.05, "#cbd5e1");
    box(s, wOff, 1.12, 0.38, 0.22, 4.05, Math.floor(s / 8) % 2 === 0 ? "#1d4ed8" : "#f8fafc");
    if (s % 8 === -53 % 8) {
      box(s, wOff + 0.08, 1.85, 0.1, 1.3, 0.1, "#475569");
    }
  }
  for (let s = -60; s < 205; s += 8)
    box(s, 30.3, 0.18, 0.16, 0.025, 3.6, "#e9deba");
  for (const s of [-65, 225]) {
    box(s, 26, 0.18, 9.5, 0.04, 0.38, "#f3cf59");
    box(s, 20.5, 1.4, 0.14, 2.8, 0.14, "#e8e8ce");
  }
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial(),
    boxes.length,
  );
  boxes.forEach((b, i) => {
    temp.position.set(b.x, b.y, b.z);
    temp.rotation.set(0, b.heading, 0);
    temp.scale.set(b.w, b.h, b.d);
    temp.updateMatrix();
    mesh.setMatrixAt(i, temp.matrix);
    mesh.setColorAt(i, color.set(b.c));
  });
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.name = "pit-buildings-equipment-markings";
  mesh.computeBoundingSphere();
  root.add(mesh);
  // Six garage labels use one atlas/material (not six separate textures).
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  pitLayout().forEach((b, i) => {
    const y0 = i * 64;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, y0, 1024, 64);
    ctx.fillStyle = b.color;
    ctx.fillRect(0, y0, 150, 64);
    ctx.fillRect(874, y0, 150, 64);
    ctx.fillRect(0, y0 + 56, 1024, 8);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`0${i + 1}`, 75, y0 + 43);
    ctx.fillText(`GARAGE`, 949, y0 + 41);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 34px Arial";
    ctx.fillText(`${b.name}`, 512, y0 + 43);
  });
  const atlas = new THREE.CanvasTexture(canvas),
    material = new THREE.MeshBasicMaterial({
      map: atlas,
      side: THREE.DoubleSide,
    });
  pitLayout().forEach((b, i) => {
    const g = new THREE.PlaneGeometry(Math.min(22, b.garageLength - 2), 1.25),
      u = g.attributes.uv;
    for (let v = 0; v < u.count; v++)
      u.setY(v, 1 - (i + 1) / 6 + u.getY(v) / 6);
    const sign = new THREE.Mesh(g, material);
    const p = pitPoint(b.s, 41.52);
    sign.position.set(p.x, 5.7, p.z);
    sign.rotation.y = b.heading - Math.PI / 2;
    root.add(sign);
  });
  for (const [s, text] of [
    [-65, "PIT LIMIT 65"],
    [225, "YIELD / SAÍDA"],
  ]) {
    const p = pitPoint(s, 20.5);
    const h = at(s).heading;
    const matSign = new THREE.MeshBasicMaterial({
      map: world.sign(text, 256, 64, "#fef08a", "#0f172a"),
    });
    for (const [fOff, rot] of [
      [-0.08, Math.PI],
      [0.08, 0],
    ]) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.15), matSign);
      sign.position.set(
        p.x + Math.sin(h) * fOff,
        2.7,
        p.z + Math.cos(h) * fOff,
      );
      sign.rotation.y = h + rot;
      root.add(sign);
    }
  }
  world.crew = new PitCrew(root);
  world.pitCrew = world.crew.root;
  batchScenery(root, [world.pitCrew]);
  return root;
}
export class PitCrew {
  constructor(scene) {
    this.root = new THREE.Group();
    this.root.name = "pooled-pit-crew";
    scene.add(this.root);
    this.last = new Float64Array(6).fill(-100);
    this.states = new Array(6);
    this.active = new Array(6).fill(null);
    this.lastPhase = new Float64Array(6).fill(-1);
    this.base = { x: 0, z: 0, heading: 0 };
    // 6 people × 8 components × 6 bays; four wheel specialists, jack and release.
    this.crewPerBay = 8;
    this.partsPerCrew = 8;
    this.bodies = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial(),
      6 * this.crewPerBay * this.partsPerCrew + 6 * 6,
    );
    this.helmets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.195, 6, 5),
      new THREE.MeshLambertMaterial(),
      6 * this.crewPerBay,
    );
    this.guns = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.055, 0.075, 0.42, 6),
      new THREE.MeshLambertMaterial(),
      6 * 4,
    );
    this.wheels = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.56, 0.56, 0.4, 10),
      new THREE.MeshLambertMaterial({ color: "#1c2229" }),
      6 * 8,
    );
    this.bands = new THREE.InstancedMesh(
      new THREE.TorusGeometry(0.49, 0.028, 4, 10),
      new THREE.MeshLambertMaterial(),
      48,
    );
    this.bands.frustumCulled = false;
    this.helmets.frustumCulled = false;
    this.guns.frustumCulled = false;
    this.bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.helmets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.guns.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.wheels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bodies.frustumCulled = this.wheels.frustumCulled = false;
    this.root.add(this.bands, this.bodies, this.helmets, this.guns, this.wheels);
    for (const b of pitLayout()) this.pose(b, null, 0);
  }
  part(index, b, x, y, z, w, h, d, c, turn = 0, pitch = 0) {
    const sn = Math.sin(b.heading),
      cs = Math.cos(b.heading);
    temp.position.set(b.x + cs * x + sn * z, y, b.z - sn * x + cs * z);
    temp.rotation.set(pitch, b.heading + turn, 0);
    temp.scale.set(w, h, d);
    temp.updateMatrix();
    this.bodies.setMatrixAt(index, temp.matrix);
    this.bodies.setColorAt(index, color.set(c));
  }
  pose(b, car, time) {
    const state = car?.pit.state || "idle",
      service = state === "service",
      approaching = state === "entry" || state === "queue",
      release = car && ["release", "exit"].includes(state),
      phase = service ? car.pit.phase : 0;
    const work = service && phase > 0.10 && phase < 0.86,
      gunSignal = service && phase >= 0.82,
      extension = work ? 1 : approaching ? 0.35 : 0;
    // Follow the physically parked car's measured pose, not a snapped model.
    const base = this.base;
    const parked = car && (service || state === "release");
    base.x = parked ? car.x : b.x;
    base.z = parked ? car.z : b.z;
    base.heading = parked ? car.heading : b.heading;
    const cs = Math.cos(base.heading),
      sn = Math.sin(base.heading);

    // 8 specialized crew roles per bay:
    // 0..3: 4 Wheel gun & tire mechanics (FL, FR, RL, RR)
    // 4: Front Jack operator
    // 5: Chief Lollipop / Release controller
    // 6: Rear Jack operator
    // 7: Front Wing / Stabilizer specialist
    const stations = [
      [-2.35, 1.62],
      [2.35, 1.62],
      [-2.35, -1.66],
      [2.35, -1.66],
      [0, 3.45],
      [3.35, 4.65],
      [0, -3.35],
      [-2.75, 0.05],
    ];
    for (let j = 0; j < this.crewPerBay; j++) {
      let [x, z] = stations[j];
      if (work && j < 4) {
        // Kneel and step closer to the wheel hub during tire swap
        const hubReach = smoothPhase(phase, 0.12, 0.28) * (1 - smoothPhase(phase, 0.76, 0.92));
        x += (x > 0 ? -1 : 1) * hubReach * 0.32;
      } else if (!service && !release && !approaching) {
        x = 9.8 + (j % 2) * 1.45;
        z = (Math.floor(j / 2) - 1.5) * 2.4;
      } else if (approaching) {
        x += (x > 0 ? 0.45 : -0.45);
      }
      const isWheelCrew = j < 4;
      const crouch = work && isWheelCrew ? 0.24 : 0;
      const y = 1.02 - crouch;
      const reach = work
        ? Math.sin(time * 13 + j) * 0.07 + (phase - 0.35) * 0.08
        : 0;
      const k = (b.id * this.crewPerBay + j) * this.partsPerCrew;
      const inward = x >= 0 ? -1 : 1;
      const turn = isWheelCrew
        ? inward * (Math.PI / 2)
        : j === 4
          ? Math.PI
          : j === 6
            ? 0
            : -0.45;

      // k+0: Sculpted racing suit torso with team colour
      this.part(
        k,
        base,
        x,
        y,
        z,
        0.42,
        0.62,
        0.28,
        b.color,
        0,
        work && isWheelCrew ? 0.18 : 0,
      );
      // k+1: Fireproof balaclava neck + shoulder yoke stripe
      this.part(k + 1, base, x, y + 0.34, z, 0.44, 0.12, 0.3, "#f8fafc");
      // k+2: Dark tinted helmet visor shield
      const visorX = x + (isWheelCrew ? inward * 0.16 : 0);
      const visorZ = z + (j === 4 ? -0.17 : j === 6 ? 0.17 : -0.16);
      this.part(k + 2, base, visorX, y + 0.52, visorZ, 0.28, 0.11, 0.08, "#0f172a");

      // Spherical 3D crew helmet
      const helmetIdx = b.id * this.crewPerBay + j;
      temp.position.set(
        base.x + cs * x + sn * z,
        y + 0.52,
        base.z - sn * x + cs * z,
      );
      temp.rotation.set(0, base.heading + turn, 0);
      temp.scale.set(0.96, 1.02, 1.06);
      temp.updateMatrix();
      this.helmets.setMatrixAt(helmetIdx, temp.matrix);
      this.helmets.setColorAt(
        helmetIdx,
        color.set(j === 5 ? "#f8fafc" : b.color),
      );

      // k+3, k+4: Articulated fireproof suit legs & pit boots (always above ground y >= 0.08)
      for (let leg = 0; leg < 2; leg++) {
        const legOff = leg ? -0.12 : 0.12;
        const legH = work && isWheelCrew ? 0.48 : 0.64;
        const legY = work && isWheelCrew ? 0.28 : 0.36;
        this.part(
          k + 3 + leg,
          base,
          x + legOff,
          legY,
          z + (work && isWheelCrew && leg === 0 ? -0.12 : 0),
          0.15,
          legH,
          0.19,
          "#1e293b",
        );
      }

      // k+5: Primary working arm (must animate continuously during service for k=0 -> index 5!)
      this.part(
        k + 5,
        base,
        x + inward * (0.27 + extension * 0.22),
        gunSignal && isWheelCrew ? y + 0.36 : y - 0.06,
        z + reach,
        0.36 + extension * 0.34,
        0.14,
        0.15,
        b.color,
      );
      // k+6: Secondary support arm
      this.part(
        k + 6,
        base,
        x + inward * (0.18 + extension * 0.14),
        y - 0.1,
        z + (isWheelCrew ? (j < 2 ? -0.16 : 0.16) : 0),
        0.28 + extension * 0.18,
        0.14,
        0.15,
        b.color,
      );
      // k+7: Gloved hands / Lollipop release sign / Jack handle grip
      this.part(
        k + 7,
        base,
        x + inward * (0.52 + extension * 0.38),
        j === 5 ? 2.42 : gunSignal && isWheelCrew ? y + 0.56 : y - 0.08,
        z + reach * 0.6,
        j === 5 ? 0.22 : 0.16,
        j === 5 ? 0.68 : 0.16,
        j === 5 ? 0.64 : 0.18,
        j === 5 ? (release ? "#10b981" : "#ef4444") : "#f8fafc",
      );

      // 3D cylindrical pneumatic wheel gun for mechanics 0..3
      if (isWheelCrew) {
        const gunIdx = b.id * 4 + j;
        const gx = x + inward * (0.58 + extension * 0.36);
        const gy = gunSignal ? y + 0.54 : y - 0.09;
        const gz = z + reach * 0.8;
        temp.position.set(
          base.x + cs * gx + sn * gz,
          gy,
          base.z - sn * gx + cs * gz,
        );
        temp.rotation.set(0, base.heading, Math.PI / 2);
        temp.scale.set(1, 1, 1);
        temp.updateMatrix();
        this.guns.setMatrixAt(gunIdx, temp.matrix);
        this.guns.setColorAt(
          gunIdx,
          color.set(work ? "#38bdf8" : "#94a3b8"),
        );
      }
    }

    // Front & Rear Hydraulic Quick-Lift Jacks (6 instances per bay)
    const jackBase = 6 * this.crewPerBay * this.partsPerCrew + b.id * 6;
    const lift = serviceLift(car?.pit);
    const fJackX = service ? 0 : 11.8,
      fJackZ = service ? 2.72 : 4.8;
    this.part(jackBase, base, fJackX, 0.22, fJackZ, 0.56, 0.14, 1.42, "#dc2626");
    this.part(
      jackBase + 1,
      base,
      fJackX,
      0.28 + 0.14 * lift,
      fJackZ - 0.38,
      0.44,
      0.16,
      0.5,
      "#cbd5e1",
    );
    this.part(
      jackBase + 2,
      base,
      fJackX,
      0.64,
      fJackZ + 0.44,
      0.08,
      0.86,
      0.1,
      "#94a3b8",
    );

    const rJackX = service ? 0 : 11.8,
      rJackZ = service ? -2.65 : -4.8;
    this.part(jackBase + 3, base, rJackX, 0.22, rJackZ, 0.54, 0.14, 1.32, "#dc2626");
    this.part(
      jackBase + 4,
      base,
      rJackX,
      0.28 + 0.14 * lift,
      rJackZ + 0.36,
      0.42,
      0.16,
      0.48,
      "#cbd5e1",
    );
    this.part(
      jackBase + 5,
      base,
      rJackX,
      0.64,
      rJackZ - 0.42,
      0.08,
      0.86,
      0.1,
      "#94a3b8",
    );

    // 8 Spare Tires (4 worn removed tires + 4 fresh installed tires) synchronized with pit phase
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1,
        z = i % 4 < 2 ? 1.61 : -1.64,
        old = i < 4;
      let x =
        side *
        (old
          ? 1.42 + smoothPhase(phase, 0.16, 0.52) * 1.75
          : 3.35 - smoothPhase(phase, 0.44, 0.80) * 1.93);
      const wheelY = service
        ? old
          ? 0.59 - smoothPhase(phase, 0.42, 0.58) * 0.03
          : 0.56 + smoothPhase(phase, 0.44, 0.76) * 0.03
        : 0.58;
      if (!service) x = 11.8 + (i % 2) * 1.25;
      temp.position.set(
        base.x + cs * x + sn * z,
        wheelY,
        base.z - sn * x + cs * z,
      );
      temp.rotation.set(0, base.heading, Math.PI / 2);
      temp.scale.setScalar(service ? 1 : 0.95);
      temp.updateMatrix();
      this.wheels.setMatrixAt(b.id * 8 + i, temp.matrix);
      temp.position.x += cs * (side * 0.21);
      temp.position.z -= sn * (side * 0.21);
      temp.rotation.set(0, base.heading + Math.PI / 2, 0);
      temp.updateMatrix();
      this.bands.setMatrixAt(b.id * 8 + i, temp.matrix);
      this.bands.setColorAt(
        b.id * 8 + i,
        color.set(
          compounds[
            old
              ? car?.pit.oldCompound || "medium"
              : car?.pit.work?.compound || "medium"
          ].color,
        ),
      );
    }
    this.bodies.instanceMatrix.needsUpdate = true;
    this.bodies.instanceColor.needsUpdate = true;
    this.helmets.instanceMatrix.needsUpdate = true;
    this.helmets.instanceColor.needsUpdate = true;
    this.guns.instanceMatrix.needsUpdate = true;
    this.guns.instanceColor.needsUpdate = true;
    this.wheels.instanceMatrix.needsUpdate = true;
    this.bands.instanceMatrix.needsUpdate = true;
    this.bands.instanceColor.needsUpdate = true;
  }
  update(drivers, camera, time, detail = 1) {
    this.active.fill(null);
    for (const c of drivers) if (c.pit?.ownsBay) this.active[c.teamId] = c;
    let near = false;
    for (const b of pitLayout()) {
      const c = this.active[b.id],
        d = Math.hypot(camera.position.x - b.x, camera.position.z - b.z);
      if (d < 180 * detail) near = true;
      const state = c?.pit.state || "idle";
      const changed = this.states[b.id] !== state;
      if (
        changed ||
        (d < 180 * detail &&
          c?.pit.state === "service" &&
          (c.pit.phase !== this.lastPhase[b.id] ||
            time - this.last[b.id] >
              (d < 65 ? 1 / (detail < 0.8 ? 15 : 30) : 0.2)))
      ) {
        this.pose(
          b,
          c,
          c?.pit.state === "service" ? c.pit.total - c.pit.remaining : 0,
        );
        this.states[b.id] = state;
        this.last[b.id] = time;
        this.lastPhase[b.id] = c?.pit.phase ?? -1;
      }
    }
    this.root.visible = near;
  }
}
function smoothPhase(t, a, b) {
  return Math.max(0, Math.min(1, (t - a) / (b - a)));
}
