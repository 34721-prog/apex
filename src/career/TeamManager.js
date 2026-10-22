import {
  pilotPersonality,
  pilotStats,
  activeAcademyDriver,
} from "../data/drivers.js";

// Single-driver team model: each team on the 6-car grid fields 1 active driver.
export function assignTeam(race, save) {
  if (!race?.cars?.length) return;
  const lead = race.cars[0];
  const dev = (save?.team?.development || 0) * 0.015;
  const promoted = activeAcademyDriver(save);
  if (lead) {
    lead.driverId = save?.selectedDriver ?? lead.driverId ?? 0;
    if (promoted) {
      lead.name = promoted.name;
      lead.number = promoted.number;
      lead.academyDriver = promoted;
    }
    lead.personality = pilotPersonality(lead.driverId, promoted);
    lead.stats = pilotStats(
      lead.stats,
      lead.driverId,
      race.mode,
      race.realism,
      promoted,
    );
    lead.stats.handling *= 1 + dev * 0.5;
    lead.stats.braking *= 1 + dev * 0.4;
    lead.teammate = false;
  }
  for (let i = 1; i < race.cars.length; i++) {
    const c = race.cars[i];
    c.teammate = false;
    if (c.teamId === lead.teamId) c.teamId = i % 6;
  }
}

export function teamStandings(champ) {
  const teams = [
    { id: 0, name: "Apex Motorsport", ids: [0], points: 0 },
    { id: 1, name: "Ember Racing", ids: [1], points: 0 },
    { id: 2, name: "Azure Grand Prix", ids: [2], points: 0 },
    { id: 3, name: "Solstice Competition", ids: [3], points: 0 },
    { id: 4, name: "Verdant Works", ids: [4], points: 0 },
    { id: 5, name: "Orion Engineering", ids: [5], points: 0 },
  ];
  for (const result of champ?.results || [])
    for (const [i, r] of result.entries()) {
      const t = teams.find((t) => t.ids.includes(r.id));
      if (t) t.points += r.points ?? [25, 18, 15, 12, 10, 8][i] ?? 0;
    }
  return teams.sort((a, b) => b.points - a.points || a.id - b.id);
}
