import {
  at,
  angle,
  curvature,
  headingAt,
  length,
  TRACK_WIDTH,
} from "./track.js";
import { defaultStrategy, policyFor } from "./strategy/RaceStrategy.js";
import { signedPitS } from "./strategy/PitLayout.js";
export const AI_PROFILES = {
  Conservador: {
    id: "Conservador",
    label: "Conservador",
    pace: 0.988,
    aggression: 0.82,
    defense: 1.0,
    consistency: 0.85,
    description: "Protege pneus e evita riscos em disputas fechadas.",
  },
  Estratégico: {
    id: "Estratégico",
    label: "Estratégico",
    pace: 1.004,
    aggression: 0.95,
    defense: 1.05,
    consistency: 0.78,
    description: "Calcula paradas e administra ritmo ao longo do stint.",
  },
  Agressivo: {
    id: "Agressivo",
    label: "Agressivo",
    pace: 1.012,
    aggression: 1.18,
    defense: 1.05,
    consistency: 1.12,
    description: "Tenta ultrapassagens decididas e força disputas.",
  },
  Defensivo: {
    id: "Defensivo",
    label: "Defensivo",
    pace: 0.995,
    aggression: 0.92,
    defense: 1.28,
    consistency: 0.82,
    description: "Fecha linha interna e dificulta a passagem.",
  },
  Equilibrado: {
    id: "Equilibrado",
    label: "Equilibrado",
    pace: 1.0,
    aggression: 1.0,
    defense: 1.0,
    consistency: 1.0,
    description: "Bom desempenho geral em todos os setores.",
  },
  Novato: {
    id: "Novato",
    label: "Novato",
    pace: 0.992,
    aggression: 1.08,
    defense: 0.9,
    consistency: 1.35,
    description: "Rápido em alguns trechos, mas mais sujeito a pequenos erros.",
  },
  Elite: {
    id: "Elite",
    label: "Elite",
    pace: 1.018,
    aggression: 1.1,
    defense: 1.16,
    consistency: 0.55,
    description: "Excelente ritmo, leitura de corrida e consistência.",
  },
};

export function aiProfileFor(car) {
  const key = car?.personality?.aiProfile || car?.aiProfile || "Equilibrado";
  return AI_PROFILES[key] || AI_PROFILES.Equilibrado;
}

