import { getAbilityAdjustments, getAttacks, getCharacter } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui";
import { EditableNumber } from "@/components/EditableNumber";
import {
  HPTracker,
  DeathSaves,
  ConditionsEditor,
  InspirationToggle,
  Resource,
  RestButtons,
} from "@/components/combat/CombatWidgets";
import { RuneKnightPanel } from "@/components/combat/RuneKnightPanel";
import {
  addAttack,
  deleteAttack,
  updateArmorClass,
  updateInitiativeMisc,
  updateSpeed,
} from "@/lib/actions/character";
import { initiative, formatMod } from "@/lib/dnd/computed";

export default async function CombatPage() {
  const [character, attacks, adjustments] = await Promise.all([
    getCharacter(),
    getAttacks(),
    getAbilityAdjustments(),
  ]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>Hit Points</CardTitle>
        <HPTracker character={character} />
      </Card>

      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="AC" value={character.armor_class} onSave={updateArmorClass} />
          <Stat
            label="Initiative misc."
            value={character.initiative_misc}
            onSave={updateInitiativeMisc}
            hint={`total ${formatMod(initiative(character, adjustments))}`}
          />
          <Stat label="Speed (ft)" value={character.speed} onSave={updateSpeed} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            Hit dice: {character.hit_dice_current}/{character.hit_dice_total} d10
          </span>
          <InspirationToggle character={character} />
        </div>
      </Card>

      <Card>
        <CardTitle>Death Saves</CardTitle>
        <DeathSaves character={character} />
      </Card>

      <Card>
        <CardTitle>Conditions</CardTitle>
        <ConditionsEditor character={character} />
      </Card>

      <Card>
        <CardTitle>Resources</CardTitle>
        <div className="flex flex-col gap-2.5">
          <Resource character={character} resource="second_wind" label="Second Wind" />
          <Resource character={character} resource="action_surge" label="Action Surge" />
          {character.indomitable_max > 0 && (
            <Resource character={character} resource="indomitable" label="Indomitable" />
          )}
        </div>
        <div className="mt-4">
          <RestButtons />
        </div>
      </Card>

      <Card>
        <CardTitle>Attacks</CardTitle>
        <div className="flex flex-col gap-2">
          {attacks.map((atk) => (
            <div
              key={atk.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{atk.name}</p>
                <p className="text-xs text-muted">
                  {formatMod(atk.to_hit_bonus)} to hit · {atk.damage_dice} {atk.damage_type}
                  {atk.properties ? ` · ${atk.properties}` : ""}
                </p>
              </div>
              <form action={deleteAttack.bind(null, atk.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-blood-strong hover:text-blood-strong"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={addAttack} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            name="name"
            required
            placeholder="Weapon"
            className="col-span-2 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none sm:col-span-1"
          />
          <input
            name="to_hit_bonus"
            type="number"
            defaultValue={0}
            placeholder="+Hit"
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="damage_dice"
            placeholder="1d8+3"
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="damage_type"
            placeholder="slashing"
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="properties"
            placeholder="Properties (optional)"
            className="col-span-2 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none sm:col-span-3"
          />
          <button
            type="submit"
            className="rounded-md border border-gold bg-gold/10 px-2 py-1.5 text-sm text-gold-strong hover:bg-gold/20"
          >
            Add
          </button>
        </form>
      </Card>

      {character.level >= 3 && (
        <Card>
          <CardTitle>Rune Knight</CardTitle>
          <RuneKnightPanel character={character} />
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  onSave,
  hint,
}: {
  label: string;
  value: number;
  onSave: (v: number) => Promise<void>;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 py-2">
      <EditableNumber value={value} onSave={onSave} width="w-14" />
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
      {hint && <span className="text-[10px] text-muted">{hint}</span>}
    </div>
  );
}
