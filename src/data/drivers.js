export const EXCLUSIVE_SKILLS = [
  {
    id: "qualifying_ace",
    name: "Especialista em classificação",
    bonusLabel: "+1,2% ritmo em volta rápida e pneus novos",
    limitation: "Ativo apenas com composto acima de 82% de vida útil",
    description:
      "Extrai aderência imediata de pneus novos em voltas lançadas e no início dos stints.",
  },
  {
    id: "overtake_master",
    name: "Mestre das ultrapassagens",
    bonusLabel: "+12% eficiência de ataque em freadas",
    limitation: "Exige corredor lateral limpo sem bandeira amarela",
    description:
      "Lê o ponto de frenagem do adversário com precisão e mergulha com controle na linha interna ou externa.",
  },
  {
    id: "tire_whisperer",
    name: "Gestor de pneus",
    bonusLabel: "-6% degradação térmica e mecânica de composto",
    limitation: "Ganho progressivo em stints médios e longos",
    description:
      "Suaviza a aplicação de torque e ângulo de esterçamento para prolongar a janela ideal de aderência.",
  },
  {
    id: "iron_defender",
    name: "Defensor agressivo",
    bonusLabel: "+15% alcance e firmeza na proteção de posição",
    limitation: "Aumenta disputa roda a roda sob ataque direto",
    description:
      "Posiciona o carro estrategicamente no centro e na linha interna para fechar portas com autoridade.",
  },
  {
    id: "rain_master",
    name: "Especialista em chuva",
    bonusLabel: "+4,5% tração e contorno em pista molhada",
    limitation: "Ativo exclusivamente sob condições úmidas ou chuva",
    description:
      "Encontra aderência fora do trilho emborrachado e controla o carro com naturalidade no piso molhado.",
  },
  {
    id: "rocket_starter",
    name: "Largada explosiva",
    bonusLabel: "+3,5% tração inicial e reação na volta 1",
    limitation: "Ativo apenas na largada e primeiros setores da prova",
    description:
      "Reação imediata ao apagar das luzes com controle fino de patinagem nos primeiros metros.",
  },
  {
    id: "ice_veins",
    name: "Frieza sob pressão",
    bonusLabel: "-65% chance de erro sob ataque ou voltas finais",
    limitation: "Não eleva velocidade máxima isolada em pista livre",
    description:
      "Mantém frenagem e pontos de tangência inalterados mesmo com rivais a menos de meio segundo.",
  },
  {
    id: "natural_talent",
    name: "Talento natural",
    bonusLabel: "+25% velocidade de evolução em treinos e corridas",
    limitation: "Limitado pelo teto de Potencial do piloto",
    description:
      "Absorve telemetria e experiência de pista rapidamente, acelerando o desenvolvimento técnico na carreira.",
  },
];

export const DRIVING_STYLES = {
  Agressivo: {
    id: "Agressivo",
    name: "Agressivo",
    aiProfile: "Agressivo",
    summary: "Ataca mais cedo, freia no limite e força disputas diretas.",
    paceMod: 1.008,
    aggressionMod: 1.16,
    defenseMod: 1.04,
    consistencyMod: 0.94,
    tireSaveMod: 0.96,
  },
  Calculista: {
    id: "Calculista",
    name: "Calculista",
    aiProfile: "Estratégico",
    summary: "Escolhe momentos seguros para atacar e preserva o equipamento.",
    paceMod: 1.003,
    aggressionMod: 0.92,
    defenseMod: 1.06,
    consistencyMod: 1.08,
    tireSaveMod: 1.05,
  },
  Defensivo: {
    id: "Defensivo",
    name: "Defensivo",
    aiProfile: "Defensivo",
    summary: "Prioriza fechar a linha interna e segurar posição sob pressão.",
    paceMod: 0.997,
    aggressionMod: 0.94,
    defenseMod: 1.24,
    consistencyMod: 1.04,
    tireSaveMod: 1.02,
  },
  Consistente: {
    id: "Consistente",
    name: "Consistente",
    aiProfile: "Equilibrado",
    summary: "Mantém voltas estáveis com mínima variação de ritmo e poucos erros.",
    paceMod: 1.002,
    aggressionMod: 0.96,
    defenseMod: 1.02,
    consistencyMod: 1.14,
    tireSaveMod: 1.04,
  },
  Estratégico: {
    id: "Estratégico",
    name: "Estratégico",
    aiProfile: "Estratégico",
    summary: "Administra pneus, combustível e ritmo pensando no resultado final.",
    paceMod: 1.005,
    aggressionMod: 0.95,
    defenseMod: 1.05,
    consistencyMod: 1.1,
    tireSaveMod: 1.08,
  },
  Imprevisível: {
    id: "Imprevisível",
    name: "Imprevisível",
    aiProfile: "Agressivo",
    summary: "Alterna voltas muito rápidas com manobras ousadas em locais incomuns.",
    paceMod: 1.01,
    aggressionMod: 1.22,
    defenseMod: 1.08,
    consistencyMod: 0.88,
    tireSaveMod: 0.94,
  },
};

export const STYLE_KEYS = Object.keys(DRIVING_STYLES);

export const ACADEMY_PROGRAMS = [
  {
    id: "formula_jr",
    name: "Fórmula Júnior · Velocidade & Curvas",
    focus: "Ritmo puro em curvas e frenagem",
    bonuses: { speed: 5, braking: 4, cornering: 6, overtaking: 3, consistency: 2 },
  },
  {
    id: "factory_sim",
    name: "Simulador de Fábrica · Precisão & Consistência",
    focus: "Leitura técnica, consistência e gestão de corrida",
    bonuses: { consistency: 6, racecraft: 5, cornering: 4, tireControl: 4, braking: 2 },
  },
  {
    id: "endurance_academy",
    name: "Endurance & Gestão · Pneus & Estratégia",
    focus: "Conservação de composto, defesa e stints longos",
    bonuses: { tireControl: 7, racecraft: 5, defense: 4, consistency: 4, experience: 2 },
  },
  {
    id: "sprint_cup",
    name: "Copa Sprint · Ataque & Ultrapassagem",
    focus: "Duelos roda a roda, largadas e ultrapassagens",
    bonuses: { overtaking: 7, braking: 5, speed: 4, defense: 4, cornering: 2 },
  },
];

