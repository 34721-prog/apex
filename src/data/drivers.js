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
const teamNames = [
  "Apex Motorsport",
  "Vortex Racing",
  "Scuderia Veloce",
  "Chronos Racing",
  "Aether GP",
  "Titan Motorsport",
];

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
  const score = (offset) => Math.min(99, base + ((id * offset) % 13));
  const color = palette[id % 10];
  const aiProfile =
    id === 30 || tier === "legendary"
      ? id % 2 === 0
        ? "Elite"
        : "Estratégico"
      : id < 3
        ? "Novato"
        : aiProfileOrder[id % aiProfileOrder.length];
  return {
    id,
    name,
    tier,
    number:
      id === 30
        ? 0
        : [
            7, 22, 18, 44, 31, 63, 15, 26, 39, 52, 9, 24, 33, 45, 58, 66, 72,
            81, 93, 12, 3, 14, 27, 36, 48, 59, 67, 78, 86, 99,
          ][id],
    color,
    overall: id === 30 ? "∞" : Math.round(base + 5),
    aiProfile,
    specialty: id === 30 ? "Domínio absoluto" : specialties[id % 10],
    personality: id === 30 ? "Implacável" : traits[id % 10],
    drivingStyle:
      id === 30
        ? "Perfeição mecânica em todas as zonas de frenagem e tração"
        : `Estilo ${aiProfile.toLowerCase()} focado em ${specialties[id % 10].toLowerCase()}`,
    teamName: teamNames[id % teamNames.length],
    contractStatus: id === 0 ? "Titular" : "Disponível",
    description:
      id === 30
        ? "O último adversário. Sem atalhos, sem limites imaginários: vença Baxter no seu próprio evento."
        : `${name.split(" ")[0]} lê a pista através de ${specialties[id % 10].toLowerCase()}. ${id % 2 ? "Prefere construir a disputa volta após volta." : "Procura a oportunidade antes que ela apareça."}`,
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
    attributes: {
      skill: score(3),
      consistency: score(5),
      aggression: score(7),
      precision: score(11),
      overtaking: score(2),
      defense: score(8),
      wetSkill: score(10),
      startSkill: score(12),
      experience: score(13),
      tireManagement: score(4),
      fuelManagement: score(6),
      pressure: score(9),
    },
    portrait: `/assets/drivers/${tier}/driver-${String(id).padStart(2, "0")}.png`,
    helmet: `/assets/drivers/${tier}/helmet-${String(id).padStart(2, "0")}.png`,
  };
});

