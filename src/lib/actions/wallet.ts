"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function addWalletTransaction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount === 0) return;
  const occurredOn = String(formData.get("occurred_on") ?? "").trim();
  const { error } = await supabase.from("wallet_transactions").insert({
    amount,
    description: String(formData.get("description") ?? "").trim(),
    occurred_on: occurredOn || new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteWalletTransaction(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("wallet_transactions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