export const PLACEHOLDER_DRIVER_PORTRAIT =
  "/assets/drivers/placeholder-driver.png";

export const NATIONALITIES = [
  "Brasil",
  "Itália",
  "Reino Unido",
  "Japão",
  "França",
  "Alemanha",
  "Espanha",
  "Austrália",
  "Mônaco",
  "Países Baixos",
  "Finlândia",
  "Argentina",
];

export const NATIONALITY_FLAGS = {
  Brasil: { flag: "🇧🇷", code: "BRA" },
  Itália: { flag: "🇮🇹", code: "ITA" },
  "Reino Unido": { flag: "🇬🇧", code: "GBR" },
  Japão: { flag: "🇯🇵", code: "JPN" },
  França: { flag: "🇫🇷", code: "FRA" },
  Alemanha: { flag: "🇩🇪", code: "GER" },
  Espanha: { flag: "🇪🇸", code: "ESP" },
  Austrália: { flag: "🇦🇺", code: "AUS" },
  Mônaco: { flag: "🇲🇨", code: "MON" },
  "Países Baixos": { flag: "🇳🇱", code: "NED" },
  Holanda: { flag: "🇳🇱", code: "NED" },
  Finlândia: { flag: "🇫🇮", code: "FIN" },
  Argentina: { flag: "🇦🇷", code: "ARG" },
  México: { flag: "🇲🇽", code: "MEX" },
  Canadá: { flag: "🇨🇦", code: "CAN" },
  EUA: { flag: "🇺🇸", code: "USA" },
  Bélgica: { flag: "🇧🇪", code: "BEL" },
};

export function nationalityFlag(nat) {
  return (
    NATIONALITY_FLAGS[nat] || {
      flag: "🏁",
      code: String(nat || "INT")
        .slice(0, 3)
        .toUpperCase(),
    }
  );
}

export const ATTRIBUTE_LABELS = [
  ["speed", "Velocidade"],
  ["braking", "Frenagem"],
  ["cornering", "Curvas"],
  ["overtaking", "Ultrapassagem"],
  ["defense", "Defesa"],
  ["consistency", "Consistência"],
  ["tireControl", "Controle de pneus"],
  ["racecraft", "Gestão de corrida"],
  ["experience", "Experiência"],
  ["potential", "Potencial"],
];

export const SHEET_ATTRIBUTE_LABELS = [
  ["qualifyingPace", "Ritmo de classificação"],
  ["racePace", "Ritmo de corrida"],
  ["overtaking", "Capacidade de ultrapassagem"],
  ["defense", "Defesa de posição"],
  ["tireControl", "Controle de pneus"],
  ["consistency", "Consistência"],
  ["experience", "Experiência"],
  ["braking", "Frenagem"],
  ["cornering", "Curvas"],
  ["potential", "Potencial"],
];

export function exclusiveSkillById(id) {
  return (
    EXCLUSIVE_SKILLS.find((s) => s.id === id) ||
    EXCLUSIVE_SKILLS[0]
  );
}

const names = [
  "Luan Costa",
  "Mara Vega",
  "Sora Nakai",
  "Ari Morel",
  "Kai Vidal",
  "Nina Vale",
  "Davi Sarden",
  "Ines Corvo",
  "Téo Maren",
  "Yara Voss",
  "Nova Raze",
  "Ezra Flint",
  "Mila Solis",
  "Ravi Kade",
  "Kira Nox",
  "Luca Arden",
  "Aya Storm",
  "Otto Vey",
  "Zoe Astrid",
  "Ren Sable",
  "Atlas Varen",
  "Iris Volt",
  "Enzo Aster",
  "Lyra Senn",
  "Dante Orion",
  "Maya Riven",
  "Axel Nadir",
  "Vera Onyx",
  "Leon Aether",
  "Selene Knox",
  "Mega Baxter",
];
const specialties = [
  "Largadas",
  "Frenagem",
  "Curvas rápidas",
  "Gestão de pneus",
  "Ultrapassagens",
  "Chuva",
  "Consistência",
  "Economia",
  "Recuperação",
  "Pressão",
];
const traits = [
  "Audacioso",
  "Analítico",
  "Paciente",
  "Metódico",
  "Oportunista",
  "Adaptável",
  "Constante",
  "Eficiente",
  "Resiliente",
  "Competitivo",
];
const aiProfileOrder = [
  "Equilibrado",
  "Agressivo",
  "Estratégico",
  "Defensivo",
  "Conservador",
  "Novato",
  "Elite",
];
const palette = [
  "#ee3554",
  "#49a1ba",
  "#e3b95c",
  "#698e72",
  "#a783bd",
  "#d57747",
  "#8bb9c0",
  "#879ddb",
  "#df7790",
  "#b2b982",
];
const visorPalette = [
  "#38bdf8",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#a855f7",
  "#eab308",
  "#06b6d4",
  "#f97316",
];
const teamNames = [
  "Apex Motorsport",
  "Vortex Racing",
  "Scuderia Veloce",
  "Chronos Racing",
  "Aether GP",
  "Titan Motorsport",
];

