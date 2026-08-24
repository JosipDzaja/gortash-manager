"use client";

import { useState, useTransition } from "react";
import { EditableNumber } from "@/components/EditableNumber";
import { Pips } from "@/components/Pips";
import { updateCharacter, takeRest } from "@/lib/actions/character";
import type { CharacterRow } from "@/lib/data";

export function HPTracker({ character }: { character: CharacterRow }) {
  const [delta, setDelta] = useState("");
  const [pending, startTransition] = useTransition();

  function applyDelta(sign: 1 | -1) {
    const amount = Math.abs(Number(delta) || 0);
    if (!amount) return;
    startTransition(async () => {
      if (sign === -1) {
        // Damage: absorb into temp HP first, then current HP (min 0).
        let temp = character.temp_hp;
        let current = character.current_hp;
        let remaining = amount;
        if (temp > 0) {
          const absorbed = Math.min(temp, remaining);
          temp -= absorbed;
          remaining -= absorbed;
        }
        current = Math.max(0, current - remaining);
        await updateCharacter({ temp_hp: temp, current_hp: current });
      } else {
        const current = Math.min(character.max_hp, character.current_hp + amount);
        await updateCharacter({ current_hp: current });
      }
    });
    setDelta("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-surface-2 py-2">
          <EditableNumber
            value={character.current_hp}
            min={0}
            width="w-16"
            onSave={(v) => updateCharacter({ current_hp: v })}
          />
          <div className="mt-1 text-[10px] uppercase text-muted">Current</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 py-2">
          <EditableNumber
            value={character.max_hp}
            min={1}
            width="w-16"
            onSave={(v) => updateCharacter({ max_hp: v })}
          />
          <div className="mt-1 text-[10px] uppercase text-muted">Max</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 py-2">
          <EditableNumber
            value={character.temp_hp}
            min={0}
            width="w-16"
            onSave={(v) => updateCharacter({ temp_hp: v })}
          />
          <div className="mt-1 text-[10px] uppercase text-muted">Temp</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="Amount"
          className="w-24 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-center text-sm focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => applyDelta(-1)}
          className="flex-1 rounded-md border border-blood-strong px-3 py-1.5 text-sm text-blood-strong hover:bg-blood/10 disabled:opacity-50"
        >
          − Damage
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => applyDelta(1)}
          className="flex-1 rounded-md border border-success px-3 py-1.5 text-sm text-success hover:bg-success/10 disabled:opacity-50"
        >
          + Heal
        </button>
      </div>
    </div>
  );
}

export function DeathSaves({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();

  function toggle(kind: "success" | "failure", index: number) {
    const field = kind === "success" ? "death_save_successes" : "death_save_failures";
    const current = character[field];
    const next = index < current ? index : index + 1;
    startTransition(() => updateCharacter({ [field]: next }));
  }

  const row = (kind: "success" | "failure", count: number, color: string) => (
    <div className="flex items-center gap-2">
      <span className="w-14 text-xs text-muted">{kind === "success" ? "Success" : "Failure"}</span>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            disabled={pending}
            onClick={() => toggle(kind, i)}
            className={`size-4 rounded-full border ${
              i < count ? color : "border-border"
            }`}
            aria-label={`${kind} ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {row("success", character.death_save_successes, "border-success bg-success")}
      {row("failure", character.death_save_failures, "border-blood-strong bg-blood-strong")}
    </div>
  );
}

const COMMON_CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Paralyzed",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Exhaustion",
];

export function ConditionsEditor({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();
  const [custom, setCustom] = useState("");

  function add(condition: string) {
    const trimmed = condition.trim();
    if (!trimmed || character.conditions.includes(trimmed)) return;
    startTransition(() => updateCharacter({ conditions: [...character.conditions, trimmed] }));
  }

  function remove(condition: string) {
    startTransition(() =>
      updateCharacter({ conditions: character.conditions.filter((c) => c !== condition) })
    );
  }

  const available = COMMON_CONDITIONS.filter((c) => !character.conditions.includes(c));

  return (
    <div className="flex flex-col gap-3">
      {character.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {character.conditions.map((c) => (
            <button
              key={c}
              type="button"
              disabled={pending}
              onClick={() => remove(c)}
              className="rounded-full border border-blood-strong bg-blood/10 px-2.5 py-1 text-xs text-blood-strong"
              title="Click to remove"
            >
              {c} ×
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {available.map((c) => (
          <button
            key={c}
            type="button"
            disabled={pending}
            onClick={() => add(c)}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-gold hover:text-foreground"
          >
            + {c}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(custom);
          setCustom("");
        }}
        className="flex gap-2"
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom condition…"
          className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-gold hover:text-foreground"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export function InspirationToggle({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => updateCharacter({ inspiration: !character.inspiration }))}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        character.inspiration
          ? "border-gold bg-gold/10 text-gold-strong"
          : "border-border text-muted hover:border-gold"
      }`}
    >
      <span>✨</span> Inspiration
    </button>
  );
}

type ResourceKey = "second_wind" | "action_surge" | "indomitable" | "warchiefs_might" | "packs_intercession";

export function Resource({ character, resource, label }: { character: CharacterRow; resource: ResourceKey; label: string }) {
  const maxKey = `${resource}_max` as keyof CharacterRow;
  const usedKey = `${resource}_used` as keyof CharacterRow;
  const max = character[maxKey] as number;
  const used = character[usedKey] as number;

  return (
    <Pips
      max={max}
      used={used}
      label={label}
      onChange={(u) => updateCharacter({ [usedKey]: u } as Partial<CharacterRow>)}
    />
  );
}

export function RestButtons() {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => takeRest("short"))}
        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-gold disabled:opacity-50"
      >
        Short Rest
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => takeRest("long"))}
        className="flex-1 rounded-lg border border-gold bg-gold/10 px-3 py-2 text-sm text-gold-strong hover:bg-gold/20 disabled:opacity-50"
      >
        Long Rest
      </button>
    </div>
  );
}
