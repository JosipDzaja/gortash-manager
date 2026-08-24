"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { CharacterRow } from "@/lib/data";

/** Generic patch for the single character row — used by every combat/overview widget. */
export async function updateCharacter(patch: Partial<CharacterRow>) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("character").update(patch).eq("id", 1);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateNotes(notes: string) {
  await updateCharacter({ notes });
}

export async function updateArmorClass(armor_class: number) {
  await updateCharacter({ armor_class });
}

export async function updateInitiativeMisc(initiative_misc: number) {
  await updateCharacter({ initiative_misc });
}

export async function updateSpeed(speed: number) {
  await updateCharacter({ speed });
}

export async function takeRest(type: "short" | "long") {
  await requireUser();
  const supabase = await createClient();

  const patch: Partial<CharacterRow> = {
    second_wind_used: 0,
    action_surge_used: 0,
    rune_charges_used: {},
    death_save_successes: 0,
    death_save_failures: 0,
  };

  if (type === "long") {
    patch.indomitable_used = 0;
    patch.warchiefs_might_used = 0;
    patch.packs_intercession_used = 0;
  }

  const { error } = await supabase.from("character").update(patch).eq("id", 1);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function addAttack(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("attacks").insert({
    name: String(formData.get("name") ?? "").trim(),
    to_hit_bonus: Number(formData.get("to_hit_bonus") ?? 0),
    damage_dice: String(formData.get("damage_dice") ?? "").trim(),
    damage_type: String(formData.get("damage_type") ?? "").trim(),
    properties: String(formData.get("properties") ?? "").trim(),
    sort_order: Number(formData.get("sort_order") ?? 99),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteAttack(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("attacks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
