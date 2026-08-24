"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function addInventoryItem(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { error } = await supabase.from("inventory_items").insert({
    name,
    quantity: Number(formData.get("quantity") ?? 1) || 1,
    notes: String(formData.get("notes") ?? "").trim(),
    sort_order: Math.floor(Date.now() / 1000),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateInventoryItem(
  id: string,
  patch: { name?: string; quantity?: number; notes?: string }
) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteInventoryItem(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
