"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const CURRENCY_KEYS = ["cp", "sp", "ep", "gp", "pp"] as const;

export async function addWalletTransaction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const sign = formData.get("direction") === "expense" ? -1 : 1;
  const amounts = Object.fromEntries(
    CURRENCY_KEYS.map((key) => {
      const magnitude = Math.abs(Math.trunc(Number(formData.get(`amount_${key}`)) || 0));
      return [`amount_${key}`, sign * magnitude];
    })
  );
  if (Object.values(amounts).every((value) => value === 0)) return;

  const occurredOn = String(formData.get("occurred_on") ?? "").trim();
  const { error } = await supabase.from("wallet_transactions").insert({
    ...amounts,
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
