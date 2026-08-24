"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function addQuest(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const { error } = await supabase.from("quests").insert({
    title,
    description: String(formData.get("description") ?? "").trim(),
    status: "active",
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateQuestStatus(id: string, status: "active" | "completed" | "failed") {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("quests").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function updateQuest(id: string, patch: { title?: string; description?: string }) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("quests").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteQuest(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("quests").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function addSessionLog(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const entry = String(formData.get("entry") ?? "").trim();
  if (!entry) return;
  const loggedOn = String(formData.get("logged_on") ?? "").trim();
  const { error } = await supabase.from("session_logs").insert({
    entry,
    logged_on: loggedOn || new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

export async function deleteSessionLog(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("session_logs").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
