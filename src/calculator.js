// TriQualify — calculation logic
import { KONA_STANDARDS, COEFFICIENTS, PROFILE_BONUS } from "./data/races.js";

export function formatTime(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Remove the effect of reference race conditions → "neutral performance baseline"
export function toNeutralTime(sec, conditions) {
  const { bikeProfile, runProfile, swimCond, heat, wind } = conditions;
  const C = COEFFICIENTS;
  let t = sec;
  t /= C.bike[bikeProfile];
  t /= C.run[runProfile];
  if (swimCond === "nowetsuit") t /= C.noWetsuit;
  t /= C.heat[heat];
  t /= C.wind[wind];
  return t;
}

// Project neutral time onto a specific race, adjusted for athlete profile
export function projectToRace(neutralSec, race, athleteProfile) {
  const C = COEFFICIENTS;
  const p = PROFILE_BONUS[athleteProfile] || PROFILE_BONUS.balanced;
  let t = neutralSec;
  t *= 1 + (C.bike[race.bike] - 1) * p.b;
  t *= 1 + (C.run[race.run] - 1) * p.r;
  t *= 1 + (C.heat[race.heat] - 1) * p.r;
  if (!race.wetsuit) t *= C.noWetsuit;
  t *= C.wind[race.wind];
  return t;
}

// Calculate age-graded time using Kona Standard coefficient
export function calcAgeGraded(timeSec, gender, ageGroup) {
  const factor = KONA_STANDARDS[gender]?.[ageGroup];
  if (!factor) throw new Error(`Unknown category: ${gender} ${ageGroup}`);
  return timeSec * factor;
}

// Main function — returns top 5 races sorted by qualification chance
export function calculateRaces(races, inputSec, conditions, gender, ageGroup, athleteProfile, continentFilter) {
  const factor = KONA_STANDARDS[gender][ageGroup];
  const neutral = toNeutralTime(inputSec, conditions);

  let filtered = races.filter(
    (r) => continentFilter === "all" || r.continent === continentFilter
  );

  const results = filtered.map((race) => {
    const projectedSec = projectToRace(neutral, race, athleteProfile);
    const projectedAG = projectedSec * factor;
    const cutoffSec = race.cutoffMin * 60;
    const diffMin = (projectedAG - cutoffSec) / 60;
    const agStarters = Math.round(race.starters / 12);
    const slotRatio = (race.slots / race.starters) * 100;
    const agSlots = Math.max(1, Math.round(race.slots * (agStarters / race.starters)));
    const fieldQualCount = Math.round(agStarters * (race.fieldPct / 100));
    return { ...race, projectedSec, projectedAG, cutoffSec, diffMin, factor, neutralSec: neutral, agStarters, slotRatio, agSlots, fieldQualCount };
  });

  return results.sort((a, b) => a.diffMin - b.diffMin).slice(0, 5);
}

// Human-readable breakdown of time adjustments for a race
export function getAdjustmentDetails(race, athleteProfile) {
  const p = PROFILE_BONUS[athleteProfile] || PROFILE_BONUS.balanced;
  const parts = [];
  if (race.bike === "hilly")  parts.push(`bike +${(5 * p.b).toFixed(1)}%`);
  if (race.bike === "vhilly") parts.push(`bike +${(8.5 * p.b).toFixed(1)}%`);
  if (race.run === "hilly")   parts.push(`run +${(2.5 * p.r).toFixed(1)}%`);
  if (race.run === "vhilly")  parts.push(`run +${(4.5 * p.r).toFixed(1)}%`);
  if (!race.wetsuit)          parts.push("no wetsuit +0.8%");
  if (race.heat === "hot")    parts.push(`heat +${(1.5 * p.r).toFixed(1)}%`);
  if (race.heat === "extreme") parts.push(`extreme heat +${(2.5 * p.r).toFixed(1)}%`);
  if (race.wind === "moderate") parts.push("wind +0.8%");
  if (race.wind === "strong")   parts.push("strong wind +1.5%");
  return parts.length ? parts.join(" · ") : "neutral conditions";
}
