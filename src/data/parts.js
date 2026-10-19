// 11 Configurable Formula 1 Car Component Categories + Setup Presets & Comparison Tool.
export const partCategories = [
  {
    key: "frontWing",
    name: "Asa Dianteira",
    short: "Asa Diant.",
    description: "Direciona o fluxo frontal e define a resposta de entrada de curva e o equilíbrio aerodinâmico.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Multi-Elemento", cost: 420, weight: -0.4, maxSpeed: 0.2, acceleration: 0.1, handling: 0.03, braking: 0.4, grip: 0.5, stability: 0.01, durability: 0.02 },
      { level: 2, label: "Spec C — Vórtice Y250", cost: 920, weight: -0.9, maxSpeed: 0.5, acceleration: 0.2, handling: 0.06, braking: 0.8, grip: 1.1, stability: 0.02, durability: 0.04 },
      { level: 3, label: "Spec D — Carbono Flex Pro", cost: 1650, weight: -1.4, maxSpeed: 0.9, acceleration: 0.4, handling: 0.09, braking: 1.2, grip: 1.7, stability: 0.03, durability: 0.06 },
    ],
  },
  {
    key: "rearWing",
    name: "Asa Traseira",
    short: "Asa Tras.",
    description: "Controla a relação entre estabilidade traseira em alta velocidade e arrasto aerodinâmico nas retas.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Baixo Arrasto", cost: 450, weight: -0.5, maxSpeed: 0.8, acceleration: 0.2, handling: 0.02, braking: 0.3, grip: 0.4, stability: 0.01, durability: 0.02 },
      { level: 2, label: "Spec C — Perfil Beam-Wing", cost: 980, weight: -1.0, maxSpeed: 1.5, acceleration: 0.4, handling: 0.04, braking: 0.7, grip: 0.9, stability: 0.03, durability: 0.04 },
      { level: 3, label: "Spec D — DRS Aero-Ativo", cost: 1750, weight: -1.6, maxSpeed: 2.3, acceleration: 0.6, handling: 0.07, braking: 1.1, grip: 1.4, stability: 0.04, durability: 0.06 },
    ],
  },
  {
    key: "floor",
    name: "Assoalho e Difusor",
    short: "Assoalho",
    description: "Gera efeito solo sob o carro, ampliando a aderência em curvas de média e alta velocidade sem penalizar retas.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Canais Venturi", cost: 520, weight: -0.6, maxSpeed: 0.4, acceleration: 0.2, handling: 0.04, braking: 0.4, grip: 0.8, stability: 0.02, durability: 0.02 },
      { level: 2, label: "Spec C — Bordas Seladas", cost: 1120, weight: -1.2, maxSpeed: 0.9, acceleration: 0.4, handling: 0.08, braking: 0.9, grip: 1.6, stability: 0.04, durability: 0.04 },
      { level: 3, label: "Spec D — Difusor Duplo Ground-Effect", cost: 1950, weight: -1.8, maxSpeed: 1.4, acceleration: 0.7, handling: 0.12, braking: 1.4, grip: 2.5, stability: 0.06, durability: 0.07 },
    ],
  },
  {
    key: "suspension",
    name: "Suspensão",
    short: "Suspensão",
    description: "Absorve zebras, controla transferência de carga e preserva os pneus em sequências de curvas.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0, tireWearBonus: 0 },
      { level: 1, label: "Spec B — Push-Rod Otimizada", cost: 390, weight: -0.4, maxSpeed: 0.1, acceleration: 0.2, handling: 0.03, braking: 0.4, grip: 0.6, stability: 0.02, durability: 0.03, tireWearBonus: 0.04 },
      { level: 2, label: "Spec C — Pull-Rod Hidráulica", cost: 860, weight: -0.8, maxSpeed: 0.3, acceleration: 0.5, handling: 0.06, braking: 0.9, grip: 1.2, stability: 0.04, durability: 0.06, tireWearBonus: 0.08 },
      { level: 3, label: "Spec D — Geometria Anti-Dive Pro", cost: 1520, weight: -1.3, maxSpeed: 0.5, acceleration: 0.8, handling: 0.09, braking: 1.4, grip: 1.9, stability: 0.06, durability: 0.09, tireWearBonus: 0.12 },
    ],
  },
  {
    key: "brakes",
    name: "Sistema de Freios",
    short: "Freios",
    description: "Discos de carbono e dutos ventilados que encurtam a distância de frenagem e evitam travamento.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Carbono Ventilado", cost: 380, weight: -0.3, maxSpeed: 0, acceleration: 0.1, handling: 0.02, braking: 1.4, grip: 0.3, stability: 0.02, durability: 0.03 },
      { level: 2, label: "Spec C — Pinças Ultraleves", cost: 820, weight: -0.9, maxSpeed: 0.2, acceleration: 0.3, handling: 0.04, braking: 2.8, grip: 0.6, stability: 0.03, durability: 0.05 },
      { level: 3, label: "Spec D — Cerâmica Brake-by-Wire", cost: 1480, weight: -1.5, maxSpeed: 0.4, acceleration: 0.5, handling: 0.06, braking: 4.2, grip: 1.0, stability: 0.05, durability: 0.08 },
    ],
  },
  {
    key: "gearbox",
    name: "Câmbio e Transmissão",
    short: "Câmbio",
    description: "Trocas sem interrupção de torque (seamless shift) que aceleram as retomadas de velocidade.",
    tiers: [
      { level: 0, label: "Spec A — Padrão 8 Marchas", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Relação Curta Rápida", cost: 430, weight: -0.5, maxSpeed: 0.3, acceleration: 0.8, handling: 0.01, braking: 0.2, grip: 0.2, stability: 0.01, durability: 0.02 },
      { level: 2, label: "Spec C — Seamless Shift Carbono", cost: 940, weight: -1.1, maxSpeed: 0.7, acceleration: 1.6, handling: 0.02, braking: 0.5, grip: 0.4, stability: 0.02, durability: 0.05 },
      { level: 3, label: "Spec D — Titânio Zero-Lag", cost: 1680, weight: -1.8, maxSpeed: 1.1, acceleration: 2.5, handling: 0.04, braking: 0.8, grip: 0.7, stability: 0.03, durability: 0.08 },
    ],
  },
  {
    key: "cooling",
    name: "Sistema de Resfriamento",
    short: "Resfriamento",
    description: "Radiadores e entradas laterais (sidepods) que controlam a temperatura do motor e reduzem o risco de quebra.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0, coolingBonus: 0 },
      { level: 1, label: "Spec B — Louvers Otimizados", cost: 360, weight: -0.2, maxSpeed: 0.2, acceleration: 0.1, handling: 0.01, braking: 0.2, grip: 0.1, stability: 0.01, durability: 0.06, coolingBonus: 0.12 },
      { level: 2, label: "Spec C — Sidepods Compactos", cost: 790, weight: -0.6, maxSpeed: 0.5, acceleration: 0.3, handling: 0.02, braking: 0.4, grip: 0.3, stability: 0.02, durability: 0.12, coolingBonus: 0.24 },
      { level: 3, label: "Spec D — Troca Térmica Criogênica", cost: 1420, weight: -1.0, maxSpeed: 0.9, acceleration: 0.5, handling: 0.03, braking: 0.6, grip: 0.5, stability: 0.03, durability: 0.18, coolingBonus: 0.36 },
    ],
  },
  {
    key: "tireSpec",
    name: "Preparação e Mantas de Pneus",
    short: "Prep. Pneus",
    description: "Controle térmico de carcaça e pressão que amplia a janela ideal de aderência e vida útil do composto.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0, tireWearBonus: 0 },
      { level: 1, label: "Spec B — Sensores Infravermelhos", cost: 400, weight: -0.2, maxSpeed: 0.1, acceleration: 0.3, handling: 0.02, braking: 0.4, grip: 0.6, stability: 0.01, durability: 0.02, tireWearBonus: 0.06 },
      { level: 2, label: "Spec C — Aros Termocondutivos", cost: 880, weight: -0.6, maxSpeed: 0.3, acceleration: 0.6, handling: 0.04, braking: 0.8, grip: 1.2, stability: 0.02, durability: 0.04, tireWearBonus: 0.12 },
      { level: 3, label: "Spec D — Gestão Ativa de Carcaça", cost: 1560, weight: -1.0, maxSpeed: 0.5, acceleration: 0.9, handling: 0.06, braking: 1.2, grip: 1.8, stability: 0.04, durability: 0.06, tireWearBonus: 0.18 },
    ],
  },
  {
    key: "electronics",
    name: "Unidade Eletrônica (ECU)",
    short: "Eletrônica",
    description: "Mapas de diferencial, entrega de torque e telemetria que otimizam consumo de combustível e tração.",
    tiers: [
      { level: 0, label: "Spec A — Padrão", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0, fuelSaving: 0 },
      { level: 1, label: "Spec B — Diferencial Ativo", cost: 410, weight: -0.3, maxSpeed: 0.2, acceleration: 0.3, handling: 0.02, braking: 0.3, grip: 0.4, stability: 0.02, durability: 0.03, fuelSaving: 0.04 },
      { level: 2, label: "Spec C — Telemetria Preditiva", cost: 890, weight: -0.6, maxSpeed: 0.5, acceleration: 0.6, handling: 0.04, braking: 0.6, grip: 0.8, stability: 0.04, durability: 0.06, fuelSaving: 0.08 },
      { level: 3, label: "Spec D — ECU Neural Motorsport", cost: 1590, weight: -1.0, maxSpeed: 0.8, acceleration: 1.0, handling: 0.06, braking: 1.0, grip: 1.3, stability: 0.06, durability: 0.09, fuelSaving: 0.12 },
    ],
  },
  {
    key: "chassis",
    name: "Monocoque e Estrutura do Chassi",
    short: "Chassi",
    description: "Reduz o peso total do carro e aumenta a rigidez torcional para respostas imediatas de direção.",
    tiers: [
      { level: 0, label: "Spec A — Fibra Padrão (798 kg)", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Favos de Alumínio", cost: 480, weight: -2.2, maxSpeed: 0.4, acceleration: 0.5, handling: 0.03, braking: 0.5, grip: 0.5, stability: 0.02, durability: 0.04 },
      { level: 2, label: "Spec C — Monocoque Kevlar-Carbono", cost: 1050, weight: -4.5, maxSpeed: 0.9, acceleration: 1.0, handling: 0.06, braking: 1.0, grip: 1.0, stability: 0.04, durability: 0.08 },
      { level: 3, label: "Spec D — Compósito Ultraleve Pro", cost: 1850, weight: -7.0, maxSpeed: 1.5, acceleration: 1.6, handling: 0.10, braking: 1.6, grip: 1.6, stability: 0.06, durability: 0.12 },
    ],
  },
  {
    key: "materials",
    name: "Durabilidade e Materiais",
    short: "Materiais",
    description: "Revestimentos cerâmicos e ligas de titânio que reduzem o desgaste das peças ao longo da corrida.",
    tiers: [
      { level: 0, label: "Spec A — Liga Convencional", cost: 0, weight: 0, maxSpeed: 0, acceleration: 0, handling: 0, braking: 0, grip: 0, stability: 0, durability: 0 },
      { level: 1, label: "Spec B — Tratamento Térmico", cost: 350, weight: -0.3, maxSpeed: 0.1, acceleration: 0.1, handling: 0.01, braking: 0.2, grip: 0.2, stability: 0.01, durability: 0.08 },
      { level: 2, label: "Spec C — Matriz de Titânio", cost: 780, weight: -0.7, maxSpeed: 0.3, acceleration: 0.3, handling: 0.02, braking: 0.4, grip: 0.4, stability: 0.02, durability: 0.16 },
      { level: 3, label: "Spec D — Compósito Aeroespacial", cost: 1380, weight: -1.2, maxSpeed: 0.5, acceleration: 0.5, handling: 0.03, braking: 0.7, grip: 0.7, stability: 0.04, durability: 0.25 },
    ],
  },
];