function buildTenAttributes(raw, id = 0, tier = "normal") {
  const speed = Math.round(raw.speed ?? raw.skill ?? 70);
  const braking = Math.round(raw.braking ?? Math.round((raw.precision ?? 70) * 0.6 + (raw.skill ?? 70) * 0.4));
  const cornering = Math.round(raw.cornering ?? raw.precision ?? 70);
  const overtaking = Math.round(raw.overtaking ?? 70);
  const defense = Math.round(raw.defense ?? 70);
  const consistency = Math.round(raw.consistency ?? 70);
  const tireControl = Math.round(raw.tireControl ?? raw.tireManagement ?? 70);
  const racecraft = Math.round(raw.racecraft ?? raw.fuelManagement ?? 70);
  const experience = Math.round(raw.experience ?? 70);
  const baseOverall = Math.round(
    (speed + braking + cornering + overtaking + defense + consistency + tireControl + racecraft + experience) / 9,
  );
  const potential = Math.round(
    raw.potential ??
      (id === 30
        ? 99
        : Math.min(99, Math.max(baseOverall + (tier === "normal" ? 14 : tier === "mythic" ? 9 : 4), 78))),
  );
  const qualifyingPace = Math.round(
    raw.qualifyingPace ?? Math.round(speed * 0.55 + cornering * 0.25 + braking * 0.2),
  );
  const racePace = Math.round(
    raw.racePace ?? Math.round(speed * 0.35 + cornering * 0.25 + racecraft * 0.25 + consistency * 0.15),
  );
  return {
    // 10 Official Core Attributes (0–100) + Qualifying & Race Pace
    speed,
    braking,
    cornering,
    overtaking,
    defense,
    consistency,
    tireControl,
    racecraft,
    experience,
    potential,
    qualifyingPace,
    racePace,
    // Legacy compatibility mirrors (all finite numbers)
    skill: raw.skill ?? speed,
    aggression: raw.aggression ?? Math.round((overtaking + braking) / 2),
    precision: raw.precision ?? cornering,
    wetSkill: raw.wetSkill ?? Math.round((cornering + tireControl) / 2),
    startSkill: raw.startSkill ?? Math.round((speed + overtaking) / 2),
    tireManagement: raw.tireManagement ?? tireControl,
    fuelManagement: raw.fuelManagement ?? racecraft,
    pressure: raw.pressure ?? Math.round((consistency + defense) / 2),
  };
}

const baseDrivers = names.map((name, id) => {
  const tier =
      id === 30
        ? "mega"
        : id < 10
          ? "normal"
          : id < 20
            ? "mythic"
            : "legendary",
    base = id === 30 ? 99 : 58 + Math.floor(id / 10) * 13 + ((id % 10) % 5);
  const score = (offset) => Math.min(99, base + (((id + 2) * offset + 1) % 13));
  const color = palette[id % 10];
  const aiProfile =
    id === 30 || tier === "legendary"
      ? id % 2 === 0
        ? "Elite"
        : "Estratégico"
      : id < 3
        ? "Novato"
        : aiProfileOrder[id % aiProfileOrder.length];
  const styleKey = STYLE_KEYS[id % STYLE_KEYS.length];
  const exclusiveSkill = EXCLUSIVE_SKILLS[id % EXCLUSIVE_SKILLS.length];
  const attrs = buildTenAttributes(
    {
      speed: score(3),
      braking: score(6),
      cornering: score(11),
      overtaking: score(2),
      defense: score(8),
      consistency: score(5),
      tireControl: score(4),
      racecraft: score(9),
      experience: score(13),
      potential: id === 30 ? 99 : Math.min(98, base + 15 + (id % 6)),
      skill: score(3),
      aggression: score(7),
      precision: score(11),
      wetSkill: score(10),
      startSkill: score(12),
      tireManagement: score(4),
      fuelManagement: score(6),
      pressure: score(9),
    },
    id,
    tier,
  );
  return {
    id,
    name,
    nationality: NATIONALITIES[id % NATIONALITIES.length],
    age: id === 30 ? 29 : 19 + ((id * 3) % 14),
    tier,
    number:
      id === 30
        ? 0
        : [
            7, 22, 18, 44, 31, 63, 15, 26, 39, 52, 9, 24, 33, 45, 58, 66, 72,
            81, 93, 12, 3, 14, 27, 36, 48, 59, 67, 78, 86, 99,
          ][id],
    color,
    suitColor: color,
    helmetColor: palette[(id + 3) % 10],
    visorColor: visorPalette[id % visorPalette.length],
    overall: id === 30 ? "∞" : Math.round(base + 5),
    aiProfile,
    styleKey,
    exclusiveSkill,
    specialty: id === 30 ? "Domínio absoluto" : exclusiveSkill.name,
    personality: id === 30 ? "Implacável" : traits[id % 10],
    drivingStyle:
      id === 30
        ? "Calculista · Perfeição mecânica em todas as zonas de frenagem e tração"
        : `${styleKey} · ${DRIVING_STYLES[styleKey].summary}`,
    teamName: teamNames[id % teamNames.length],
    contractStatus: id === 0 ? "Titular" : "Disponível",
    description:
      id === 30
        ? "O último adversário. Sem atalhos, sem limites imaginários: vença Baxter no seu próprio evento."
        : `${name.split(" ")[0]} atua com estilo ${styleKey.toLowerCase()} e domina a habilidade ${exclusiveSkill.name.toLowerCase()}. ${exclusiveSkill.description}`,
    historyBio:
      id === 30
        ? "Invicto nas séries especiais da Apex."
        : `Formado na categoria ${tier.toUpperCase()} com ${12 + id * 4} largadas oficiais.`,
    strength: specialties[id % 10],
    weakness: specialties[(id + 4) % 10],
    cost:
      id === 0
        ? 0
        : id < 10
          ? 1400 + id * 120
          : id < 20
            ? 4200 + (id - 10) * 250
            : id < 30
              ? 8500 + (id - 20) * 450
              : 0,
    attributes: attrs,
    portrait: `/assets/drivers/${tier}/driver-${String(id).padStart(2, "0")}.png`,
    helmet: `/assets/drivers/${tier}/helmet-${String(id).padStart(2, "0")}.png`,
  };
});

