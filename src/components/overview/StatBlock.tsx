"use client";

import { useTransition } from "react";
import { EditableNumber } from "@/components/EditableNumber";
import { ABILITY_KEYS, ABILITY_LABELS, type AbilityKey } from "@/lib/dnd/types";
import { SKILLS, abilityMod, savingThrowMod, skillMod, formatMod, proficiencyBonus } from "@/lib/dnd/computed";
import { updateCharacter } from "@/lib/actions/character";
import type { CharacterRow } from "@/lib/data";

export function AbilityScores({ character }: { character: CharacterRow }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ABILITY_KEYS.map((key) => (
        <div
          key={key}
          className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 py-3"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted">{key}</span>
          <EditableNumber
            value={character[key]}
            min={1}
            max={30}
            width="w-12"
            onSave={(v) => updateCharacter({ [key]: v })}
          />
          <span className="text-xs text-gold-strong">{formatMod(abilityMod(character, key))}</span>
        </div>
      ))}
    </div>
  );
}

export function SavingThrows({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();

  function toggle(key: AbilityKey) {
    const has = character.saving_throw_proficiencies.includes(key);
    const next = has
      ? character.saving_throw_proficiencies.filter((k) => k !== key)
      : [...character.saving_throw_proficiencies, key];
    startTransition(() => updateCharacter({ saving_throw_proficiencies: next }));
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
      {ABILITY_KEYS.map((key) => {
        const proficient = character.saving_throw_proficiencies.includes(key);
        return (
          <button
            key={key}
            type="button"
            disabled={pending}
            onClick={() => toggle(key)}
            className="flex items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-surface-2"
          >
            <span
              className={`size-3 shrink-0 rounded-full border ${
                proficient ? "border-gold bg-gold" : "border-border"
              }`}
            />
            <span className="flex-1 capitalize text-foreground">{ABILITY_LABELS[key]}</span>
            <span className="text-muted">{formatMod(savingThrowMod(character, key))}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SkillsList({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();

  function toggle(skillKey: string) {
    const has = character.skill_proficiencies.includes(skillKey);
    const next = has
      ? character.skill_proficiencies.filter((k) => k !== skillKey)
      : [...character.skill_proficiencies, skillKey];
    startTransition(() => updateCharacter({ skill_proficiencies: next }));
  }

  return (
    <div className="flex flex-col gap-1">
      {SKILLS.map((skill) => {
        const proficient = character.skill_proficiencies.includes(skill.key);
        return (
          <button
            key={skill.key}
            type="button"
            disabled={pending}
            onClick={() => toggle(skill.key)}
            className="flex items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-surface-2"
          >
            <span
              className={`size-3 shrink-0 rounded-full border ${
                proficient ? "border-gold bg-gold" : "border-border"
              }`}
            />
            <span className="flex-1 text-foreground">{skill.label}</span>
            <span className="w-8 text-right text-[10px] uppercase text-muted">{skill.ability}</span>
            <span className="w-8 text-right text-muted">{formatMod(skillMod(character, skill.key))}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProficiencyBonusBadge({ character }: { character: CharacterRow }) {
  return <span>{formatMod(proficiencyBonus(character))}</span>;
}