// Iconic public motorsport drivers with original stylized portraits and internal simulation stats.
const iconicDrivers = [
  {
    id: 31,
    name: "Max Verstappen",
    number: 1,
    color: "#1e41ff",
    overall: 98,
    cost: 6800,
    aiProfile: "Elite",
    personality: "Dominante",
    specialty: "Ritmo Implacável e Ataque no Limite",
    drivingStyle: "Entrada agressiva de frente com controle cirúrgico de tração",
    teamName: "Chronos Racing",
    strength: "Ultrapassagens",
    weakness: "Paciência no tráfego",
    historyBio: "Múltiplo campeão conhecido por consistência extrema, ultrapassagens decididas e leitura perfeita sob chuva.",
    attributes: { skill: 99, consistency: 98, aggression: 95, precision: 98, overtaking: 98, defense: 97, wetSkill: 99, startSkill: 97, experience: 96, tireManagement: 96, fuelManagement: 95, pressure: 99 },
  },
  {
    id: 32,
    name: "Kimi Antonelli",
    number: 12,
    color: "#00d2be",
    overall: 89,
    cost: 3200,
    aiProfile: "Novato",
    personality: "Prodígio Veloz",
    specialty: "Velocidade Pura em Classificação",
    drivingStyle: "Reflexos rápidos em curvas de alta e ataques ousados na freada",
    teamName: "Aether GP",
    strength: "Curvas rápidas",
    weakness: "Experiência em stints longos",
    historyBio: "Fenômeno da nova geração do automobilismo, combinando velocidade natural impressionante com rápida evolução técnica.",
    attributes: { skill: 92, consistency: 86, aggression: 91, precision: 90, overtaking: 90, defense: 86, wetSkill: 89, startSkill: 89, experience: 80, tireManagement: 86, fuelManagement: 87, pressure: 88 },
  },
  {
    id: 33,
    name: "Lewis Hamilton",
    number: 44,
    color: "#dc0000",
    overall: 97,
    cost: 6600,
    aiProfile: "Estratégico",
    personality: "Lenda Estratégica",
    specialty: "Gestão de Pneus e Corridas na Chuva",
    drivingStyle: "Frenagem tardia progressiva e conservação magistral de composto",
    teamName: "Scuderia Veloce",
    strength: "Chuva",
    weakness: "Aquecimento inicial de composto duro",
    historyBio: "Referência histórica de longevidade, leitura estratégica de stints longos e domínio em condições climáticas mistas.",
    attributes: { skill: 97, consistency: 97, aggression: 89, precision: 98, overtaking: 96, defense: 96, wetSkill: 99, startSkill: 96, experience: 99, tireManagement: 99, fuelManagement: 98, pressure: 99 },
  },
  {
    id: 34,
    name: "Charles Leclerc",
    number: 16,
    color: "#ef1a2d",
    overall: 95,
    cost: 5900,
    aiProfile: "Agressivo",
    personality: "Especialista de Volta Rápida",
    specialty: "Volta de Classificação e Ataque em Curva",
    drivingStyle: "Rotação rápida no apex e comprometimento total nas zebras",
    teamName: "Scuderia Veloce",
    strength: "Frenagem",
    weakness: "Desgaste no limite",
    historyBio: "Especialista em extrair cada milésimo em voltas lançadas e duelos roda a roda em circuitos de rua e alta velocidade.",
    attributes: { skill: 97, consistency: 93, aggression: 94, precision: 96, overtaking: 95, defense: 93, wetSkill: 93, startSkill: 94, experience: 92, tireManagement: 91, fuelManagement: 92, pressure: 94 },
  },
  {
    id: 35,
    name: "Lando Norris",
    number: 4,
    color: "#ff8000",
    overall: 95,
    cost: 5800,
    aiProfile: "Equilibrado",
    personality: "Rítmico e Preciso",
    specialty: "Ritmo de Stint Longo e Curvas de Alta",
    drivingStyle: "Trajetória limpa com velocidade mínima de contorno elevada",
    teamName: "Vortex Racing",
    strength: "Gestão de pneus",
    weakness: "Primeira curva sob tráfego fechado",
    historyBio: "Destaca-se pelo ritmo fortíssimo na metade final de corrida, excelente preservação de pneus e precisão constante.",
    attributes: { skill: 96, consistency: 95, aggression: 89, precision: 96, overtaking: 93, defense: 92, wetSkill: 95, startSkill: 91, experience: 91, tireManagement: 96, fuelManagement: 95, pressure: 93 },
  },
  {
    id: 36,
    name: "Oscar Piastri",
    number: 81,
    color: "#ff9e1b",
    overall: 93,
    cost: 5300,
    aiProfile: "Estratégico",
    personality: "Frio e Calculista",
    specialty: "Calma Sob Pressão e Ultrapassagem Limpa",
    drivingStyle: "Frieza clínica em disputas diretas e traçado disciplinado",
    teamName: "Vortex Racing",
    strength: "Pressão",
    weakness: "Economia extrema",
    historyBio: "Conhecido pela postura inabalável sob pressão intensa, decisões precisas na largada e defesa inteligente de posição.",
    attributes: { skill: 94, consistency: 95, aggression: 88, precision: 95, overtaking: 93, defense: 94, wetSkill: 92, startSkill: 93, experience: 88, tireManagement: 92, fuelManagement: 93, pressure: 97 },
  },
  {
    id: 37,
    name: "Fernando Alonso",
    number: 14,
    color: "#006f62",
    overall: 95,
    cost: 6000,
    aiProfile: "Defensivo",
    personality: "Mestre Tático",
    specialty: "Defesa de Posição, Largadas e Leitura de Corrida",
    drivingStyle: "Posicionamento tático perfeito e aproveitamento total de aderência",
    teamName: "Apex Motorsport",
    strength: "Largadas",
    weakness: "Circuitos puramente de motor",
    historyBio: "Veterano lendário com visão estratégica incomparável, famoso por largadas fulminantes e defesas quase intransponíveis.",
    attributes: { skill: 95, consistency: 97, aggression: 92, precision: 97, overtaking: 96, defense: 99, wetSkill: 97, startSkill: 99, experience: 99, tireManagement: 97, fuelManagement: 98, pressure: 99 },
  },
  {
    id: 38,
    name: "George Russell",
    number: 63,
    color: "#00a19c",
    overall: 93,
    cost: 5200,
    aiProfile: "Equilibrado",
    personality: "Metódico e Veloz",
    specialty: "Classificação e Execução Técnica",
    drivingStyle: "Entradas de curva precisas e gestão disciplinada de ritmo",
    teamName: "Aether GP",
    strength: "Consistência",
    weakness: "Ataques tardios em zebras altas",
    historyBio: "Piloto técnico e altamente consistente, capaz de colocar o carro acima do esperado em voltas decisivas.",
    attributes: { skill: 94, consistency: 93, aggression: 89, precision: 94, overtaking: 92, defense: 93, wetSkill: 92, startSkill: 92, experience: 91, tireManagement: 92, fuelManagement: 93, pressure: 93 },
  },
  {
    id: 39,
    name: "Carlos Sainz",
    number: 55,
    color: "#005aff",
    overall: 93,
    cost: 5150,
    aiProfile: "Estratégico",
    personality: "Estrategista de Cockpit",
    specialty: "Leitura de Pit Wall e Ritmo Constante",
    drivingStyle: "Suavidade nos comandos e adaptação inteligente às mudanças de pista",
    teamName: "Titan Motorsport",
    strength: "Economia",
    weakness: "Sobresterço extremo",
    historyBio: "Famoso por antecipar cenários estratégicos de dentro do cockpit, mantendo ritmo sólido e errando pouquíssimo.",
    attributes: { skill: 93, consistency: 95, aggression: 87, precision: 94, overtaking: 91, defense: 94, wetSkill: 92, startSkill: 92, experience: 94, tireManagement: 95, fuelManagement: 96, pressure: 95 },
  },
  {
    id: 40,
    name: "Gabriel Bortoleto",
    number: 5,
    color: "#00c853",
    overall: 88,
    cost: 3000,
    aiProfile: "Novato",
    personality: "Talento Brasileiro",
    specialty: "Recuperação de Posições e Ritmo Crescente",
    drivingStyle: "Equilíbrio entre agressividade controlada e preservação de equipamento",
    teamName: "Apex Motorsport",
    strength: "Recuperação",
    weakness: "Experiência sob tempestade",
    historyBio: "Jovem talento brasileiro com histórico de conquistas nas categorias de base e excelente capacidade de adaptação.",
    attributes: { skill: 90, consistency: 89, aggression: 88, precision: 89, overtaking: 90, defense: 87, wetSkill: 88, startSkill: 88, experience: 81, tireManagement: 88, fuelManagement: 89, pressure: 89 },
  },
  {
    id: 41,
    name: "Sergio Pérez",
    number: 11,
    color: "#1b365d",
    overall: 90,
    cost: 4400,
    aiProfile: "Conservador",
    personality: "Especialista em Pneus",
    specialty: "Stints Longos e Circuitos de Rua",
    drivingStyle: "Tração progressiva que prolonga a vida útil dos compostos macios e médios",
    teamName: "Chronos Racing",
    strength: "Gestão de pneus",
    weakness: "Volta única no frio",
    historyBio: "Reconhecido pela habilidade de estender janelas de pit stop e escalar o pelotão com estratégias alternativas.",
    attributes: { skill: 90, consistency: 90, aggression: 86, precision: 90, overtaking: 91, defense: 93, wetSkill: 89, startSkill: 91, experience: 96, tireManagement: 98, fuelManagement: 96, pressure: 90 },
  },
  {
    id: 42,
    name: "Alexander Albon",
    number: 23,
    color: "#38bdf8",
    overall: 90,
    cost: 4300,
    aiProfile: "Defensivo",
    personality: "Resiliente",
    specialty: "Velocidade de Reta e Defesa de Posição",
    drivingStyle: "Posicionamento eficiente de baixo arrasto e frenagens seguras",
    teamName: "Titan Motorsport",
    strength: "Consistência",
    weakness: "Curvas de baixa travadas",
    historyBio: "Especialista em extrair pontos importantes em corridas movimentadas e segurar pelotões inteiros com defesa limpa.",
    attributes: { skill: 91, consistency: 91, aggression: 86, precision: 91, overtaking: 90, defense: 94, wetSkill: 90, startSkill: 89, experience: 90, tireManagement: 92, fuelManagement: 93, pressure: 91 },
  },
];