// Iconic public motorsport drivers with original stylized portraits and internal simulation stats.
const iconicDrivers = [
  {
    id: 31,
    name: "Max Verstappen",
    nationality: "Países Baixos",
    age: 28,
    number: 1,
    color: "#1e41ff",
    visorColor: "#f97316",
    overall: 98,
    cost: 6800,
    aiProfile: "Elite",
    styleKey: "Agressivo",
    skillId: "overtake_master",
    personality: "Dominante",
    specialty: "Ritmo Implacável e Ataque no Limite",
    drivingStyle: "Agressivo · Entrada agressiva de frente com controle cirúrgico de tração",
    teamName: "Chronos Racing",
    strength: "Ultrapassagens",
    weakness: "Paciência no tráfego",
    historyBio: "Múltiplo campeão conhecido por consistência extrema, ultrapassagens decididas e leitura perfeita sob chuva.",
    attributes: { speed: 99, braking: 98, cornering: 98, overtaking: 98, defense: 97, consistency: 98, tireControl: 96, racecraft: 97, experience: 96, potential: 99, skill: 99, aggression: 95, precision: 98, wetSkill: 99, startSkill: 97, tireManagement: 96, fuelManagement: 95, pressure: 99 },
  },
  {
    id: 32,
    name: "Kimi Antonelli",
    nationality: "Itália",
    age: 19,
    number: 12,
    color: "#00d2be",
    visorColor: "#38bdf8",
    overall: 89,
    cost: 3200,
    aiProfile: "Novato",
    styleKey: "Imprevisível",
    skillId: "natural_talent",
    personality: "Prodígio Veloz",
    specialty: "Velocidade Pura em Classificação",
    drivingStyle: "Imprevisível · Reflexos rápidos em curvas de alta e ataques ousados na freada",
    teamName: "Aether GP",
    strength: "Curvas rápidas",
    weakness: "Experiência em stints longos",
    historyBio: "Fenômeno da nova geração do automobilismo, combinando velocidade natural impressionante com rápida evolução técnica.",
    attributes: { speed: 93, braking: 89, cornering: 91, overtaking: 90, defense: 86, consistency: 86, tireControl: 86, racecraft: 87, experience: 80, potential: 98, skill: 92, aggression: 91, precision: 90, wetSkill: 89, startSkill: 89, tireManagement: 86, fuelManagement: 87, pressure: 88 },
  },
  {
    id: 33,
    name: "Lewis Hamilton",
    nationality: "Reino Unido",
    age: 40,
    number: 44,
    color: "#dc0000",
    visorColor: "#a855f7",
    overall: 97,
    cost: 6600,
    aiProfile: "Estratégico",
    styleKey: "Estratégico",
    skillId: "rain_master",
    personality: "Lenda Estratégica",
    specialty: "Gestão de Pneus e Corridas na Chuva",
    drivingStyle: "Estratégico · Frenagem tardia progressiva e conservação magistral de composto",
    teamName: "Scuderia Veloce",
    strength: "Chuva",
    weakness: "Aquecimento inicial de composto duro",
    historyBio: "Referência histórica de longevidade, leitura estratégica de stints longos e domínio em condições climáticas mistas.",
    attributes: { speed: 97, braking: 98, cornering: 98, overtaking: 96, defense: 96, consistency: 97, tireControl: 99, racecraft: 99, experience: 99, potential: 98, skill: 97, aggression: 89, precision: 98, wetSkill: 99, startSkill: 96, tireManagement: 99, fuelManagement: 98, pressure: 99 },
  },
  {
    id: 34,
    name: "Charles Leclerc",
    nationality: "Mônaco",
    age: 28,
    number: 16,
    color: "#ef1a2d",
    visorColor: "#ef4444",
    overall: 95,
    cost: 5900,
    aiProfile: "Agressivo",
    styleKey: "Agressivo",
    skillId: "qualifying_ace",
    personality: "Especialista de Volta Rápida",
    specialty: "Volta de Classificação e Ataque em Curva",
    drivingStyle: "Agressivo · Rotação rápida no apex e comprometimento total nas zebras",
    teamName: "Scuderia Veloce",
    strength: "Frenagem",
    weakness: "Desgaste no limite",
    historyBio: "Especialista em extrair cada milésimo em voltas lançadas e duelos roda a roda em circuitos de rua e alta velocidade.",
    attributes: { speed: 98, braking: 96, cornering: 97, overtaking: 95, defense: 93, consistency: 93, tireControl: 91, racecraft: 93, experience: 92, potential: 97, skill: 97, aggression: 94, precision: 96, wetSkill: 93, startSkill: 94, tireManagement: 91, fuelManagement: 92, pressure: 94 },
  },
  {
    id: 35,
    name: "Lando Norris",
    nationality: "Reino Unido",
    age: 26,
    number: 4,
    color: "#ff8000",
    visorColor: "#eab308",
    overall: 95,
    cost: 5800,
    aiProfile: "Equilibrado",
    styleKey: "Consistente",
    skillId: "tire_whisperer",
    personality: "Rítmico e Preciso",
    specialty: "Ritmo de Stint Longo e Curvas de Alta",
    drivingStyle: "Consistente · Trajetória limpa com velocidade mínima de contorno elevada",
    teamName: "Vortex Racing",
    strength: "Gestão de pneus",
    weakness: "Primeira curva sob tráfego fechado",
    historyBio: "Destaca-se pelo ritmo fortíssimo na metade final de corrida, excelente preservação de pneus e precisão constante.",
    attributes: { speed: 96, braking: 95, cornering: 96, overtaking: 93, defense: 92, consistency: 95, tireControl: 96, racecraft: 95, experience: 91, potential: 97, skill: 96, aggression: 89, precision: 96, wetSkill: 95, startSkill: 91, tireManagement: 96, fuelManagement: 95, pressure: 93 },
  },
  {
    id: 36,
    name: "Oscar Piastri",
    nationality: "Austrália",
    age: 25,
    number: 81,
    color: "#ff9e1b",
    visorColor: "#38bdf8",
    overall: 93,
    cost: 5300,
    aiProfile: "Estratégico",
    styleKey: "Calculista",
    skillId: "ice_veins",
    personality: "Frio e Calculista",
    specialty: "Calma Sob Pressão e Ultrapassagem Limpa",
    drivingStyle: "Calculista · Frieza clínica em disputas diretas e traçado disciplinado",
    teamName: "Vortex Racing",
    strength: "Pressão",
    weakness: "Economia extrema",
    historyBio: "Conhecido pela postura inabalável sob pressão intensa, decisões precisas na largada e defesa inteligente de posição.",
    attributes: { speed: 94, braking: 94, cornering: 95, overtaking: 93, defense: 94, consistency: 95, tireControl: 92, racecraft: 94, experience: 88, potential: 97, skill: 94, aggression: 88, precision: 95, wetSkill: 92, startSkill: 93, tireManagement: 92, fuelManagement: 93, pressure: 97 },
  },
  {
    id: 37,
    name: "Fernando Alonso",
    nationality: "Espanha",
    age: 43,
    number: 14,
    color: "#006f62",
    visorColor: "#10b981",
    overall: 95,
    cost: 6000,
    aiProfile: "Defensivo",
    styleKey: "Defensivo",
    skillId: "rocket_starter",
    personality: "Mestre Tático",
    specialty: "Defesa de Posição, Largadas e Leitura de Corrida",
    drivingStyle: "Defensivo · Posicionamento tático perfeito e aproveitamento total de aderência",
    teamName: "Apex Motorsport",
    strength: "Largadas",
    weakness: "Circuitos puramente de motor",
    historyBio: "Veterano lendário com visão estratégica incomparável, famoso por largadas fulminantes e defesas quase intransponíveis.",
    attributes: { speed: 95, braking: 96, cornering: 97, overtaking: 96, defense: 99, consistency: 97, tireControl: 97, racecraft: 99, experience: 99, potential: 96, skill: 95, aggression: 92, precision: 97, wetSkill: 97, startSkill: 99, tireManagement: 97, fuelManagement: 98, pressure: 99 },
  },
  {
    id: 38,
    name: "George Russell",
    nationality: "Reino Unido",
    age: 28,
    number: 63,
    color: "#00a19c",
    visorColor: "#06b6d4",
    overall: 93,
    cost: 5200,
    aiProfile: "Equilibrado",
    styleKey: "Consistente",
    skillId: "qualifying_ace",
    personality: "Metódico e Veloz",
    specialty: "Classificação e Execução Técnica",
    drivingStyle: "Consistente · Entradas de curva precisas e gestão disciplinada de ritmo",
    teamName: "Aether GP",
    strength: "Consistência",
    weakness: "Ataques tardios em zebras altas",
    historyBio: "Piloto técnico e altamente consistente, capaz de colocar o carro acima do esperado em voltas decisivas.",
    attributes: { speed: 94, braking: 93, cornering: 94, overtaking: 92, defense: 93, consistency: 93, tireControl: 92, racecraft: 93, experience: 91, potential: 95, skill: 94, aggression: 89, precision: 94, wetSkill: 92, startSkill: 92, tireManagement: 92, fuelManagement: 93, pressure: 93 },
  },
  {
    id: 39,
    name: "Carlos Sainz",
    nationality: "Espanha",
    age: 31,
    number: 55,
    color: "#005aff",
    visorColor: "#f59e0b",
    overall: 93,
    cost: 5150,
    aiProfile: "Estratégico",
    styleKey: "Estratégico",
    skillId: "ice_veins",
    personality: "Estrategista de Cockpit",
    specialty: "Leitura de Pit Wall e Ritmo Constante",
    drivingStyle: "Estratégico · Suavidade nos comandos e adaptação inteligente às mudanças de pista",
    teamName: "Titan Motorsport",
    strength: "Economia",
    weakness: "Sobresterço extremo",
    historyBio: "Famoso por antecipar cenários estratégicos de dentro do cockpit, mantendo ritmo sólido e errando pouquíssimo.",
    attributes: { speed: 93, braking: 94, cornering: 94, overtaking: 91, defense: 94, consistency: 95, tireControl: 95, racecraft: 96, experience: 94, potential: 95, skill: 93, aggression: 87, precision: 94, wetSkill: 92, startSkill: 92, tireManagement: 95, fuelManagement: 96, pressure: 95 },
  },
  {
    id: 40,
    name: "Gabriel Bortoleto",
    nationality: "Brasil",
    age: 21,
    number: 5,
    color: "#00c853",
    visorColor: "#eab308",
    overall: 88,
    cost: 3000,
    aiProfile: "Novato",
    styleKey: "Calculista",
    skillId: "natural_talent",
    personality: "Talento Brasileiro",
    specialty: "Recuperação de Posições e Ritmo Crescente",
    drivingStyle: "Calculista · Equilíbrio entre agressividade controlada e preservação de equipamento",
    teamName: "Apex Motorsport",
    strength: "Recuperação",
    weakness: "Experiência sob tempestade",
    historyBio: "Jovem talento brasileiro com histórico de conquistas nas categorias de base e excelente capacidade de adaptação.",
    attributes: { speed: 90, braking: 89, cornering: 89, overtaking: 90, defense: 87, consistency: 89, tireControl: 88, racecraft: 89, experience: 81, potential: 96, skill: 90, aggression: 88, precision: 89, wetSkill: 88, startSkill: 88, tireManagement: 88, fuelManagement: 89, pressure: 89 },
  },
  {
    id: 41,
    name: "Sergio Pérez",
    nationality: "Argentina",
    age: 35,
    number: 11,
    color: "#1b365d",
    visorColor: "#10b981",
    overall: 90,
    cost: 4400,
    aiProfile: "Conservador",
    styleKey: "Estratégico",
    skillId: "tire_whisperer",
    personality: "Especialista em Pneus",
    specialty: "Stints Longos e Circuitos de Rua",
    drivingStyle: "Estratégico · Tração progressiva que prolonga a vida útil dos compostos macios e médios",
    teamName: "Chronos Racing",
    strength: "Gestão de pneus",
    weakness: "Volta única no frio",
    historyBio: "Reconhecido pela habilidade de estender janelas de pit stop e escalar o pelotão com estratégias alternativas.",
    attributes: { speed: 90, braking: 90, cornering: 90, overtaking: 91, defense: 93, consistency: 90, tireControl: 98, racecraft: 96, experience: 96, potential: 91, skill: 90, aggression: 86, precision: 90, wetSkill: 89, startSkill: 91, tireManagement: 98, fuelManagement: 96, pressure: 90 },
  },
  {
    id: 42,
    name: "Alexander Albon",
    nationality: "Reino Unido",
    age: 29,
    number: 23,
    color: "#38bdf8",
    visorColor: "#38bdf8",
    overall: 90,
    cost: 4300,
    aiProfile: "Defensivo",
    styleKey: "Defensivo",
    skillId: "iron_defender",
    personality: "Resiliente",
    specialty: "Velocidade de Reta e Defesa de Posição",
    drivingStyle: "Defensivo · Posicionamento eficiente de baixo arrasto e frenagens seguras",
    teamName: "Titan Motorsport",
    strength: "Consistência",
    weakness: "Curvas de baixa travadas",
    historyBio: "Especialista em extrair pontos importantes em corridas movimentadas e segurar pelotões inteiros com defesa limpa.",
    attributes: { speed: 91, braking: 91, cornering: 91, overtaking: 90, defense: 94, consistency: 91, tireControl: 92, racecraft: 93, experience: 90, potential: 93, skill: 91, aggression: 86, precision: 91, wetSkill: 90, startSkill: 89, tireManagement: 92, fuelManagement: 93, pressure: 91 },
  },
];

