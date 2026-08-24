"use client";

import { useState, useTransition } from "react";
import { updateCharacter } from "@/lib/actions/character";
import { addRacialTrait, removeRacialTrait } from "@/lib/actions/racialTraits";
import type { CharacterRow, RacialTrait } from "@/lib/data";

export function TagList({
  items,
  onSave,
  placeholder,
}: {
  items: string[];
  onSave: (next: string[]) => Promise<void>;
  placeholder?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    startTransition(() => onSave([...items, value]));
    setDraft("");
  }

  function remove(value: string) {
    startTransition(() => onSave(items.filter((v) => v !== value)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <p className="text-xs text-muted">None yet.</p>}
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-foreground"
          >
            {item}
            <button
              type="button"
              disabled={pending}
              onClick={() => remove(item)}
              className="text-muted hover:text-blood-strong"
              title="Remove"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          disabled={pending || !draft.trim()}
          onClick={add}
          className="rounded-md border border-gold bg-gold/10 px-2 py-1 text-xs text-gold-strong hover:bg-gold/20 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function ProficienciesCard({ character }: { character: CharacterRow }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-wide text-muted">Weapon & Armor</h3>
        <TagList
          items={character.weapon_armor_proficiencies}
          placeholder="e.g. Martial Weapons"
          onSave={(next) => updateCharacter({ weapon_armor_proficiencies: next })}
        />
      </div>
      <div>
        <h3 className="mb-2 text-[10px] uppercase tracking-wide text-muted">Tools</h3>
        <TagList
          items={character.tool_proficiencies}
          placeholder="e.g. Thieves' Tools"
          onSave={(next) => updateCharacter({ tool_proficiencies: next })}
        />
      </div>
    </div>
  );
}

export function LanguagesList({ character }: { character: CharacterRow }) {
  return (
    <TagList
      items={character.languages}
      placeholder="e.g. Common"
      onSave={(next) => updateCharacter({ languages: next })}
    />
  );
}

export function RacialTraitsList({ traits }: { traits: RacialTrait[] }) {
  return (
    <div className="flex flex-col gap-2">
      {traits.length === 0 && <p className="text-xs text-muted">No racial traits yet.</p>}
      {traits.map((trait) => (
        <RacialTraitRow key={trait.id} trait={trait} />
      ))}
      <AddRacialTraitForm />
    </div>
  );
}

function RacialTraitRow({ trait }: { trait: RacialTrait }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2 text-sm">
      <div>
        <p className="font-medium text-foreground">{trait.name}</p>
        {trait.description && <p className="text-xs text-muted">{trait.description}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => removeRacialTrait(trait.id))}
        className="shrink-0 text-muted hover:text-blood-strong"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

function AddRacialTraitForm() {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!name.trim()) return;
    startTransition(async () => {
      await addRacialTrait({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
    });
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5 border-t border-border pt-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Trait name (e.g. Darkvision)"
        className="rounded-md border border-border bg-surface-2 px-1.5 py-1 text-xs text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="resize-y rounded-md border border-border bg-surface-2 px-1.5 py-1 text-xs text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
      />
      <button
        type="button"
        disabled={pending || !name.trim()}
        onClick={submit}
        className="self-start rounded-md border border-gold bg-gold/10 px-2 py-1 text-xs text-gold-strong hover:bg-gold/20 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add trait"}
      </button>
    </div>
  );
}
