export type Rune = {
  id: string;
  name: string;
  prerequisiteLevel: number;
  passive: string;
  invoke: string;
};

export const RUNES: Rune[] = [
  {
    id: "challenge",
    name: "Rune of Challenge",
    prerequisiteLevel: 3,
    passive: "Advantage on Charisma (Intimidation) checks while carrying the inscribed object.",
    invoke:
      "Bonus action: each hostile creature of your choice within 30 ft that can see or hear you makes a Wisdom save. On a fail, until the start of your next turn it has disadvantage on attacks against anyone but you and can't willingly move away from you.",
  },
  {
    id: "hunt",
    name: "Rune of the Hunt",
    prerequisiteLevel: 3,
    passive: "+5 ft walking speed and advantage on Wisdom (Survival) checks to track creatures.",
    invoke:
      "Bonus action, 1 minute: an additional +10 ft walking speed, and opportunity attacks against you are made with disadvantage.",
  },
  {
    id: "blood",
    name: "Rune of Blood",
    prerequisiteLevel: 3,
    passive:
      "Add your Constitution modifier to Strength (Athletics) checks, a number of times per long rest equal to your proficiency bonus.",
    invoke:
      "On a melee weapon hit: deal an extra 2d6 damage and gain temporary hit points equal to the extra damage dealt.",
  },
  {
    id: "pack",
    name: "Rune of the Pack",
    prerequisiteLevel: 3,
    passive:
      "Advantage on Wisdom (Perception) checks while within 10 ft of at least one conscious ally.",
    invoke:
      "Bonus action: choose up to your proficiency bonus in creatures you can see within 30 ft. For 1 minute, a chosen creature gets +1 AC while within 5 ft of another chosen creature.",
  },
  {
    id: "unbroken",
    name: "Rune of the Unbroken",
    prerequisiteLevel: 7,
    passive: "Advantage on saving throws against being frightened.",
    invoke:
      "Reaction, on failing a Strength, Constitution, or Wisdom save: reroll the save and use the new roll.",
  },
  {
    id: "conquest",
    name: "Rune of Conquest",
    prerequisiteLevel: 7,
    passive:
      "Advantage on Charisma checks made to command, threaten, or assert authority over another creature.",
    invoke:
      "Bonus action, 1 minute: whenever you or a creature you can see within 60 ft makes an attack roll, save, or ability check, you may use your reaction to give that roll advantage or disadvantage. Ends early if you're incapacitated.",
  },
];

export function runesAvailableAtLevel(level: number): Rune[] {
  return RUNES.filter((r) => r.prerequisiteLevel <= level);
}

/** Number of runes known (chosen out of RUNES) at a given Rune Knight level. */
export function knownRuneCountForLevel(level: number): number {
  if (level < 3) return 0;
  let count = 2;
  if (level >= 7) count += 1;
  if (level >= 10) count += 1;
  if (level >= 15) count += 1;
  return count;
}

/** How many times each known rune can be invoked before a rest. */
export function runeChargesForLevel(level: number): number {
  return level >= 15 ? 2 : 1;
}

export type WarchiefsMightBenefits = {
  speedBonus: number;
  extraDamageDie: string;
  large: boolean;
  reachBonus: number;
};

export function warchiefsMightBenefitsForLevel(level: number): WarchiefsMightBenefits {
  return {
    speedBonus: 5 + (level >= 10 ? 5 : 0) + (level >= 18 ? 10 : 0),
    extraDamageDie: level >= 18 ? "1d10" : level >= 10 ? "1d8" : "1d6",
    large: level >= 18,
    reachBonus: level >= 18 ? 5 : 0,
  };
}

export const RUNE_KNIGHT_FEATURES: { level: number; name: string; description: string }[] = [
  {
    level: 3,
    name: "Bonus Proficiencies",
    description: "Proficiency with smith's tools; learn to speak, read, and write Orc.",
  },
  {
    level: 3,
    name: "Rune Carver",
    description:
      "Learn 2 runes. After a long rest, inscribe a rune-per-known-rune onto weapons/armor/shields/jewelry/held or worn items. Each rune can be invoked once per rest for its magical effect.",
  },
  {
    level: 3,
    name: "Warchief's Might",
    description:
      "Bonus action, 1 minute: +5 ft speed, advantage on Strength checks and saves, and once per turn a hit deals extra damage. Uses equal to proficiency bonus per long rest.",
  },
  {
    level: 7,
    name: "Pack's Intercession",
    description:
      "Reaction when an ally within 60 ft is hit: force the attacker to reroll the d20 and use the new roll. Uses equal to proficiency bonus per long rest. Learn 1 additional rune.",
  },
  {
    level: 10,
    name: "Predator's Step",
    description:
      "While Warchief's Might is active, +5 ft further speed and difficult terrain costs no extra movement. Warchief's Might extra damage die becomes 1d8. Learn 1 additional rune.",
  },
  {
    level: 15,
    name: "Runebound Heir",
    description: "Invoke each known rune twice instead of once; all rune charges reset on a short or long rest. Learn 1 additional rune.",
  },
  {
    level: 18,
    name: "Avatar of Conquest",
    description:
      "While Warchief's Might is active: become Large (if room allows), +10 ft further speed, +5 ft reach, extra damage die becomes 1d10.",
  },
];