const iconDriverEntries = iconicDrivers.map((d) => ({
  ...d,
  tier: "icons",
  contractStatus: "Ícone do Grid",
  description: d.historyBio,
  portrait: `/assets/drivers/icons/driver-${String(d.id).padStart(2, "0")}.png`,
  helmet: `/assets/drivers/icons/helmet-${String(d.id).padStart(2, "0")}.png`,
}));

export const driverCatalog = [...baseDrivers, ...iconDriverEntries];

export function pilotPersonality(id) {
  const d = driverCatalog[id] || driverCatalog[0];
  const base = Object.fromEntries(
    Object.entries(d.attributes).map(([k, v]) => [k, v / 100]),
  );
  base.aiProfile = d.aiProfile || "Equilibrado";
  return base;
}

export function pilotStats(stats, id, mode = "quick", realism = "arcade") {
  const d = driverCatalog[id] || driverCatalog[0],
    p = pilotPersonality(d.id);
  const extreme = d.id === 30 && mode === "mega" && realism === "arcade";
  return {
    ...stats,
    maxSpeed: Math.min(110, stats.maxSpeed * (extreme ? 1.38 : 1)),
    acceleration: stats.acceleration * (extreme ? 1.3 : 1),
    grip: stats.grip * (extreme ? 1.35 : 1 + p.precision * 0.03),
    consumption: stats.consumption * (1 - p.fuelManagement * 0.1),
    tireWear: stats.tireWear * (1 - p.tireManagement * 0.13),
  };
}