export const aeroSetupPresets = [
  {
    id: "balanced",
    name: "Equilibrado (Padrão)",
    description: "Balanço ideal entre velocidade em reta e apoio aerodinâmico em curvas de média velocidade.",
    maxSpeed: 0,
    acceleration: 0,
    handling: 0,
    braking: 0,
    grip: 0,
    stability: 0,
    consumption: 1.0,
    tireWearFactor: 1.0,
  },
  {
    id: "high_downforce",
    name: "Alto Downforce (Circuitos Travados)",
    description: "Maior ângulo de asas para máxima aderência em curvas e freadas, com redução de velocidade final.",
    maxSpeed: -1.8,
    acceleration: 0.7,
    handling: 0.07,
    braking: 1.5,
    grip: 1.9,
    stability: 0.04,
    consumption: 1.03,
    tireWearFactor: 0.96,
  },
  {
    id: "low_drag",
    name: "Baixo Arrasto (Circuitos de Alta)",
    description: "Asas aliviadas para máxima velocidade final em retas longas, exigindo maior cuidado nas freadas.",
    maxSpeed: 2.2,
    acceleration: -0.2,
    handling: -0.04,
    braking: -0.8,
    grip: -1.1,
    stability: -0.02,
    consumption: 0.96,
    tireWearFactor: 1.03,
  },
  {
    id: "wet_grip",
    name: "Acerto de Chuva / Baixa Aderência",
    description: "Suspensão macia e carga aerodinâmica extra para estabilidade em pista úmida ou chuvosa.",
    maxSpeed: -1.4,
    acceleration: 0.4,
    handling: 0.06,
    braking: 1.2,
    grip: 2.2,
    stability: 0.06,
    consumption: 1.01,
    tireWearFactor: 0.93,
  },
  {
    id: "endurance",
    name: "Conservação / Endurance",
    description: "Geometria suave de cambagem e refrigeração aberta para poupar pneus, combustível e motor.",
    maxSpeed: -0.5,
    acceleration: -0.2,
    handling: 0.02,
    braking: 0.6,
    grip: 0.5,
    stability: 0.05,
    consumption: 0.91,
    tireWearFactor: 0.86,
  },
];

