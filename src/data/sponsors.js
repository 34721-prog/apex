// 10 Fictional Motorsport Sponsors across 10 sectors + Team Principals & Strategic Events.
export const sponsorCatalog = [
  {
    id: "aether_ai",
    name: "Aether AI Systems",
    short: "AETHER AI",
    sector: "Tecnologia",
    primaryColor: "#00d2ff",
    secondaryColor: "#0b192c",
    accentColor: "#e0f2fe",
    tagline: "Telemetria Preditiva & Computação Quântica",
    signingBonus: 650,
    basePayout: 220,
    goalType: "finishTop3",
    goalLabel: "Terminar no Top 3 (Pódio)",
    goalBonus: 480,
  },
  {
    id: "helios_energy",
    name: "Helios Fusion Energy",
    short: "HELIOS",
    sector: "Energia",
    primaryColor: "#ff8a00",
    secondaryColor: "#1f1300",
    accentColor: "#fef3c7",
    tagline: "Combustíveis Sintéticos Zero-Carbono",
    signingBonus: 720,
    basePayout: 250,
    goalType: "finishTop2",
    goalLabel: "Terminar entre os 2 primeiros",
    goalBonus: 580,
  },
  {
    id: "pirex_tires",
    name: "Pirex Motorsport Tires",
    short: "PIREX",
    sector: "Pneus",
    primaryColor: "#ff2a4b",
    secondaryColor: "#18181b",
    accentColor: "#ffe4e6",
    tagline: "Compostos de Alta Aderência para Pista",
    signingBonus: 600,
    basePayout: 240,
    goalType: "pitCompleted",
    goalLabel: "Completar parada de box limpa e pontuar",
    goalBonus: 420,
  },
  {
    id: "bremtek_brakes",
    name: "Bremtek Precision Brakes",
    short: "BREMTEK",
    sector: "Autopeças",
    primaryColor: "#e11d48",
    secondaryColor: "#0f172a",
    accentColor: "#f8fafc",
    tagline: "Sistemas de Frenagem Cerâmica de Competição",
    signingBonus: 580,
    basePayout: 210,
    goalType: "cleanRace",
    goalLabel: "Terminar com integridade do carro acima de 85%",
    goalBonus: 440,
  },
  {
    id: "nexatel_6g",
    name: "NexaTel 6G Global",
    short: "NEXATEL 6G",
    sector: "Telecomunicações",
    primaryColor: "#38bdf8",
    secondaryColor: "#0c192c",
    accentColor: "#e0f2fe",
    tagline: "Conectividade Ultra-Rápida Pit-Wall",
    signingBonus: 680,
    basePayout: 230,
    goalType: "finishTop3",
    goalLabel: "Terminar no Pódio (P1–P3)",
    goalBonus: 490,
  },
  {
    id: "aurum_capital",
    name: "Aurum Capital Group",
    short: "AURUM",
    sector: "Finanças",
    primaryColor: "#eab308",
    secondaryColor: "#1c1917",
    accentColor: "#fef9c3",
    tagline: "Gestão Global de Ativos e Private Banking",
    signingBonus: 850,
    basePayout: 280,
    goalType: "winRace",
    goalLabel: "Vencer a corrida (P1)",
    goalBonus: 780,
  },
  {
    id: "nitropulse_drink",
    name: "NitroPulse Energy Drink",
    short: "NITROPULSE",
    sector: "Bebidas",
    primaryColor: "#22c55e",
    secondaryColor: "#052e16",
    accentColor: "#dcfce7",
    tagline: "Reflexos Rápidos no Limite do Apex",
    signingBonus: 620,
    basePayout: 215,
    goalType: "fastestPace",
    goalLabel: "Terminar no Top 3 com ritmo agressivo",
    goalBonus: 470,
  },
  {
    id: "synapse_cloud",
    name: "Synapse OS Cloud",
    short: "SYNAPSE",
    sector: "Software",
    primaryColor: "#a855f7",
    secondaryColor: "#1e1b4b",
    accentColor: "#f3e8ff",
    tagline: "Simulação de Túnel de Vento Digital",
    signingBonus: 640,
    basePayout: 225,
    goalType: "finishTop4",
    goalLabel: "Terminar no Top 4 da corrida",
    goalBonus: 410,
  },
  {
    id: "atlas_logistics",
    name: "Atlas Cargo Express",
    short: "ATLAS",
    sector: "Logística",
    primaryColor: "#f97316",
    secondaryColor: "#172554",
    accentColor: "#ffedd5",
    tagline: "Logística Aérea Mundial de Paddock",
    signingBonus: 560,
    basePayout: 235,
    goalType: "finishRace",
    goalLabel: "Cruzar a bandeirada sem abandono",
    goalBonus: 360,
  },
  {
    id: "titan_engineering",
    name: "Titan Dynamics Lab",
    short: "TITAN LAB",
    sector: "Engenharia",
    primaryColor: "#94a3b8",
    secondaryColor: "#0f172a",
    accentColor: "#f1f5f9",
    tagline: "Compósitos Estruturais e Aeroespaciais",
    signingBonus: 700,
    basePayout: 245,
    goalType: "cleanRace",
    goalLabel: "Terminar no Top 4 com carro íntegro (>80%)",
    goalBonus: 520,
  },
];

export const sponsorById = (id) =>
  sponsorCatalog.find((s) => s.id === id) || sponsorCatalog[0];

