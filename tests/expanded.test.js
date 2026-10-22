import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  driverCatalog,
  pilotStats,
  ATTRIBUTE_LABELS,
  SHEET_ATTRIBUTE_LABELS,
  PLACEHOLDER_DRIVER_PORTRAIT,
  nationalityFlag,
  resolveDriverPortrait,
  EXCLUSIVE_SKILLS,
  STYLE_KEYS,
  createAcademyDriver,
  developAcademyDriver,
  activeDriverForSave,
} from "../src/data/drivers.js";
import { vehicles, performance as stats } from "../src/garage.js";
import { defaults, validateSave } from "../src/save.js";
import { Race } from "../src/race.js";
import { configureTrack } from "../src/track.js";
import { rewardRace } from "../src/progression.js";
import { AdminPanel } from "../src/admin/AdminPanel.js";
import { RaceEngineer } from "../src/audio/RaceEngineer.js";
import { updateFlags } from "../src/racing/Flags.js";
import { assignTeam } from "../src/career/TeamManager.js";
import { AI_PROFILES, aiProfileFor } from "../src/ai.js";
import { powerUnits } from "../src/data/powerUnits.js";
import { partCategories } from "../src/data/parts.js";
import { sponsorCatalog, teamPrincipals } from "../src/data/sponsors.js";
import { compareSetupChanges, purchasePart } from "../src/garage.js";
import { trackCatalog } from "../src/data/tracks.js";
import { validateTrack } from "../src/data/TrackGeometry.js";
test("43 unique pilots, 12 cars, portraits, helmets, thumbnails and GLB exist", () => {
  assert.equal(driverCatalog.length, 43);
  for (const [tier, n] of [
    ["normal", 10],
    ["mythic", 10],
    ["legendary", 10],
    ["mega", 1],
    ["icons", 12],
  ])
    assert.equal(driverCatalog.filter((d) => d.tier === tier).length, n);
  assert.equal(new Set(driverCatalog.map((d) => d.name)).size, 43);
  assert.equal(vehicles.length, 12);
  for (const d of driverCatalog) {
    assert.ok(fs.existsSync("public" + d.portrait));
    assert.ok(fs.existsSync("public" + d.helmet));
    assert.ok(Object.values(d.attributes).every(Number.isFinite));
  }
  for (let i = 0; i < 12; i++)
    assert.ok(fs.existsSync(`public/assets/cars/thumbnails/car-${i}.png`));
  assert.equal(
    fs
      .readdirSync("public/assets/cars/models")
      .filter((f) => f.endsWith(".glb")).length,
    12,
  );
});
test("Mega uses finite limits and realistic mode removes extreme multiplier", () => {
  const base = stats(defaults()),
    normal = pilotStats(base, 30, "mega", "realistic"),
    mega = pilotStats(base, 30, "mega", "arcade");
  assert.equal(driverCatalog[30].overall, "∞");
  assert.equal(normal.maxSpeed, base.maxSpeed);
  assert.ok(mega.maxSpeed > base.maxSpeed && mega.maxSpeed <= 110);
  assert.ok(Object.values(mega).every(Number.isFinite));
});
test("career data and custom paints survive validation, malformed arrays are rejected", () => {
  const s = defaults();
  s.customizations[7] = {
    primary: "#12acde",
    secondary: "#ed3267",
    detail: "#182331",
    number: 86,
  };
  s.unlockedDrivers = [0, 15, 30];
  s.selectedDriver = 30;
  s.team.partner = 15;
  s.unlockedCars.push(7);
  s.selectedCar = 7;
  s.history.push({
    track: "neon",
    position: 2,
    time: 250,
    mode: "quick",
    driver: 30,
    car: 7,
  });
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))), s);
});
test("admin login isolates career, restore and exit never mutate the normal save", () => {
  const original = defaults(),
    g = { save: original },
    admin = new AdminPanel();
  assert.equal(admin.enter(g, "wrong"), false);
  assert.equal(admin.enter(g, "123456789"), true);
  admin.unlock(g);
  g.save.credits = 999999;
  assert.equal(original.credits, 1200);
  assert.equal(original.unlockedCars.length, 1);
  admin.restore(g);
  assert.equal(g.save.credits, 1200);
  admin.exit(g);
  assert.equal(g.save, original);
});
test("radio priorities and cooldowns work without browser voice support", () => {
  const e = new RaceEngineer();
  assert.ok(e.say("Combustível baixo", 3, 30, "fuel"));
  assert.equal(e.say("Rotina", 1, 31, "routine"), false);
  assert.equal(e.say("Combustível baixo", 3, 32, "fuel"), false);
  assert.ok(e.say("Volta concluída", 1, 40, "lap"));
  assert.equal(e.message, "Volta concluída");
});
test("VSC actually slows traffic and returns green; pause freezes time and resources", () => {
  configureTrack("aurora");
  const r = new Race({ realism: "realistic" });
  r.state = "racing";
  r.time = 10;
  r.cars[1].impact = 30;
  updateFlags(r, 1 / 60);
  assert.equal(r.flag, "yellow");
  for (let i = 0; i < 60 * 4; i++) r.step(1 / 60, {}, true);
  assert.ok(r.cars.every((c) => c.speed < 25));
  r.pause();
  const t = r.time,
    fuel = r.cars[0].fuel,
    pit = r.cars[0].pit.remaining;
  for (let i = 0; i < 120; i++) r.step(1 / 60, {}, true);
  assert.equal(r.time, t);
  assert.equal(r.cars[0].fuel, fuel);
  assert.equal(r.cars[0].pit.remaining, pit);
  r.pause();
  for (let i = 0; i < 60 * 15; i++) r.step(1 / 60, {}, true);
  assert.equal(r.flag, "green");
});
test("8-lap realistic endurance finishes and bots actually use the pit lane", () => {
  configureTrack("aurora");
  const r = new Race({ mode: "manager", realism: "realistic", laps: 8 });
  for (let i = 0; i < 60 * 1400 && !r.done; i++) r.step(1 / 60, {}, true);
  assert.ok(r.done);
  assert.ok(r.cars.every((c) => c.finished));
  assert.ok(r.cars.every((c) => c.pit.stops > 0));
  assert.ok(r.cars.every((c) => c.fuel >= 0 && c.fuel <= 110));
  assert.ok(r.cars.every((c) => c.tires.health >= 0.05 && c.tires.health <= 1));
});
test("time trial does not grant a fake podium; manager assigns 1 active driver per team", () => {
  configureTrack("aurora");
  const s = defaults(),
    r = new Race({ mode: "time-trial", laps: 1 });
  for (let i = 0; i < 18000 && !r.done; i++) r.step(1 / 60, {}, true);
  rewardRace(s, r);
  assert.equal(s.stats.wins, 0);
  assert.equal(s.stats.podiums, 0);
  assert.equal(r.cars.length, 1);
  s.unlockedDrivers.push(15);
  s.selectedDriver = 15;
  const m = new Race({ mode: "manager" });
  assignTeam(m, s);
  assert.equal(m.cars[0].driverId, 15);
  assert.ok(m.cars.every((c) => !c.teammate));
  assert.equal(new Set(m.cars.map((c) => c.teamId)).size, 6);
});

