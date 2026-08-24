"use client";

import { useState, useTransition } from "react";
import { EditableNumber } from "@/components/EditableNumber";
import { ABILITY_KEYS, ABILITY_LABELS, KIND_LABELS, type AbilityKey, type AdjustmentKind } from "@/lib/dnd/types";
import {
  SKILLS,
  abilityMod,
  adjustmentsFor,
  savingThrowMod,
  skillMod,
  totalAbilityScore,
  formatMod,
  proficiencyBonus,
} from "@/lib/dnd/computed";
import { updateCharacter } from "@/lib/actions/character";
import { addAbilityAdjustment, removeAbilityAdjustment } from "@/lib/actions/abilityAdjustments";
import type { AbilityAdjustment, CharacterRow } from "@/lib/data";

export function AbilityScores({
  character,
  adjustments,
}: {
  character: CharacterRow;
  adjustments: AbilityAdjustment[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ABILITY_KEYS.map((key) => (
        <AbilityCard key={key} character={character} abilityKey={key} adjustments={adjustments} />
      ))}
    </div>
  );
}

function AbilityCard({
  character,
  abilityKey: key,
  adjustments,
}: {
  character: CharacterRow;
  abilityKey: AbilityKey;
  adjustments: AbilityAdjustment[];
}) {
  const [open, setOpen] = useState(false);
  const total = totalAbilityScore(character, key, adjustments);
  const mod = abilityMod(character, key, adjustments);

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 py-3 ${
        open ? "col-span-3 sm:col-span-6" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-[10px] uppercase tracking-wider text-muted hover:text-gold"
      >
        {key} {open ? "▴" : "▾"}
      </button>
      <div className="w-12 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-foreground">
        {total}
      </div>
      <span className="text-xs text-gold-strong">{formatMod(mod)}</span>
      {open && <AbilityBreakdown character={character} abilityKey={key} adjustments={adjustments} />}
    </div>
  );
}

function AbilityBreakdown({
  character,
  abilityKey: key,
  adjustments,
}: {
  character: CharacterRow;
  abilityKey: AbilityKey;
  adjustments: AbilityAdjustment[];
}) {
  const base = character[key];
  const rows = adjustmentsFor(adjustments, key);

  return (
    <div className="mt-2 w-full max-w-sm rounded-md border border-border bg-surface p-2.5 text-left text-xs">
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <span className="text-muted">Base</span>
        <EditableNumber
          value={base}
          min={1}
          max={30}
          width="w-14"
          onSave={(v) => updateCharacter({ [key]: v })}
        />
      </div>
      <div className="mb-1.5 border-t border-border" />
      {rows.length === 0 && <p className="py-0.5 text-muted">No adjustments yet.</p>}
      {rows.map((a) => (
        <AdjustmentRow key={a.id} adjustment={a} />
      ))}
      <AddAdjustmentForm abilityKey={key} />
    </div>
  );
}

function AdjustmentRow({ adjustment }: { adjustment: AbilityAdjustment }) {
  const [pending, startTransition] = useTransition();
  const display =
    adjustment.kind === "buff"
      ? formatMod(adjustment.amount)
      : adjustment.kind === "debuff"
        ? formatMod(-adjustment.amount)
        : `→ ${adjustment.amount}`;
  return (
    <div className="flex items-center justify-between gap-2 py-0.5 text-muted">
      <span className="truncate">
        {display} {adjustment.label}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => removeAbilityAdjustment(adjustment.id))}
        className="shrink-0 text-muted hover:text-blood-strong"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

function AddAdjustmentForm({ abilityKey }: { abilityKey: AbilityKey }) {
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<AdjustmentKind>("buff");
  const [amount, setAmount] = useState(1);

  function submit() {
    if (!label.trim() || amount <= 0) return;
    startTransition(async () => {
      await addAbilityAdjustment({ ability: abilityKey, label: label.trim(), kind, amount });
      setLabel("");
      setAmount(1);
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
      <div className="flex gap-1.5">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Description (e.g. Ray of Enfeeblement)"
          className="flex-1 rounded-md border border-border bg-surface-2 px-1.5 py-1 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
        />
      </div>
      <div className="flex gap-1.5">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as AdjustmentKind)}
          className="flex-1 rounded-md border border-border bg-surface-2 px-1.5 py-1 text-foreground focus:border-gold focus:outline-none"
        >
          {(Object.keys(KIND_LABELS) as AdjustmentKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="w-14 rounded-md border border-border bg-surface-2 px-1.5 py-1 text-center text-foreground focus:border-gold focus:outline-none"
        />
      </div>
      <button
        type="button"
        disabled={pending || !label.trim() || amount <= 0}
        onClick={submit}
        className="rounded-md border border-gold bg-gold/10 px-2 py-1 text-gold-strong hover:bg-gold/20 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add adjustment"}
      </button>
    </div>
  );
}

export function SavingThrows({
  character,
  adjustments,
}: {
  character: CharacterRow;
  adjustments: AbilityAdjustment[];
}) {
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
            <span className="text-muted">{formatMod(savingThrowMod(character, key, adjustments))}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SkillsList({
  character,
  adjustments,
}: {
  character: CharacterRow;
  adjustments: AbilityAdjustment[];
}) {
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
            <span className="w-8 text-right text-muted">
              {formatMod(skillMod(character, skill.key, adjustments))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ProficiencyBonusBadge({ character }: { character: CharacterRow }) {
  return <span>{formatMod(proficiencyBonus(character))}</span>;
}
