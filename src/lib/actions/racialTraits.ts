"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function addRacialTrait(input: { name: string; description: string }) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("racial_traits").insert({
    name: input.name,
    description: input.description,
    sort_order: Math.floor(Date.now() / 1000),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function removeRacialTrait(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("racial_traits").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
