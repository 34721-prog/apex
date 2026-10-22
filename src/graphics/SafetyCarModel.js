import { batchModel } from "../optimize.js";
import * as THREE from "three";
// Original low-poly marshal GT coupe. Built once per World, never per frame.
export function makeSafetyCar() {
  const root = new THREE.Group();
  const body = new THREE.MeshLambertMaterial({ color: "#e3e9ec" });
  const glass = new THREE.MeshLambertMaterial({ color: "#1e3246" });
  const rubber = new THREE.MeshLambertMaterial({ color: "#141920" });
  const amber = new THREE.MeshBasicMaterial({ color: "#ffad31" });
  const white = new THREE.MeshBasicMaterial({ color: "#edf7ff" });
  const red = new THREE.MeshBasicMaterial({ color: "#ef3753" });
  const box = (x, y, z, w, h, l, material, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    root.add(mesh);
    return mesh;
  };
  // Lower GT chassis, sculpted hood, fastback greenhouse, and rear deck
  box(0, 0.56, 0, 2.66, 0.58, 4.82, body);
  box(0, 0.84, 1.48, 2.52, 0.22, 1.65, body, 0.1, 0, 0);
  box(0, 1.06, -0.18, 2.12, 0.58, 2.32, glass);
  box(0, 1.38, -0.26, 2.04, 0.12, 1.88, body);
  box(0, 0.88, -1.65, 2.54, 0.24, 1.25, body, -0.08, 0, 0);
  // Carbon front splitter, front grille, and rear GT diffuser
  box(0, 0.28, 2.48, 2.68, 0.08, 0.26, rubber);
  box(0, 0.52, 2.43, 1.68, 0.28, 0.08, rubber);
  box(0, 0.34, -2.44, 2.58, 0.22, 0.14, rubber);
  // GT Rear Wing with twin stanchions and endplates
  for (const sx of [-0.62, 0.62]) {
    box(sx, 1.12, -2.18, 0.06, 0.32, 0.22, rubber, 0.15, 0, 0);
  }
  box(0, 1.26, -2.24, 2.48, 0.06, 0.34, rubber, 0.12, 0, 0);
  for (const sx of [-1.25, 1.25]) {
    box(sx, 1.24, -2.24, 0.05, 0.22, 0.42, amber);
  }
  for (const x of [-1.34, 1.34]) {
    box(x, 0.61, 0, 0.03, 0.15, 4.46, amber);
    box(x * 0.96, 0.31, 0, 0.12, 0.08, 2.9, rubber);
    box(x, 1.13, -0.3, 0.04, 0.52, 0.1, body);
    box(x * 1.065, 1.02, 0.78, 0.28, 0.14, 0.26, body);
  }
  for (const x of [-0.94, 0.94]) {
    box(x, 0.75, 2.42, 0.54, 0.16, 0.05, white, 0, Math.sign(x) * 0.08, 0);
    box(x, 0.77, -2.42, 0.54, 0.16, 0.05, red);
  }
  box(0, 1.48, -0.15, 1.72, 0.07, 0.42, rubber);
  root.userData.beacon = box(0, 1.59, -0.15, 1.65, 0.14, 0.35, amber);
  const wheelGeometry = new THREE.CylinderGeometry(0.43, 0.43, 0.32, 18);
  const hubGeometry = new THREE.CylinderGeometry(0.26, 0.26, 0.33, 12);
  for (const x of [-1.3, 1.3])
    for (const z of [-1.55, 1.55]) {
      const wheel = new THREE.Mesh(wheelGeometry, rubber);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.43, z);
      const hub = new THREE.Mesh(hubGeometry, body);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      root.add(wheel, hub);
    }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#152332";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#ffbf52";
  ctx.textAlign = "center";
  ctx.font = "bold 47px sans-serif";
  ctx.fillText("SAFETY CAR", 256, 70);
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#ecf1f7";
  ctx.fillText("APEX / RACE CONTROL", 256, 106);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.85, 0.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }),
  );
  plate.position.set(0, 0.68, -2.428);
  plate.rotation.y = Math.PI;
  root.add(plate);
  root.name = "physical-safety-car";
  // Batch solid parts once; retain the animated beacon and textured plate.
  const beacon = root.userData.beacon;
  root.remove(beacon, plate);
  const model = batchModel(root);
  model.add(beacon, plate);
  model.userData.beacon = beacon;
  beacon.castShadow = true;
  const obsolete = new Set();
  root.traverse((o) => {
    if (o.geometry) obsolete.add(o.geometry);
  });
  for (const geometry of obsolete) geometry.dispose();
  return model;
}
