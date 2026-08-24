"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getAbilityAdjustments, getCharacter } from "@/lib/data";
import { proficiencyBonusForLevel, type AbilityKey } from "@/lib/dnd/types";
import { abilityMod } from "@/lib/dnd/computed";
import { actionSurgeMaxForLevel, indomitableMaxForLevel } from "@/lib/dnd/fighter";
import { getFeat } from "@/lib/dnd/feats";

export type LevelUpChoice =
  | { type: "asi"; increases: Partial<Record<AbilityKey, number>> }
  | { type: "feat"; featId: string; abilityChoice?: AbilityKey; skillChoices?: string[] };

export async function applyLevelUp(input: { hpRolled: number; choice?: LevelUpChoice }) {
  await requireUser();
  const character = await getCharacter();
  const adjustments = await getAbilityAdjustments();
  const newLevel = character.level + 1;
  if (newLevel > 20) throw new Error("Already at max level (20).");

  const supabase = await createClient();
  const patch: Record<string, unknown> = {};

  patch.level = newLevel;

  const conMod = abilityMod(character, "con", adjustments);
  const hpGain = Math.max(1, input.hpRolled + conMod);
  patch.max_hp = character.max_hp + hpGain;
  patch.current_hp = character.current_hp + hpGain;
  patch.hit_dice_total = character.hit_dice_total + 1;
  patch.hit_dice_current = character.hit_dice_current + 1;

  const feats = [...character.feats];
  const asiHistory = [...character.asi_history];
  let skillProficiencies = character.skill_proficiencies;
  const newAdjustments: {
    ability: AbilityKey;
    label: string;
    kind: "buff";
    amount: number;
    sort_order: number;
  }[] = [];

  if (input.choice?.type === "asi") {
    for (const [key, amount] of Object.entries(input.choice.increases) as [AbilityKey, number][]) {
      if (!amount) continue;
      newAdjustments.push({
        ability: key,
        label: `Level ${newLevel} ASI`,
        kind: "buff",
        amount,
        sort_order: Math.floor(Date.now() / 1000) + newAdjustments.length,
      });
    }
    const detail = Object.entries(input.choice.increases)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
      .join(", ");
    asiHistory.push({ level: newLevel, type: "asi", detail });
  } else if (input.choice?.type === "feat") {
    const feat = getFeat(input.choice.featId);
    if (feat) {
      feats.push({
        id: feat.id,
        level: newLevel,
        abilityChoice: input.choice.abilityChoice,
        skillChoices: input.choice.skillChoices,
      });
      asiHistory.push({ level: newLevel, type: "feat", detail: feat.name });

      if (feat.autoEffects?.abilityIncrease && input.choice.abilityChoice) {
        const key = input.choice.abilityChoice;
        const amount = feat.autoEffects.abilityIncrease.amount;
        newAdjustments.push({
          ability: key,
          label: feat.name,
          kind: "buff",
          amount,
          sort_order: Math.floor(Date.now() / 1000),
        });
      }
      if (input.choice.skillChoices?.length) {
        skillProficiencies = Array.from(new Set([...skillProficiencies, ...input.choice.skillChoices]));
      }
      if (feat.autoEffects?.skillProficiencies?.length) {
        skillProficiencies = Array.from(
          new Set([...skillProficiencies, ...feat.autoEffects.skillProficiencies])
        );
      }
    }
  }

  patch.feats = feats;
  patch.asi_history = asiHistory;
  patch.skill_proficiencies = skillProficiencies;

  patch.action_surge_max = actionSurgeMaxForLevel(newLevel);
  patch.indomitable_max = indomitableMaxForLevel(newLevel);

  if (newLevel >= 3) {
    const pb = proficiencyBonusForLevel(newLevel);
    patch.warchiefs_might_max = pb;
    patch.packs_intercession_max = newLevel >= 7 ? pb : 0;
  }

  const { error } = await supabase.from("character").update(patch).eq("id", 1);
  if (error) throw error;

  if (newAdjustments.length) {
    const { error: adjustmentsError } = await supabase.from("ability_adjustments").insert(newAdjustments);
    if (adjustmentsError) throw adjustmentsError;
  }

  revalidatePath("/", "layout");
}
