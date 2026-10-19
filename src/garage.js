import { BASE } from "./physics.js";
import { vehicles } from "./data/cars.js";
import { powerUnitById } from "./data/powerUnits.js";
import {
  aggregatePartsBonus,
  aeroSetupById,
  compareCarPerformance,
  partCategories,
  partTier,
} from "./data/parts.js";
import { teamPrincipalById } from "./data/sponsors.js";

export { vehicles };
export const attributes = [
  {
    key: "maxSpeed",
    name: "Velocidade máxima",
    icon: "speed",
    description: "Mais potência no fim da reta.",
    gain: 3.2,
    unit: "km/h",
  },
  {
    key: "acceleration",
    name: "Aceleração",
    icon: "bolt",
    description: "Uma saída de curva mais rápida.",
    gain: 2.2,
    unit: "m/s²",
  },
  {
    key: "handling",
    name: "Controle nas curvas",
    icon: "curve",
    description: "Mais resposta a cada comando.",
    gain: 0.065,
    unit: "%",
  },
  {
    key: "braking",
    name: "Frenagem",
    icon: "brake",
    description: "Confiança para frear mais tarde.",
    gain: 4,
    unit: "m/s²",
  },
];

export const upgradeCost = (level) => 400 + level * 300;

export function performance(save = {}, car = save.selectedCar ?? 0, overrides = null) {
  const stats = { ...BASE },
    carIdx = Number.isInteger(car) && vehicles[car] ? car : 0,
    v = vehicles[carIdx],
    upgrades = save?.upgrades || { maxSpeed: 0, acceleration: 0, handling: 0, braking: 0 };
  stats.grip += ((carIdx * 3) % 7) - 3;
  stats.stability = 1 + ((carIdx % 4) - 1) * 0.05;
  stats.consumption = 0.9 + (carIdx % 5) * 0.055;
  stats.durability = 0.85 + (carIdx % 4) * 0.12;
  stats.tireWear = 0.88 + (carIdx % 4) * 0.075;
  for (const a of attributes)
    stats[a.key] += (v[a.key] || 0) + (upgrades[a.key] || 0) * a.gain;

  // Integrate Power Unit (Motor), 11 Configurable Parts, and Aero Setup when present
  const puId = overrides?.powerUnitId ?? save?.selectedPowerUnit ?? 0;
  const pu = powerUnitById(puId);
  const engineWear = Math.max(0, Math.min(1, overrides?.engineWear ?? save?.engineWear ?? 0));
  const engineHealthFactor = 1 - engineWear * (pu.wearPenalty || 0.28);

  const partsState = overrides?.carParts
    ? { ...(save?.carParts || {}), ...overrides.carParts }
    : save?.carParts || {};
  const partWear = overrides?.partWear ?? save?.partWear ?? {};
  const partsBonus = aggregatePartsBonus(partsState, partWear);
  const aero = aeroSetupById(overrides?.aeroSetup ?? save?.aeroSetup ?? "balanced");
  const principal = teamPrincipalById(save?.teamPrincipal ?? 0);

  const baseWeight = 798 + (pu.weight - 150) + partsBonus.weightDelta;
  const weightBonus = Math.max(-1.5, Math.min(2.5, (798 - baseWeight) * 0.12));

  stats.maxSpeed =
    (stats.maxSpeed + pu.maxSpeed + partsBonus.maxSpeed + aero.maxSpeed + weightBonus * 0.45) *
    engineHealthFactor;
  stats.acceleration =
    (stats.acceleration +
      pu.acceleration +
      partsBonus.acceleration +
      aero.acceleration +
      weightBonus * 0.6) *
    engineHealthFactor;
  stats.handling += (pu.handling || 0) + partsBonus.handling + aero.handling;
  stats.braking += (pu.braking || 0) + partsBonus.braking + aero.braking;
  stats.grip += (pu.grip || 0) + partsBonus.grip + aero.grip;
  stats.stability += (pu.stability || 0) + partsBonus.stability + aero.stability;
  stats.durability = Math.max(
    0.5,
    stats.durability + (pu.reliability - 0.92) * 0.6 + partsBonus.durability,
  );
  stats.consumption = Math.max(
    0.6,
    stats.consumption *
      pu.consumption *
      aero.consumption *
      (1 - partsBonus.fuelSaving),
  );
  stats.tireWear = Math.max(
    0.62,
    stats.tireWear *
      aero.tireWearFactor *
      (1 - partsBonus.tireWearBonus - (principal.tireCareBonus || 0) * 0.35),
  );
  stats.thermalEfficiency =
    (pu.thermalEfficiency || 1.0) * (1 + (partsBonus.coolingBonus || 0));
  stats.weight = Number(baseWeight.toFixed(1));
  Object.defineProperty(stats, "powerUnit", { value: pu, enumerable: false });
  Object.defineProperty(stats, "aeroSetup", { value: aero, enumerable: false });
  return stats;
}

export function compareSetupChanges(save, candidateOverrides = {}, car = save.selectedCar) {
  const before = performance(save, car);
  const after = performance(save, car, candidateOverrides);
  return compareCarPerformance(before, after);
}

export function purchase(save, key) {
  const attr = attributes.find((a) => a.key === key);
  if (!attr) return { ok: false, message: "Melhoria inválida." };
  const level = save.upgrades[key];
  if (level >= 5) return { ok: false, message: "Nível máximo atingido." };
  const cost = upgradeCost(level, save);
  if (save.credits < cost)
    return {
      ok: false,
      message: "Créditos insuficientes. Complete uma corrida.",
    };
  save.credits -= cost;
  save.upgrades[key]++;
  save.stats.upgrades++;
  return {
    ok: true,
    message: attr.name + " aprimorada. A diferença já está na pista.",
  };
}

export function purchasePart(save, partKey, targetLevel = null) {
  const cat = partCategories.find((c) => c.key === partKey);
  if (!cat) return { ok: false, message: "Componente inválido." };
  if (!save.carParts) save.carParts = {};
  const current = save.carParts[partKey] || 0;
  const next = targetLevel !== null ? Number(targetLevel) : current + 1;
  if (next <= current) {
    save.carParts[partKey] = Math.max(0, next);
    return { ok: true, message: `${cat.name} ajustado para ${partTier(partKey, next).label}.` };
  }
  if (next >= cat.tiers.length)
    return { ok: false, message: "Especificação máxima já instalada neste componente." };
  const tier = partTier(partKey, next);
  const principal = teamPrincipalById(save.teamPrincipal ?? 0);
  const cost = Math.round(tier.cost * (1 - (principal.rdDiscount || 0)));
  if (save.credits < cost)
    return { ok: false, message: `Créditos insuficientes (${cost} CR necessários).` };
  save.credits -= cost;
  save.carParts[partKey] = next;
  if (save.partWear) save.partWear[partKey] = 0;
  save.stats.upgrades++;
  return {
    ok: true,
    message: `${cat.name} atualizado para ${tier.label}!`,
  };
}

export function displayStat(key, value) {
  if (key === "maxSpeed") return Math.round(value * 3.6);
  if (key === "handling") return Math.round(value * 100);
  return value.toFixed(1);
}
