"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { AbilityKey, AdjustmentKind } from "@/lib/dnd/types";

export async function addAbilityAdjustment(input: {
  ability: AbilityKey;
  label: string;
  kind: AdjustmentKind;
  amount: number;
}) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("ability_adjustments").insert({
    ability: input.ability,
    label: input.label,
    kind: input.kind,
    amount: input.amount,
    sort_order: Math.floor(Date.now() / 1000),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function removeAbilityAdjustment(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("ability_adjustments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