const iconDriverEntries = iconicDrivers.map((d) => ({
  ...d,
  attributes: {
    ...d.attributes,
    qualifyingPace: d.attributes.qualifyingPace ?? d.attributes.speed,
    racePace: d.attributes.racePace ?? d.attributes.racecraft,
  },
  suitColor: d.color,
  helmetColor: d.color,
  exclusiveSkill: exclusiveSkillById(d.skillId),
  tier: "icons",
  contractStatus: "Ícone do Grid",
  description: d.historyBio,
  portrait: `/assets/drivers/icons/driver-${String(d.id).padStart(2, "0")}.png`,
  helmet: `/assets/drivers/icons/helmet-${String(d.id).padStart(2, "0")}.png`,
}));

export const driverCatalog = [...baseDrivers, ...iconDriverEntries];

// Fictional name pools for Youth Academy random generation (never personal user data)
const YOUTH_FIRST_NAMES = [
  "Mateo",
  "Liam",
  "Kenji",
  "Rafael",
  "Theo",
  "Elena",
  "Sofia",
  "Hugo",
  "Caio",
  "Niko",
  "Clara",
  "Marco",
];
const YOUTH_LAST_NAMES = [
  "Valente",
  "Takahashi",
  "Bellini",
  "Mercier",
  "Lindqvist",
  "Mendes",
  "Richter",
  "Castellano",
  "Vance",
  "Moretti",
  "Kowalski",
  "Barros",
];

