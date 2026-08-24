"use client";

import { useTransition } from "react";
import { updateCharacter } from "@/lib/actions/character";
import { Pips } from "@/components/Pips";
import { Resource } from "./CombatWidgets";
import {
  runesAvailableAtLevel,
  knownRuneCountForLevel,
  runeChargesForLevel,
  warchiefsMightBenefitsForLevel,
} from "@/lib/dnd/runeKnight";
import type { CharacterRow } from "@/lib/data";

export function RuneKnightPanel({ character }: { character: CharacterRow }) {
  const [pending, startTransition] = useTransition();
  const available = runesAvailableAtLevel(character.level);
  const maxKnown = knownRuneCountForLevel(character.level);
  const charges = runeChargesForLevel(character.level);
  const benefits = warchiefsMightBenefitsForLevel(character.level);

  function toggleKnown(runeId: string) {
    const known = character.known_runes.includes(runeId);
    if (known) {
      startTransition(() =>
        updateCharacter({ known_runes: character.known_runes.filter((r) => r !== runeId) })
      );
    } else {
      if (character.known_runes.length >= maxKnown) return;
      startTransition(() =>
        updateCharacter({ known_runes: [...character.known_runes, runeId] })
      );
    }
  }

  function setCharge(runeId: string, used: number) {
    return updateCharacter({ rune_charges_used: { ...character.rune_charges_used, [runeId]: used } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-foreground">Warchief&apos;s Might</span>
        <Resource character={character} resource="warchiefs_might" label="" />
      </div>
      <p className="-mt-2 text-xs text-muted">
        Bonus action, 1 min: +{benefits.speedBonus} ft speed, advantage on Str checks &amp;
        saves, once/turn an extra {benefits.extraDamageDie} damage on a hit.
        {benefits.large && " You become Large."}
        {benefits.reachBonus > 0 && ` +${benefits.reachBonus} ft reach.`}
      </p>

      {character.packs_intercession_max > 0 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-foreground">Pack&apos;s Intercession</span>
          <Resource character={character} resource="packs_intercession" label="" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Known runes</span>
          <span>
            {character.known_runes.length}/{maxKnown}
          </span>
        </div>
        {available.map((rune) => {
          const known = character.known_runes.includes(rune.id);
          const used = character.rune_charges_used[rune.id] ?? 0;
          return (
            <div
              key={rune.id}
              className={`rounded-lg border p-3 ${
                known ? "border-gold/60 bg-gold/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={pending || (!known && character.known_runes.length >= maxKnown)}
                  onClick={() => toggleKnown(rune.id)}
                  className="flex items-center gap-2 text-left disabled:opacity-50"
                >
                  <span
                    className={`size-3 shrink-0 rounded-full border ${
                      known ? "border-gold bg-gold" : "border-border"
                    }`}
                  />
                  <span className="text-sm font-medium text-foreground">{rune.name}</span>
                </button>
                {known && <Pips max={charges} used={used} onChange={(u) => setCharge(rune.id, u)} />}
              </div>
              <p className="mt-1.5 text-xs text-muted">
                <span className="text-foreground/80">Passive:</span> {rune.passive}
              </p>
              <p className="mt-1 text-xs text-muted">
                <span className="text-foreground/80">Invoke:</span> {rune.invoke}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
