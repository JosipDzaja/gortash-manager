import Link from "next/link";
import { getAbilityAdjustments, getCharacter } from "@/lib/data";
import { Card, CardTitle, SavedTextArea } from "@/components/ui";
import { AbilityScores, SavingThrows, SkillsList } from "@/components/overview/StatBlock";
import { passivePerception, proficiencyBonus, formatMod } from "@/lib/dnd/computed";
import { updateNotes } from "@/lib/actions/character";

export default async function OverviewPage() {
  const [character, adjustments] = await Promise.all([getCharacter(), getAbilityAdjustments()]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gold-strong">{character.name}</h1>
            <p className="text-sm text-muted">
              {character.race} {character.class_name}
              {character.level >= 3 ? ` (${character.subclass_name})` : ""} · Level{" "}
              {character.level}
            </p>
            <p className="text-sm text-muted">
              {character.background} · {character.alignment}
            </p>
          </div>
          <Link
            href="/level-up"
            className="shrink-0 rounded-lg border border-gold bg-gold/10 px-3 py-2 text-xs font-medium text-gold-strong hover:bg-gold/20"
          >
            Level Up
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:grid-cols-5">
          <QuickStat label="Prof. Bonus" value={formatMod(proficiencyBonus(character))} />
          <QuickStat label="AC" value={String(character.armor_class)} />
          <QuickStat label="Speed" value={`${character.speed} ft`} />
          <QuickStat label="HP" value={`${character.current_hp}/${character.max_hp}`} />
          <QuickStat label="Passive Perc." value={String(passivePerception(character, adjustments))} />
        </div>
      </Card>

      <Card>
        <CardTitle>Ability Scores</CardTitle>
        <AbilityScores character={character} adjustments={adjustments} />
      </Card>

      <Card>
        <CardTitle>Saving Throws</CardTitle>
        <SavingThrows character={character} adjustments={adjustments} />
      </Card>

      <Card>
        <CardTitle>Skills</CardTitle>
        <SkillsList character={character} adjustments={adjustments} />
      </Card>

      <Card>
        <CardTitle>Notes</CardTitle>
        <SavedTextArea
          value={character.notes}
          onSave={updateNotes}
          placeholder="Anything worth remembering that doesn't fit elsewhere…"
          rows={4}
        />
      </Card>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 py-2">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