export function generateRandomAcademyPreset(seed = Date.now()) {
  const s = Math.abs(Math.floor(Number(seed) || 1));
  const firstName = YOUTH_FIRST_NAMES[s % YOUTH_FIRST_NAMES.length];
  const lastName = YOUTH_LAST_NAMES[(s * 7 + 3) % YOUTH_LAST_NAMES.length];
  const nationality = NATIONALITIES[(s * 5 + 1) % NATIONALITIES.length];
  const age = 17 + (s % 5);
  const program = ACADEMY_PROGRAMS[s % ACADEMY_PROGRAMS.length].id;
  const styleKey = STYLE_KEYS[(s * 3) % STYLE_KEYS.length];
  const skillId = EXCLUSIVE_SKILLS[(s * 11) % EXCLUSIVE_SKILLS.length].id;
  const suitColor = palette[s % palette.length];
  const helmetColor = palette[(s + 4) % palette.length];
  const visorColor = visorPalette[s % visorPalette.length];
  const number = 10 + ((s * 13) % 88);
  return {
    firstName,
    lastName,
    nationality,
    age,
    program,
    styleKey,
    skillId,
    suitColor,
    helmetColor,
    visorColor,
    number,
  };
}

export function computeOverallFromAttributes(attrs) {
  const keys = [
    "speed",
    "braking",
    "cornering",
    "overtaking",
    "defense",
    "consistency",
    "tireControl",
    "racecraft",
    "experience",
  ];
  const sum = keys.reduce((acc, k) => acc + (Number(attrs[k]) || 60), 0);
  return Math.max(50, Math.min(99, Math.round(sum / keys.length)));
}

export function createAcademyDriver(params = {}, existing = []) {
  const idx = existing.length;
  const cleanFirst =
    String(params.firstName || "Mateo")
      .trim()
      .slice(0, 18) || "Mateo";
  const cleanLast =
    String(params.lastName || "Valente")
      .trim()
      .slice(0, 18) || "Valente";
  const name = `${cleanFirst} ${cleanLast}`.trim();
  const nationality = NATIONALITIES.includes(params.nationality)
    ? params.nationality
    : NATIONALITIES[0];
  const age = Math.max(16, Math.min(23, Math.floor(Number(params.age) || 18)));
  const prog =
    ACADEMY_PROGRAMS.find((p) => p.id === params.program) || ACADEMY_PROGRAMS[0];
  const styleKey = DRIVING_STYLES[params.styleKey]
    ? params.styleKey
    : "Calculista";
  const skillObj = exclusiveSkillById(params.skillId || "natural_talent");
  const suitColor = /^#[0-9a-f]{6}$/i.test(params.suitColor)
    ? params.suitColor
    : palette[idx % palette.length];
  const helmetColor = /^#[0-9a-f]{6}$/i.test(params.helmetColor)
    ? params.helmetColor
    : palette[(idx + 3) % palette.length];
  const visorColor = /^#[0-9a-f]{6}$/i.test(params.visorColor)
    ? params.visorColor
    : visorPalette[idx % visorPalette.length];
  const number = Math.max(
    2,
    Math.min(99, Math.floor(Number(params.number) || 28 + idx * 7)),
  );

  // Balanced rookie base attributes (or user-configured individual attributes within balanced bounds)
  const ageFactor = Math.max(0, age - 16);
  const b = prog.bonuses;
  const clampCustom = (val, def) =>
    typeof val === "number" && Number.isFinite(val)
      ? Math.max(45, Math.min(88, Math.round(val)))
      : def;
  const ca = params.customAttributes || {};
  const customSpeed = clampCustom(ca.speed ?? ca.qualifyingPace, 58 + (b.speed || 0) + (idx % 3));
  const customRacecraft = clampCustom(ca.racecraft ?? ca.racePace, 56 + (b.racecraft || 0));
  const rawAttrs = {
    speed: customSpeed,
    qualifyingPace:
      ca.qualifyingPace !== undefined || ca.speed !== undefined
        ? customSpeed
        : undefined,
    braking: clampCustom(ca.braking, 57 + (b.braking || 0)),
    cornering: clampCustom(ca.cornering, 58 + (b.cornering || 0)),
    overtaking: clampCustom(ca.overtaking, 56 + (b.overtaking || 0)),
    defense: clampCustom(ca.defense, 56 + (b.defense || 0)),
    consistency: clampCustom(ca.consistency, 57 + (b.consistency || 0)),
    tireControl: clampCustom(ca.tireControl, 56 + (b.tireControl || 0)),
    racecraft: customRacecraft,
    racePace:
      ca.racePace !== undefined || ca.racecraft !== undefined
        ? customRacecraft
        : undefined,
    experience: clampCustom(ca.experience, 48 + ageFactor * 2 + (b.experience || 0)),
    potential: Math.min(
      96,
      91 - Math.floor(ageFactor * 0.8) + (skillObj.id === "natural_talent" ? 3 : 0),
    ),
  };
  const attributes = buildTenAttributes(rawAttrs, 100 + idx, "normal");
  const overall = computeOverallFromAttributes(attributes);
  const portraitIndex = Number.isInteger(params.portraitIndex)
    ? Math.max(0, Math.min(9, params.portraitIndex))
    : idx % 10;
  const validCustomPortrait =
    typeof params.customPortrait === "string" &&
    (params.customPortrait.startsWith("data:image/") ||
      params.customPortrait.startsWith("/assets/drivers/")) &&
    params.customPortrait.length <= 450000
      ? params.customPortrait
      : null;
  const usePlaceholder = !!params.usePlaceholder;
  const defaultPortrait = `/assets/drivers/normal/driver-${String(portraitIndex).padStart(2, "0")}.png`;
  const finalPortrait =
    validCustomPortrait ||
    (usePlaceholder ? PLACEHOLDER_DRIVER_PORTRAIT : defaultPortrait);
  const isPlaceholderPortrait =
    finalPortrait === PLACEHOLDER_DRIVER_PORTRAIT;

  return {
    uid: params.uid || `acad-${idx + 1}-${number}`,
    id: 100 + idx,
    isAcademy: true,
    name,
    firstName: cleanFirst,
    lastName: cleanLast,
    nationality,
    age,
    tier: "normal",
    program: prog.id,
    programName: prog.name,
    number,
    color: suitColor,
    suitColor,
    helmetColor,
    visorColor,
    overall,
    aiProfile: DRIVING_STYLES[styleKey].aiProfile,
    styleKey,
    skillId: skillObj.id,
    exclusiveSkill: skillObj,
    specialty: skillObj.name,
    personality: "Talento da Base",
    drivingStyle: `${styleKey} · ${DRIVING_STYLES[styleKey].summary}`,
    teamName: String(params.teamName || "Academia Apex Motorsport").slice(0, 36),
    contractStatus: "Academia da Base",
    description: `${name} (${age} anos, ${nationality}) ingressou pelo programa ${prog.name}. Potencial máximo estimado em ${attributes.potential}.`,
    historyBio: `Piloto formado na Academia da Base com foco em ${prog.focus.toLowerCase()}.`,
    strength: skillObj.name,
    weakness: "Experiência em campeonatos mundiais",
    cost: 0,
    xp: 0,
    level: 1,
    trainingSessions: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    attributes,
    portraitIndex,
    customPortrait: validCustomPortrait,
    usePlaceholder,
    isPlaceholderPortrait,
    portrait: finalPortrait,
    helmet: `/assets/drivers/normal/helmet-${String(portraitIndex).padStart(2, "0")}.png`,
  };
}