export function evaluateSponsorGoal(sponsor, result = {}) {
  const s = typeof sponsor === "string" ? sponsorById(sponsor) : sponsor || sponsorCatalog[0];
  const pos = Number(result.position) || 6;
  const health = Number(result.health ?? 1);
  const stops = Number(result.stops ?? 0);
  const dnf = Boolean(result.dnf);
  if (dnf) return { met: false, payout: Math.round(s.basePayout * 0.4), bonus: 0, total: Math.round(s.basePayout * 0.4) };
  let met = false;
  switch (s.goalType) {
    case "winRace":
      met = pos === 1;
      break;
    case "finishTop2":
      met = pos <= 2;
      break;
    case "finishTop3":
    case "fastestPace":
      met = pos <= 3;
      break;
    case "finishTop4":
      met = pos <= 4;
      break;
    case "pitCompleted":
      met = stops >= 1 && pos <= 5;
      break;
    case "cleanRace":
      met = health >= 0.82 && pos <= 4;
      break;
    case "finishRace":
    default:
      met = pos <= 6;
      break;
  }
  const bonus = met ? s.goalBonus : 0;
  return {
    sponsorId: s.id,
    sponsorName: s.name,
    sector: s.sector,
    goalLabel: s.goalLabel,
    met,
    payout: s.basePayout,
    bonus,
    total: s.basePayout + bonus,
  };
}

export const teamPrincipals = [
  {
    id: 0,
    name: "Helena Vance",
    role: "Diretora de Estratégia & Pit Wall",
    specialty: "Paradas de Box & Decisão sob Safety Car",
    pitBonus: 0.14,
    rdDiscount: 0.04,
    sponsorMultiplier: 1.05,
    tireCareBonus: 0.04,
    quote: "Corridas são vencidas nos décimos economizados no pit lane e na leitura fria do tráfego.",
  },
  {
    id: 1,
    name: "Marco Bellini",
    role: "Diretor Técnico de P&D",
    specialty: "Desenvolvimento Aerodinâmico & Eficiência de Oficina",
    pitBonus: 0.05,
    rdDiscount: 0.15,
    sponsorMultiplier: 1.02,
    tireCareBonus: 0.05,
    quote: "Um assoalho bem calibrado no túnel de vento vale mais do que qualquer manobra desesperada.",
  },
  {
    id: 2,
    name: "Kenji Sato",
    role: "Engenheiro-Chefe de Unidade de Potência",
    specialty: "Confiabilidade Mecânica & Gestão Térmica",
    pitBonus: 0.06,
    rdDiscount: 0.08,
    sponsorMultiplier: 1.04,
    tireCareBonus: 0.12,
    quote: "Para chegar em primeiro, primeiro é preciso cruzar a linha de chegada com o motor inteiro.",
  },
  {
    id: 3,
    name: "Claire Moreau",
    role: "Diretora Executiva Comercial",
    specialty: "Contratos de Patrocínio & Bônus Financeiros",
    pitBonus: 0.04,
    rdDiscount: 0.05,
    sponsorMultiplier: 1.22,
    tireCareBonus: 0.03,
    quote: "Orçamento forte financia peças de ponta: cada meta de patrocinador cumprida acelera nossa evolução.",
  },
  {
    id: 4,
    name: "Viktor Krol",
    role: "Diretor de Operações de Pista",
    specialty: "Ritmo de Corrida & Conservação de Composto",
    pitBonus: 0.10,
    rdDiscount: 0.06,
    sponsorMultiplier: 1.06,
    tireCareBonus: 0.15,
    quote: "Controle a temperatura da carcaça nas primeiras voltas e o stint inteiro trabalhará a nosso favor.",
  },
  {
    id: 5,
    name: "Rodrigo Monteiro",
    role: "Chefe Esportivo de Competição",
    specialty: "Largadas, Ultrapassagens e Pressão em Rivais",
    pitBonus: 0.09,
    rdDiscount: 0.09,
    sponsorMultiplier: 1.10,
    tireCareBonus: 0.08,
    quote: "Quando a janela abrir no setor intermediário, nosso piloto precisa estar pronto para atacar.",
  },
];

export const teamPrincipalById = (id) =>
  teamPrincipals.find((p) => p.id === Number(id)) || teamPrincipals[0];

export const strategicEventsCatalog = [
  {
    id: "wind_tunnel_breakthrough",
    title: "Avanço no Túnel de Vento",
    description: "A equipe de aerodinâmica validou um novo defletor lateral antes da etapa, aumentando a estabilidade em curvas de alta.",
    effectLabel: "+2% Aderência e +150 CR de bônus técnico",
    creditsDelta: 150,
    gripBonus: 0.02,
  },
  {
    id: "sponsor_media_day",
    title: "Ativação Global de Patrocinador",
    description: "Evento de imprensa no paddock gerou forte exposição da marca principal antes da largada.",
    effectLabel: "+320 CR imediatos no caixa da equipe",
    creditsDelta: 320,
    gripBonus: 0,
  },
  {
    id: "track_temp_spike",
    title: "Frente Quente no Asfalto",
    description: "A temperatura de pista subiu rapidamente; compostos macios exigirão maior gestão no primeiro stint.",
    effectLabel: "Atenção extra à temperatura dos pneus na corrida",
    creditsDelta: 100,
    gripBonus: 0,
  },
  {
    id: "pit_rig_calibration",
    title: "Treino Intensivo de Pit Crew",
    description: "As pistolas pneumáticas foram recalibradas com sucesso nos treinos livres.",
    effectLabel: "Paradas de box até 0.25s mais rápidas na etapa",
    creditsDelta: 120,
    gripBonus: 0.01,
  },
  {
    id: "fuel_blend_homologation",
    title: "Homologação de Combustível Sintético",
    description: "Novo lote do fornecedor energético melhorou a queima em regime de potência alta.",
    effectLabel: "+180 CR de subsídio de desenvolvimento",
    creditsDelta: 180,
    gripBonus: 0.01,
  },
];