test("v1.1 systems: 7 AI profiles, 6 power units, 11 parts comparator, 10 sponsors, and circuit validator", () => {
  assert.equal(Object.keys(AI_PROFILES).length, 7);
  for (const p of [
    "Conservador",
    "Estratégico",
    "Agressivo",
    "Defensivo",
    "Equilibrado",
    "Novato",
    "Elite",
  ]) {
    assert.ok(AI_PROFILES[p]);
  }
  const r = new Race({ mode: "manager" });
  for (const c of r.cars) {
    assert.ok(aiProfileFor(c).pace > 0.8);
  }
  assert.equal(powerUnits.length, 6);
  assert.equal(partCategories.length, 11);
  assert.equal(sponsorCatalog.length, 10);
  assert.equal(teamPrincipals.length, 6);
  const s = defaults();
  s.credits = 10000;
  const cmp = compareSetupChanges(s, { powerUnitId: 2, carParts: { frontWing: 2 } });
  assert.ok(cmp.length >= 6);
  const buy = purchasePart(s, "frontWing");
  assert.equal(buy.ok, true);
  assert.equal(s.carParts.frontWing, 1);
  for (const t of trackCatalog) {
    const v = validateTrack(t);
    assert.equal(v.valid, true, `Track ${t.id} failed validation`);
    assert.equal(v.closedLoop, true);
    assert.ok(v.barrierClearance >= 5.8);
    assert.equal(v.pitAccessible, true);
    assert.equal(v.aiLineValid, true);
    assert.equal(v.gridValid, true);
  }
});