export function validateAcademyDriver(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const base = createAcademyDriver(
    {
      uid:
        typeof raw.uid === "string" && raw.uid.length <= 32
          ? raw.uid
          : `acad-${index + 1}`,
      firstName: raw.firstName,
      lastName: raw.lastName,
      nationality: raw.nationality,
      age: raw.age,
      program: raw.program,
      styleKey: raw.styleKey,
      skillId: raw.skillId,
      suitColor: raw.suitColor,
      helmetColor: raw.helmetColor,
      visorColor: raw.visorColor,
      number: raw.number,
      teamName: raw.teamName,
      portraitIndex: raw.portraitIndex,
      customPortrait: raw.customPortrait,
      usePlaceholder: raw.usePlaceholder,
    },
    Array.from({ length: index }),
  );
  const clampAttr = (v, fb) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(40, Math.min(99, Math.round(v)))
      : fb;
  if (raw.attributes && typeof raw.attributes === "object") {
    const pot = clampAttr(raw.attributes.potential, base.attributes.potential);
    const updated = {
      speed: Math.min(pot, clampAttr(raw.attributes.speed, base.attributes.speed)),
      braking: Math.min(pot, clampAttr(raw.attributes.braking, base.attributes.braking)),
      cornering: Math.min(pot, clampAttr(raw.attributes.cornering, base.attributes.cornering)),
      overtaking: Math.min(pot, clampAttr(raw.attributes.overtaking, base.attributes.overtaking)),
      defense: Math.min(pot, clampAttr(raw.attributes.defense, base.attributes.defense)),
      consistency: Math.min(pot, clampAttr(raw.attributes.consistency, base.attributes.consistency)),
      tireControl: Math.min(pot, clampAttr(raw.attributes.tireControl, base.attributes.tireControl)),
      racecraft: Math.min(pot, clampAttr(raw.attributes.racecraft, base.attributes.racecraft)),
      experience: Math.min(pot, clampAttr(raw.attributes.experience, base.attributes.experience)),
      qualifyingPace:
        raw.attributes.qualifyingPace !== undefined
          ? Math.min(pot, clampAttr(raw.attributes.qualifyingPace, base.attributes.qualifyingPace))
          : undefined,
      racePace:
        raw.attributes.racePace !== undefined
          ? Math.min(pot, clampAttr(raw.attributes.racePace, base.attributes.racePace))
          : undefined,
      potential: pot,
    };
    base.attributes = buildTenAttributes(updated, base.id, "normal");
    base.overall = computeOverallFromAttributes(base.attributes);
  }
  base.xp = Math.max(0, Math.min(1e6, Math.floor(Number(raw.xp) || 0)));
  base.level = Math.max(1, Math.min(20, Math.floor(Number(raw.level) || 1)));
  base.trainingSessions = Math.max(
    0,
    Math.min(500, Math.floor(Number(raw.trainingSessions) || 0)),
  );
  base.races = Math.max(0, Math.min(10000, Math.floor(Number(raw.races) || 0)));
  base.wins = Math.max(0, Math.min(10000, Math.floor(Number(raw.wins) || 0)));
  base.podiums = Math.max(
    0,
    Math.min(10000, Math.floor(Number(raw.podiums) || 0)),
  );
  return base;
}

