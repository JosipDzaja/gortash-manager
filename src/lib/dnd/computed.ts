import type { CharacterRow } from "@/lib/data";
import { ABILITY_KEYS, SKILLS, abilityModifier, proficiencyBonusForLevel, type AbilityKey } from "./types";

export function proficiencyBonus(character: CharacterRow): number {
  return proficiencyBonusForLevel(character.level);
}

export function abilityScore(character: CharacterRow, key: AbilityKey): number {
  return character[key];
}

export function abilityMod(character: CharacterRow, key: AbilityKey): number {
  return abilityModifier(character[key]);
}

export function savingThrowMod(character: CharacterRow, key: AbilityKey): number {
  const base = abilityMod(character, key);
  const proficient = character.saving_throw_proficiencies.includes(key);
  return proficient ? base + proficiencyBonus(character) : base;
}

export function skillMod(character: CharacterRow, skillKey: string): number {
  const skill = SKILLS.find((s) => s.key === skillKey);
  if (!skill) return 0;
  const base = abilityMod(character, skill.ability);
  const proficient = character.skill_proficiencies.includes(skillKey);
  return proficient ? base + proficiencyBonus(character) : base;
}

export function passivePerception(character: CharacterRow): number {
  return 10 + skillMod(character, "perception");
}

export function initiative(character: CharacterRow): number {
  return abilityMod(character, "dex") + character.initiative_misc;
}

export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export { ABILITY_KEYS, SKILLS };