export const defaultPartsState = () =>
  Object.fromEntries(partCategories.map((c) => [c.key, 0]));

export const defaultPartWear = () =>
  Object.fromEntries(partCategories.map((c) => [c.key, 0]));

export const aeroSetupById = (id) =>
  aeroSetupPresets.find((a) => a.id === id) || aeroSetupPresets[0];

export function partTier(key, level = 0) {
  const cat = partCategories.find((c) => c.key === key);
  if (!cat) return null;
  const idx = Math.max(0, Math.min(cat.tiers.length - 1, Math.round(Number(level) || 0)));
  return cat.tiers[idx];
}

export function aggregatePartsBonus(partsState = {}, partWear = {}) {
  const sum = {
    maxSpeed: 0,
    acceleration: 0,
    handling: 0,
    braking: 0,
    grip: 0,
    stability: 0,
    durability: 0,
    weightDelta: 0,
    tireWearBonus: 0,
    coolingBonus: 0,
    fuelSaving: 0,
    avgWear: 0,
  };
  let count = 0;
  for (const cat of partCategories) {
    const tier = partTier(cat.key, partsState?.[cat.key] ?? 0);
    const wear = Math.max(0, Math.min(1, Number(partWear?.[cat.key]) || 0));
    const healthFactor = 1 - wear * 0.35;
    count++;
    sum.avgWear += wear;
    if (!tier) continue;
    sum.maxSpeed += (tier.maxSpeed || 0) * healthFactor;
    sum.acceleration += (tier.acceleration || 0) * healthFactor;
    sum.handling += (tier.handling || 0) * healthFactor;
    sum.braking += (tier.braking || 0) * healthFactor;
    sum.grip += (tier.grip || 0) * healthFactor;
    sum.stability += (tier.stability || 0) * healthFactor;
    sum.durability += (tier.durability || 0) * healthFactor;
    sum.weightDelta += tier.weight || 0;
    sum.tireWearBonus += (tier.tireWearBonus || 0) * healthFactor;
    sum.coolingBonus += (tier.coolingBonus || 0) * healthFactor;
    sum.fuelSaving += (tier.fuelSaving || 0) * healthFactor;
  }
  if (count > 0) sum.avgWear /= count;
  return sum;
}

