export const FIGHTER_HIT_DIE = 10;

export const ASI_LEVELS = [4, 6, 8, 12, 14, 16, 19];

export type FighterFeature = { level: number; name: string; description: string };

export const FIGHTER_BASE_FEATURES: FighterFeature[] = [
  { level: 1, name: "Fighting Style", description: "Choose a fighting style feat." },
  {
    level: 1,
    name: "Second Wind",
    description: "Bonus action: regain 1d10 + fighter level HP. 1 use per short/long rest.",
  },
  {
    level: 2,
    name: "Action Surge",
    description: "Take one additional action on your turn. 1 use per short/long rest (2 uses at 17th level).",
  },
  { level: 3, name: "Martial Archetype", description: "Orcish Rune Knight (see Rune Knight tab)." },
  { level: 5, name: "Extra Attack", description: "Attack twice, instead of once, whenever you take the Attack action." },
  { level: 9, name: "Indomitable", description: "Reroll a failed saving throw. 1 use per long rest (2 at 13th, 3 at 20th)." },
  { level: 11, name: "Extra Attack (2)", description: "Attack three times whenever you take the Attack action." },
  { level: 17, name: "Action Surge (2 uses)", description: "Action Surge can be used twice before a rest, but only once on the same turn." },
  { level: 20, name: "Extra Attack (3) / Indomitable (3)", description: "Attack four times whenever you take the Attack action. Indomitable usable 3 times per long rest." },
];

export function extraAttacksForLevel(level: number): number {
  if (level >= 20) return 3;
  if (level >= 11) return 2;
  if (level >= 5) return 1;
  return 0;
}

export function actionSurgeMaxForLevel(level: number): number {
  return level >= 17 ? 2 : level >= 2 ? 1 : 0;
}

export function indomitableMaxForLevel(level: number): number {
  if (level >= 20) return 3;
  if (level >= 13) return 2;
  if (level >= 9) return 1;
  return 0;
}

/** Base Fighter + Rune Knight features that newly unlock exactly at this level. */
export function featuresUnlockedAtLevel(level: number): FighterFeature[] {
  return FIGHTER_BASE_FEATURES.filter((f) => f.level === level);
}