export function developAcademyDriver(driver, kind = "simulator", raceInfo = {}) {
  if (!driver || !driver.attributes) return { gained: 0, message: "" };
  const pot = driver.attributes.potential || 90;
  const talentMult = driver.skillId === "natural_talent" ? 1.25 : 1.0;
  const boost = (key, amount) => {
    const cur = driver.attributes[key] || 60;
    if (cur >= pot) return 0;
    const next = Math.min(pot, Math.round(cur + amount * talentMult));
    const diff = next - cur;
    driver.attributes[key] = next;
    return diff;
  };
  let totalGain = 0;
  if (kind === "pace") {
    totalGain += boost("speed", 2);
    totalGain += boost("braking", 2);
    totalGain += boost("cornering", 2);
    totalGain += boost("experience", 1);
    driver.trainingSessions = (driver.trainingSessions || 0) + 1;
    driver.xp = (driver.xp || 0) + 160;
  } else if (kind === "racecraft") {
    totalGain += boost("overtaking", 2);
    totalGain += boost("defense", 2);
    totalGain += boost("tireControl", 2);
    totalGain += boost("racecraft", 2);
    driver.trainingSessions = (driver.trainingSessions || 0) + 1;
    driver.xp = (driver.xp || 0) + 160;
  } else if (kind === "consistency") {
    totalGain += boost("consistency", 3);
    totalGain += boost("racecraft", 2);
    totalGain += boost("experience", 2);
    driver.trainingSessions = (driver.trainingSessions || 0) + 1;
    driver.xp = (driver.xp || 0) + 160;
  } else if (kind === "race") {
    const pos = raceInfo.position || 6;
    const isTitular = !!raceInfo.titular;
    driver.races = (driver.races || 0) + (isTitular ? 1 : 0);
    if (isTitular && pos === 1) driver.wins = (driver.wins || 0) + 1;
    if (isTitular && pos <= 3) driver.podiums = (driver.podiums || 0) + 1;
    totalGain += boost("experience", isTitular ? 2 : 1);
    if (isTitular) {
      totalGain += boost("consistency", pos <= 3 ? 2 : 1);
      totalGain += boost("racecraft", 1);
      totalGain += boost(pos <= 2 ? "speed" : "cornering", 1);
      if (pos <= 3) totalGain += boost("overtaking", 1);
    } else {
      totalGain += boost("racecraft", 1);
    }
    driver.xp = (driver.xp || 0) + (isTitular ? 240 + (7 - pos) * 35 : 80);
  }
  driver.attributes = buildTenAttributes(driver.attributes, driver.id, "normal");
  driver.overall = computeOverallFromAttributes(driver.attributes);
  driver.level = Math.min(20, 1 + Math.floor((driver.xp || 0) / 300));
  return {
    gained: totalGain,
    overall: driver.overall,
    message:
      totalGain > 0
        ? `${driver.name} evoluiu para Overall ${driver.overall} (+${totalGain} pts de atributo).`
        : `${driver.name} atingiu o teto de Potencial (${pot}) nestes fundamentos.`,
  };
}

export function activeAcademyDriver(save) {
  if (!save?.promotedAcademyId || !Array.isArray(save?.academy)) return null;
  return (
    save.academy.find((a) => a.uid === save.promotedAcademyId) || null
  );
}

export function activeDriverForSave(save) {
  const promoted = activeAcademyDriver(save);
  if (promoted) return promoted;
  return driverCatalog[save?.selectedDriver ?? 0] || driverCatalog[0];
}

export function resolveDriverPortrait(driver, save = null) {
  if (!driver) {
    return {
      src: PLACEHOLDER_DRIVER_PORTRAIT,
      isPlaceholder: true,
      isCustom: false,
      filename: "apex-dynasty-piloto-substituto.png",
    };
  }
  const key = driver.uid || String(driver.id ?? 0);
  const override = save?.customPortraits?.[key];
  const src =
    override ||
    driver.customPortrait ||
    driver.portrait ||
    PLACEHOLDER_DRIVER_PORTRAIT;
  const isPlaceholder =
    src === PLACEHOLDER_DRIVER_PORTRAIT || !!driver.isPlaceholderPortrait;
  const isCustom = !!(override || driver.customPortrait);
  const slug = String(driver.name || "piloto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const num = String(driver.number ?? 0).padStart(2, "0");
  const filename = isPlaceholder
    ? `apex-dynasty-piloto-${num}-${slug}-imagem-substituta.png`
    : `apex-dynasty-piloto-${num}-${slug}.png`;
  return { src, isPlaceholder, isCustom, filename };
}

export function pilotPersonality(id, customDriver = null) {
  const d = customDriver || driverCatalog[id] || driverCatalog[0];
  const base = Object.fromEntries(
    Object.entries(d.attributes).map(([k, v]) => [k, v / 100]),
  );
  const style = DRIVING_STYLES[d.styleKey] || DRIVING_STYLES.Consistente;
  base.aiProfile = d.aiProfile || style.aiProfile || "Equilibrado";
  base.styleKey = d.styleKey || "Consistente";
  base.skillId = d.exclusiveSkill?.id || d.skillId || "qualifying_ace";
  base.paceMod = style.paceMod;
  base.aggression = Math.min(1.15, (base.aggression ?? 0.75) * style.aggressionMod);
  base.defense = Math.min(1.2, (base.defense ?? 0.75) * style.defenseMod);
  base.consistency = Math.min(0.99, (base.consistency ?? 0.75) * style.consistencyMod);
  return base;
}

export function pilotStats(
  stats,
  id,
  mode = "quick",
  realism = "arcade",
  customDriver = null,
) {
  const d = customDriver || driverCatalog[id] || driverCatalog[0],
    p = pilotPersonality(d.id, customDriver);
  const extreme = d.id === 30 && mode === "mega" && realism === "arcade";
  const tireBonus = p.skillId === "tire_whisperer" ? 0.04 : 0;
  return {
    ...stats,
    maxSpeed: Math.min(110, stats.maxSpeed * (extreme ? 1.38 : 1)),
    acceleration: stats.acceleration * (extreme ? 1.3 : 1),
    grip: stats.grip * (extreme ? 1.35 : 1 + (p.cornering ?? p.precision) * 0.03),
    consumption: stats.consumption * (1 - (p.racecraft ?? p.fuelManagement) * 0.1),
    tireWear:
      stats.tireWear *
      (1 - Math.min(0.22, (p.tireControl ?? p.tireManagement) * 0.13 + tireBonus)),
  };
}