export const difficulties = {
  easy: {
    label: "Fácil",
    pace: 0.81,
    precision: 0.93,
    consistency: 0.042,
    reaction: 0.48,
  },
  normal: {
    label: "Normal",
    pace: 0.92,
    precision: 0.985,
    consistency: 0.02,
    reaction: 0.3,
  },
  hard: {
    label: "Difícil",
    pace: 0.985,
    precision: 1,
    consistency: 0.008,
    reaction: 0.22,
  },
  elite: {
    label: "Elite",
    pace: 1.01,
    precision: 1.025,
    consistency: 0.003,
    reaction: 0.15,
  },
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const trackGap = (a, b) =>
  ((b.s - a.s + length * 1.5) % length) - length / 2;
export function trafficRelevant(o) {
  return (
    !o.finished &&
    (!o.pit ||
      o.pit.state === "track" ||
      (o.pit.state === "exit" &&
        signedPitS(o.s) > 245 &&
        Math.abs(o.lateral) < TRACK_WIDTH / 2 + 8))
  );
}
export function laneClear(car, cars, lane) {
  const lo = Math.min(car.lateral, lane) - 3.65,
    hi = Math.max(car.lateral, lane) + 3.65;
  for (const o of cars) {
    if (o === car || !trafficRelevant(o)) continue;
    const d = trackGap(car, o);
    const current = car.lateral - o.lateral,
      destination = lane - o.lateral;
    // Moving away from a neighbour cannot cut its occupied corridor.
    if (
      Math.abs(destination) > Math.abs(current) + 0.05 &&
      current * destination >= 0
    )
      continue;
    if (Math.abs(d) < 7.5 && o.lateral > lo && o.lateral < hi) return false;
    if (
      d > -Math.max(12, (o.speed - car.speed) * 1.8) &&
      d < 14 &&
      Math.abs(o.lateral - lane) < 3.65
    )
      return false;
  }
  return true;
}
export function botInput(car, cars, time, difficulty = "normal") {
  const mode = difficulties[difficulty] || difficulties.normal,
    p = car.personality || {
      aggression: 0.5,
      precision: 0.8,
      consistency: 0.8,
      overtaking: 0.7,
      defense: 0.7,
    };
  const strategy = car.strategy || (car.strategy = defaultStrategy()),
    policy = car.policy || (car.policy = policyFor(strategy));
  const a =
    car.ai ||
    (car.ai = {
      mode: "line",
      lane: car.id % 2 ? 1.8 : -1.8,
      until: 0,
      nextDecision: 0,
      defended: -1,
      changes: 0,
      lastBattle: -100,
    });
  let ahead = null,
    behind = null,
    near = 160,
    rear = 70,
    alongside = false,
    obstruction = null,
    obstacleDistance = 75;
  for (const o of cars) {
    if (o === car || !trafficRelevant(o)) continue;
    const d = trackGap(car, o);
    if (
      !o.isSafetyCar &&
      o.speed < 1 &&
      d > -9 &&
      d < obstacleDistance &&
      Math.abs(o.lateral - car.lateral) < 5
    ) {
      obstruction = o;
      obstacleDistance = d;
    }
    if (d >= 0 && d < near) {
      near = d;
      ahead = o;
    } else if (d < 0 && -d < rear) {
      rear = -d;
      behind = o;
    }
    if (Math.abs(d) < 7 && Math.abs(o.lateral - car.lateral) < 7)
      alongside = true;
  }
  if (
    a.curvatureS === undefined ||
    Math.abs(car.s - a.curvatureS) > 2 ||
    time - (a.curvatureTime || 0) > 0.08
  ) {
    // Distance-weighted kinematic braking lookahead prevents bots from braking 85m too early
    a.curvature = Math.max(
      curvature(car.s + 8),
      curvature(car.s + 25) * 0.93,
      curvature(car.s + 52) * 0.79,
      curvature(car.s + 85) * 0.62,
    );
    a.curvatureS = car.s;
    a.curvatureTime = time;
  }
  const curv = a.curvature;
  const maxLane = Math.min(4.1, TRACK_WIDTH / 2 - 2.1);
  const manager = car.stewards?.race.manager;
  const avoidTeamRisk =
    manager &&
    (manager.owns(car)
      ? car.stewards.race.teamOrder === "protect" ||
        (car.stewards.race.teamOrder !== "race" &&
          ahead?.teamId === car.teamId)
      : !!(car.rivalProtect && ahead?.teamId === car.teamId));
  // Withdraw a prohibited intent at a safe decision point; never snap across an occupied lane.
  if (
    a.mode === "overtake" &&
    !alongside &&
    (a.target === car.managerPlan?.avoid || avoidTeamRisk)
  ) {
    a.mode = "line";
    a.until = 0;
    a.nextDecision = 0;
  }
  if (time >= a.nextDecision) {
    a.nextDecision = time + mode.reaction * (1.15 - p.consistency * 0.25);
    if (
      near < 18 &&
      car.flag !== "yellow" &&
      car.stewards &&
      car.stewards.random() <
        0.002 *
          (p.skillId === "ice_veins" ? 0.35 : 1) *
          (1 - Math.min(1, p.pressure ?? 0.8)) *
          (1 - Math.min(1, p.experience ?? 0.8))
    ) {
      a.errorUntil = time + 0.65;
      car.stewards.race.emit(
        "driver-error",
        car.id,
        "Frenagem antecipada sob pressão",
      );
    }
    if (a.defended >= 0 && (!behind || rear > 50)) a.defended = -1;
    if (
      a.mode === "overtake" &&
      ahead?.id === a.target &&
      near < 65 &&
      time - a.attackStart < 9
    ) {
      a.until = Math.max(a.until, time + mode.reaction);
    }
    if (time >= a.until) {
      const turn = Math.sign(angle(headingAt(car.s + 40) - headingAt(car.s)));
      let baseline =
        (car.id % 2 ? 1.8 : -1.8) +
        (strategy.line === "ideal" && curv > 0.008 ? turn * 0.2 : 0);
      if (
        strategy.line === "exit" ||
        (strategy.defense === "exit" && curv > 0.008)
      )
        baseline = -turn * Math.min(2, maxLane * 0.65);
      if (strategy.line === "safe") baseline = car.id % 2 ? 1.5 : -1.5;
      let wanted = clamp(baseline, -maxLane, maxLane),
        next = "line";
      const score =
        clamp((car.speed - (ahead?.speed ?? car.speed) + 5) / 16, 0, 1) * 0.4 +
        (1 - Math.min(1, curv / policy.maxPassCurvature)) * 0.3 +
        p.overtaking * 0.25 +
        (p.cornering ?? p.precision ?? 0.8) * 0.1 +
        (p.skillId === "overtake_master" ? 0.045 : 0);
      if (
        ahead &&
        ahead.id !== car.managerPlan?.avoid &&
        !avoidTeamRisk &&
        near < policy.search &&
        Math.abs(ahead.lateral - car.lateral) < 4.2 &&
        curv < policy.maxPassCurvature &&
        score > policy.opportunity &&
        car.flag !== "yellow"
      ) {
        const preferred = ahead.lateral >= 0 ? -maxLane : maxLane;
        if (laneClear(car, cars, preferred)) {
          wanted = preferred;
          next = "overtake";
        } else if (
          strategy.line === "alternate" &&
          Math.abs(ahead.lateral + preferred) > 3.65 &&
          laneClear(car, cars, -preferred)
        ) {
          wanted = -preferred;
          next = "overtake";
        } else next = "follow";
      } else if (
        ahead &&
        near < 18 &&
        Math.abs(ahead.lateral - car.lateral) < 3.8
      )
        next = "follow";
      if (
        next === "line" &&
        behind &&
        rear <
          (policy.defendRange > 0
            ? policy.defendRange + (strategy.line === "defend" ? 8 : 0)
            : 0) &&
        !alongside &&
        car.flag !== "yellow" &&
        a.defended !== behind.id &&
        curv < (strategy.defense === "exit" ? 0.005 : 0.019)
      ) {
        const activeDefense =
          strategy.line === "defend" ||
          strategy.defense === "hold" ||
          p.aggression + (p.defense ?? 0.6) > 0.95;
        const block =
          strategy.defense === "conservative"
            ? (car.targetLane ?? car.lateral)
            : Math.sign(behind.lateral || 1) * Math.min(maxLane, 3.1);
        if (
          activeDefense &&
          (Math.abs(block - (car.targetLane ?? car.lateral)) < 0.2 ||
            laneClear(car, cars, block))
        ) {
          wanted = block;
          next = "defend";
          a.defended = behind.id;
        }
      }
      if (
        Math.abs(wanted - (car.targetLane ?? car.lateral)) > 0.35 &&
        !laneClear(car, cars, wanted)
      ) {
        wanted = car.targetLane ?? car.lateral;
        if (next === "overtake" || next === "defend") next = "follow";
      }
      if (Math.abs(wanted - a.lane) > 1) a.changes++;
      if (next === "overtake" && a.mode !== "overtake") {
        a.target = ahead.id;
        a.attackStart = time;
      }
      a.lane = wanted;
      a.mode = next;
      a.until =
        time +
        (next === "overtake" ? policy.commit : next === "defend" ? 3.5 : 1.2);
      if (next === "overtake" || next === "defend") a.lastBattle = time;
    }
  }
  if (car.flag === "yellow") {
    a.neutralLane ??= car.targetLane ?? car.lateral;
    a.lane = a.neutralLane;
    a.mode = "neutralized";
    if (obstruction || (ahead?.returnTo === car.id && near < 75)) {
      const sideSign = Math.sign(car.lateral || 1);
      for (const side of [sideSign * maxLane, -sideSign * maxLane])
        if (laneClear(car, cars, side)) {
          a.lane = side;
          a.mode = "avoid-incident";
          break;
        }
    }
  }
  if (car.blueFlag && laneClear(car, cars, -maxLane)) {
    a.lane = -maxLane;
    a.mode = "yield-blue";
  }
  if (car.flag !== "yellow") delete a.neutralLane;
  car.maneuver = a.mode;
  const jitter =
    Math.sin(time * 0.53 + car.id * 3.4) *
    mode.consistency *
    (2 - p.consistency) *
    2;
  let lane = clamp(a.lane + jitter, -maxLane, maxLane);
  car.targetLane ??= car.lateral;
  if (alongside && !laneClear(car, cars, lane)) lane = car.targetLane;
  // Bounded lateral target velocity; the actual car still obeys grip/inertia.
  car.targetLane += clamp(lane - car.targetLane, -0.028, 0.028);
  const look = 14 + car.speed * 0.34 + (strategy.line === "exit" ? 2 : 0),
    t = at(car.s + look);
  const delta = angle(
    Math.atan2(
      t.p.x + t.right.x * car.targetLane - car.x,
      t.p.z + t.right.z * car.targetLane - car.z,
    ) - car.heading,
  );
  let steering = clamp(
    (delta * 3.25 * mode.precision) /
      (0.35 + (Math.min(car.speed, 50) / 50) * 1.02),
    -1,
    1,
  );
  const cornerSpeed = Math.sqrt(
    ((15 - 5 * (car.wetness ?? (car.weather === "rain" ? 1 : 0))) *
      (car.tireGrip ?? 1) *
      (car.weather === "rain"
        ? 0.94 +
          0.06 * (p.wetSkill ?? 0.8) +
          (p.skillId === "rain_master" ? 0.025 : 0)
        : 1)) /
      Math.max(curv, 0.002),
  );
  const profile = aiProfileFor(car);
  const skillPace =
    (p.skillId === "qualifying_ace" && (car.tires?.health ?? 1) > 0.82
      ? 1.005
      : 1) *
    (p.skillId === "rocket_starter" && car.lap === 0 && time < 15 ? 1.008 : 1);
  let pace = policy.pace * (car.id === 0 ? 1 : profile.pace) * skillPace;
  if (strategy.pace === "recovery" && time - a.lastBattle < 7) pace = 1.022;
  let targetSpeed = Math.min(
    car.stats.maxSpeed,
    cornerSpeed *
      mode.pace *
      pace *
      (0.94 +
        (p.cornering ?? p.precision ?? 0.8) * 0.035 +
        (p.speed ?? p.skill ?? 0.8) * 0.025) *
      (1 +
        Math.sin(time * 0.3 + car.id) *
          mode.consistency *
          profile.consistency *
          (1 - p.consistency * 0.5)),
  );
  if (Math.abs(delta) > 0.6 || Math.abs(car.lateral) > TRACK_WIDTH / 2 - 2) {
    targetSpeed = Math.min(targetSpeed, 24);
    car.maneuver = "recover";
  }
  if (car.flag === "yellow")
    targetSpeed = Math.min(targetSpeed, car.controlLimit ?? 23);
  // Continuous collision anticipation also sees merging and stopped cars.
  for (const o of cars) {
    if (o === car || !trafficRelevant(o)) continue;
    const d = trackGap(car, o);
    if (d > 0 && d < 140 && Math.abs(o.lateral - car.lateral) < 3.75) {
      const brake =
        car.stats.braking *
        (car.weather === "rain" ? 0.48 : 0.68) *
        (car.tireGrip ?? 1);
      const safe = Math.sqrt(
        o.speed * o.speed + 2 * brake * Math.max(0, d - 7 - car.speed * 0.3),
      );
      targetSpeed = Math.min(targetSpeed, safe);
    }
  }
  if (time < (a.errorUntil || 0)) {
    targetSpeed = Math.min(targetSpeed, car.speed * 0.75);
    car.maneuver = "pressure-error";
  }
  if (
    car.stewards?.race.teamOrder === "protect" &&
    car.teamId === car.stewards.race.cars[0].teamId &&
    behind &&
    rear < 30 &&
    laneClear(car, cars, a.lane)
  )
    a.until = Math.max(a.until, time + 0.5);
  car.aiTargetSpeed = targetSpeed;
  return {
    steer: steering,
    throttle: car.speed < targetSpeed - 0.15 ? policy.throttle : 0.035,
    brake:
      car.speed > targetSpeed + 0.5
        ? Math.min(1, (car.speed - targetSpeed) / 9)
        : 0,
  };
}
