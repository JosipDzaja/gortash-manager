"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui";
import { applyLevelUp, type LevelUpChoice } from "@/lib/actions/levelUp";
import { ABILITY_KEYS, ABILITY_LABELS, SKILLS, type AbilityKey } from "@/lib/dnd/types";
import { abilityMod } from "@/lib/dnd/computed";
import { FEATS_2014 } from "@/lib/dnd/feats";
import { ASI_LEVELS, featuresUnlockedAtLevel } from "@/lib/dnd/fighter";
import { RUNE_KNIGHT_FEATURES, knownRuneCountForLevel } from "@/lib/dnd/runeKnight";
import type { AbilityAdjustment, CharacterRow } from "@/lib/data";

export function LevelUpWizard({
  character,
  adjustments,
}: {
  character: CharacterRow;
  adjustments: AbilityAdjustment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const newLevel = character.level + 1;

  const [hpRolled, setHpRolled] = useState(6);
  const [mode, setMode] = useState<"asi" | "feat">("asi");
  const [asiMode, setAsiMode] = useState<"single" | "double">("double");
  const [abilityA, setAbilityA] = useState<AbilityKey>("str");
  const [abilityB, setAbilityB] = useState<AbilityKey>("con");
  const [featId, setFeatId] = useState(FEATS_2014[0].id);
  const [featAbility, setFeatAbility] = useState<AbilityKey>("str");
  const [featSkills, setFeatSkills] = useState<string[]>([]);

  const conMod = abilityMod(character, "con", adjustments);
  const hpGain = Math.max(1, hpRolled + conMod);
  const isAsiLevel = ASI_LEVELS.includes(newLevel);

  const fighterFeatures = featuresUnlockedAtLevel(newLevel);
  const runeFeatures = RUNE_KNIGHT_FEATURES.filter((f) => f.level === newLevel);
  const currentKnownRunes = knownRuneCountForLevel(character.level);
  const nextKnownRunes = knownRuneCountForLevel(newLevel);
  const gainsRuneChoice = nextKnownRunes > currentKnownRunes;

  const feat = useMemo(() => FEATS_2014.find((f) => f.id === featId)!, [featId]);

  if (character.level >= 20) {
    return (
      <Card>
        <p className="text-sm text-muted">Gortash is already level 20 — nothing left to gain.</p>
      </Card>
    );
  }

  function submit() {
    let choice: LevelUpChoice | undefined;
    if (isAsiLevel) {
      if (mode === "asi") {
        choice =
          asiMode === "double"
            ? { type: "asi", increases: { [abilityA]: 1, [abilityB]: 1 } }
            : { type: "asi", increases: { [abilityA]: 2 } };
      } else {
        choice = {
          type: "feat",
          featId,
          abilityChoice: feat.autoEffects?.abilityIncrease ? featAbility : undefined,
          skillChoices: feat.autoEffects?.chooseSkillProficiencies ? featSkills : undefined,
        };
      }
    }

    startTransition(async () => {
      await applyLevelUp({ hpRolled, choice });
      router.push("/overview");
    });
  }

  const abilityOptions = (exclude?: AbilityKey) =>
    ABILITY_KEYS.filter((a) => a !== exclude);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="text-center">
        <p className="text-sm text-muted">Leveling up</p>
        <p className="text-2xl font-semibold text-gold-strong">
          {character.level} → {newLevel}
        </p>
      </Card>

      {(fighterFeatures.length > 0 || runeFeatures.length > 0 || gainsRuneChoice) && (
        <Card>
          <CardTitle>Unlocks at level {newLevel}</CardTitle>
          <div className="flex flex-col gap-2">
            {fighterFeatures.map((f) => (
              <FeatureRow key={f.name} name={f.name} description={f.description} />
            ))}
            {runeFeatures.map((f) => (
              <FeatureRow key={f.name} name={f.name} description={f.description} />
            ))}
            {gainsRuneChoice && (
              <FeatureRow
                name="New rune known"
                description={`You can now know ${nextKnownRunes} runes (up from ${currentKnownRunes}). Pick the new one on the Combat tab after leveling up.`}
              />
            )}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Hit Points</CardTitle>
        <p className="mb-2 text-xs text-muted">
          Roll 1d10 and enter the result — you always roll physically at the table.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={10}
            value={hpRolled}
            onChange={(e) => setHpRolled(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            className="w-20 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-center focus:border-gold focus:outline-none"
          />
          <span className="text-sm text-muted">
            + {conMod} Con mod = <span className="text-gold-strong">+{hpGain} HP</span>
          </span>
        </div>
      </Card>

      {isAsiLevel && (
        <Card>
          <CardTitle>Ability Score Improvement or Feat</CardTitle>
          <div className="mb-3 flex gap-2">
            <ModeButton active={mode === "asi"} onClick={() => setMode("asi")}>
              Ability Scores
            </ModeButton>
            <ModeButton active={mode === "feat"} onClick={() => setMode("feat")}>
              Feat
            </ModeButton>
          </div>

          {mode === "asi" ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <ModeButton active={asiMode === "double"} onClick={() => setAsiMode("double")}>
                  +1 / +1
                </ModeButton>
                <ModeButton active={asiMode === "single"} onClick={() => setAsiMode("single")}>
                  +2 one score
                </ModeButton>
              </div>
              {asiMode === "double" ? (
                <div className="flex gap-2">
                  <AbilitySelect
                    value={abilityA}
                    onChange={setAbilityA}
                    options={abilityOptions(abilityB)}
                  />
                  <AbilitySelect
                    value={abilityB}
                    onChange={setAbilityB}
                    options={abilityOptions(abilityA)}
                  />
                </div>
              ) : (
                <AbilitySelect value={abilityA} onChange={setAbilityA} options={ABILITY_KEYS} />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <select
                value={featId}
                onChange={(e) => setFeatId(e.target.value)}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                {FEATS_2014.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">{feat.summary}</p>
              {feat.category === "complex" && (
                <p className="text-xs text-gold">
                  Reference only — this feat&apos;s effect isn&apos;t auto-applied to your sheet;
                  keep the rules text in mind during play.
                </p>
              )}
              {feat.autoEffects?.abilityIncrease && (
                <AbilitySelect
                  value={featAbility}
                  onChange={setFeatAbility}
                  options={
                    feat.autoEffects.abilityIncrease.options === "any"
                      ? ABILITY_KEYS
                      : feat.autoEffects.abilityIncrease.options
                  }
                  label={`+${feat.autoEffects.abilityIncrease.amount} to`}
                />
              )}
              {feat.autoEffects?.chooseSkillProficiencies && (
                <SkillPicker
                  count={feat.autoEffects.chooseSkillProficiencies.count}
                  selected={featSkills}
                  onChange={setFeatSkills}
                />
              )}
            </div>
          )}
        </Card>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="rounded-lg border border-gold bg-gold/10 px-4 py-3 text-sm font-medium text-gold-strong hover:bg-gold/20 disabled:opacity-50"
      >
        {pending ? "Leveling up…" : `Confirm Level ${newLevel}`}
      </button>
    </div>
  );
}

function FeatureRow({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-2.5">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="mt-0.5 text-xs text-muted">{description}</p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm ${
        active ? "border-gold bg-gold/10 text-gold-strong" : "border-border text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function AbilitySelect({
  value,
  onChange,
  options,
  label,
}: {
  value: AbilityKey;
  onChange: (v: AbilityKey) => void;
  options: AbilityKey[];
  label?: string;
}) {
  return (
    <label className="flex flex-1 items-center gap-2 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AbilityKey)}
        className="flex-1 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm text-foreground focus:border-gold focus:outline-none"
      >
        {options.map((a) => (
          <option key={a} value={a}>
            {ABILITY_LABELS[a]}
          </option>
        ))}
      </select>
    </label>
  );
}

function SkillPicker({
  count,
  selected,
  onChange,
}: {
  count: number;
  selected: string[];
  onChange: (skills: string[]) => void;
}) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else if (selected.length < count) {
      onChange([...selected, key]);
    }
  }
  return (
    <div>
      <p className="mb-1 text-xs text-muted">
        Choose {count} skill{count > 1 ? "s" : ""} ({selected.length}/{count})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SKILLS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              selected.includes(s.key)
                ? "border-gold bg-gold/10 text-gold-strong"
                : "border-border text-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
