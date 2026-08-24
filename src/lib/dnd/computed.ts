import type { AbilityAdjustment, CharacterRow } from "@/lib/data";
import { ABILITY_KEYS, SKILLS, abilityModifier, proficiencyBonusForLevel, type AbilityKey } from "./types";

export function proficiencyBonus(character: CharacterRow): number {
  return proficiencyBonusForLevel(character.level);
}

/** The base score for this ability, directly editable. */
export function abilityScore(character: CharacterRow, key: AbilityKey): number {
  return character[key];
}

export function adjustmentsFor(adjustments: AbilityAdjustment[], key: AbilityKey): AbilityAdjustment[] {
  return adjustments.filter((a) => a.ability === key);
}

/**
 * The score actually used for checks/saves/attacks: the base score plus every buff/debuff for
 * this ability. "set" adjustments act as a floor — matching wording like "your score becomes
 * 19, unaffected if already 19+" — so the highest active "set" wins over a lower total.
 */
export function totalAbilityScore(
  character: CharacterRow,
  key: AbilityKey,
  adjustments: AbilityAdjustment[]
): number {
  const forKey = adjustmentsFor(adjustments, key);
  const withAdds = forKey.reduce((sum, a) => {
    if (a.kind === "buff") return sum + a.amount;
    if (a.kind === "debuff") return sum - a.amount;
    return sum;
  }, character[key]);
  const floors = forKey.filter((a) => a.kind === "set").map((a) => a.amount);
  return floors.length ? Math.max(withAdds, ...floors) : withAdds;
}

export function abilityMod(character: CharacterRow, key: AbilityKey, adjustments: AbilityAdjustment[]): number {
  return abilityModifier(totalAbilityScore(character, key, adjustments));
}

export function savingThrowMod(
  character: CharacterRow,
  key: AbilityKey,
  adjustments: AbilityAdjustment[]
): number {
  const base = abilityMod(character, key, adjustments);
  const proficient = character.saving_throw_proficiencies.includes(key);
  return proficient ? base + proficiencyBonus(character) : base;
}

export function skillMod(character: CharacterRow, skillKey: string, adjustments: AbilityAdjustment[]): number {
  const skill = SKILLS.find((s) => s.key === skillKey);
  if (!skill) return 0;
  const base = abilityMod(character, skill.ability, adjustments);
  const proficient = character.skill_proficiencies.includes(skillKey);
  return proficient ? base + proficiencyBonus(character) : base;
}

export function passivePerception(character: CharacterRow, adjustments: AbilityAdjustment[]): number {
  return 10 + skillMod(character, "perception", adjustments);
}

export function initiative(character: CharacterRow, adjustments: AbilityAdjustment[]): number {
  return abilityMod(character, "dex", adjustments) + character.initiative_misc;
}

export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export { ABILITY_KEYS, SKILLS };