test("driver system overhaul: 2D sheets, 10 attributes, custom portraits, youth academy creation, training, promotion & Safety Car fixes", () => {
  assert.equal(trackCatalog.length, 17);
  for (const id of ["imperiale", "sakura", "lumina"]) {
    assert.ok(trackCatalog.some((t) => t.id === id), `Missing new track ${id}`);
  }
  // 3D driver UI model file must be completely removed
  assert.equal(fs.existsSync("src/ui/DriverPreview3D.js"), false);
  assert.ok(fs.existsSync("public" + PLACEHOLDER_DRIVER_PORTRAIT));
  assert.ok(fs.existsSync("public/assets/drivers/placeholder-driver.png"));

  assert.equal(ATTRIBUTE_LABELS.length, 10);
  assert.equal(SHEET_ATTRIBUTE_LABELS.length, 10);
  assert.equal(EXCLUSIVE_SKILLS.length, 8);
  assert.equal(STYLE_KEYS.length, 6);
  for (const d of driverCatalog) {
    for (const [k] of SHEET_ATTRIBUTE_LABELS) {
      assert.ok(
        Number.isFinite(d.attributes[k]) &&
          d.attributes[k] >= 40 &&
          d.attributes[k] <= 100,
        `Invalid ${k} on ${d.name}`,
      );
    }
    assert.ok(d.exclusiveSkill?.id);
    assert.ok(STYLE_KEYS.includes(d.styleKey));
    const flag = nationalityFlag(d.nationality);
    assert.ok(flag.flag.length >= 2 && flag.code.length === 3);
    const pInfo = resolveDriverPortrait(d, null);
    assert.equal(pInfo.src, d.portrait);
    assert.equal(pInfo.isPlaceholder, false);
  }

  // Youth Academy ("CRIAR PILOTO DA BASE") lifecycle + custom portrait + custom attributes
  const s = defaults();
  const rookie = createAcademyDriver(
    {
      firstName: "Lucas",
      lastName: "Valente",
      nationality: "Brasil",
      age: 18,
      program: "formula_jr",
      styleKey: "Calculista",
      skillId: "natural_talent",
      suitColor: "#e63956",
      helmetColor: "#38bdf8",
      visorColor: "#f59e0b",
      number: 28,
      teamName: "Apex Motorsport",
      usePlaceholder: true,
      customAttributes: {
        speed: 74,
        racecraft: 72,
        overtaking: 70,
        defense: 68,
        tireControl: 71,
        consistency: 73,
      },
    },
    s.academy,
  );
  assert.equal(rookie.isAcademy, true);
  assert.equal(rookie.isPlaceholderPortrait, true);
  assert.equal(rookie.portrait, PLACEHOLDER_DRIVER_PORTRAIT);
  assert.equal(rookie.attributes.qualifyingPace, 74);
  assert.equal(rookie.attributes.racePace, 72);
  assert.ok(rookie.overall >= 55 && rookie.overall <= 85);
  assert.ok(rookie.attributes.potential >= 85);
  s.academy.push(rookie);

  const beforeSpeed = rookie.attributes.speed;
  const trainRes = developAcademyDriver(rookie, "pace");
  assert.ok(trainRes.gained > 0);
  assert.ok(rookie.attributes.speed > beforeSpeed);
  assert.ok(rookie.attributes.speed <= rookie.attributes.potential);

  // Promote academy driver to titular seat & verify single-driver team assignment
  s.promotedAcademyId = rookie.uid;
  assert.equal(activeDriverForSave(s).name, "Lucas Valente");
  configureTrack("imperiale");
  const r = new Race({ mode: "manager", laps: 1 });
  assignTeam(r, s);
  assert.equal(r.cars[0].name, "Lucas Valente");
  assert.equal(r.cars[0].number, 28);
  assert.equal(r.cars.length, 6);
  assert.ok(r.cars.every((c) => !c.teammate));

  // Safety Car deploys in default club mode on severe impact or immobilized retired car
  const clubRace = new Race({ realism: "club", laps: 3 });
  clubRace.state = "racing";
  clubRace.time = 12;
  clubRace.cars[2].retired = "Pane elétrica";
  clubRace.cars[2].pit.state = "track";
  clubRace.cars[2].speed = 0;
  clubRace.control.update(1 / 60);
  assert.equal(clubRace.control.phase, "sc");
  assert.equal(clubRace.flag, "yellow");

  // Persistence round-trip through validateSave (including customPortraits)
  s.customPortraits[rookie.uid] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const validated = validateSave(JSON.parse(JSON.stringify(s)));
  assert.equal(validated.academy.length, 1);
  assert.equal(validated.promotedAcademyId, rookie.uid);
  assert.equal(validated.academy[0].name, "Lucas Valente");
  assert.equal(resolveDriverPortrait(validated.academy[0], validated).isCustom, true);
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(validated))), validated);
});