export function compareCarPerformance(beforePerf, afterPerf) {
  const metrics = [
    { key: "maxSpeed", label: "Velocidade Final", unit: "m/s", scale: 3.6, displayUnit: "km/h", higherIsBetter: true },
    { key: "acceleration", label: "Aceleração", unit: "m/s²", scale: 1, displayUnit: "m/s²", higherIsBetter: true },
    { key: "handling", label: "Curva / Direção", unit: "rad/s", scale: 100, displayUnit: "pts", higherIsBetter: true },
    { key: "braking", label: "Frenagem", unit: "m/s²", scale: 1, displayUnit: "m/s²", higherIsBetter: true },
    { key: "grip", label: "Aderência (Grip)", unit: "m/s²", scale: 1, displayUnit: "m/s²", higherIsBetter: true },
    { key: "durability", label: "Confiabilidade", unit: "%", scale: 100, displayUnit: "%", higherIsBetter: true },
    { key: "consumption", label: "Consumo Comb.", unit: "x", scale: 100, displayUnit: "%", higherIsBetter: false },
    { key: "weight", label: "Massa Total", unit: "kg", scale: 1, displayUnit: "kg", higherIsBetter: false },
  ];
  return metrics.map((m) => {
    const b = (Number(beforePerf?.[m.key]) || 0) * m.scale;
    const a = (Number(afterPerf?.[m.key]) || 0) * m.scale;
    const delta = a - b;
    const improved = m.higherIsBetter ? delta > 0.005 : delta < -0.005;
    const worsened = m.higherIsBetter ? delta < -0.005 : delta > 0.005;
    return {
      ...m,
      before: Number(b.toFixed(1)),
      after: Number(a.toFixed(1)),
      delta: Number(delta.toFixed(1)),
      status: improved ? "up" : worsened ? "down" : "equal",
    };
  });
}
