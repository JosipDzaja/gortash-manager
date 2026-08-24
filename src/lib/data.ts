import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type CharacterRow = {
  id: number;
  name: string;
  race: string;
  class_name: string;
  subclass_name: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  skill_proficiencies: string[];
  saving_throw_proficiencies: string[];
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  armor_class: number;
  initiative_misc: number;
  speed: number;
  hit_dice_total: number;
  hit_dice_current: number;
  inspiration: boolean;
  second_wind_max: number;
  second_wind_used: number;
  action_surge_max: number;
  action_surge_used: number;
  indomitable_max: number;
  indomitable_used: number;
  warchiefs_might_max: number;
  warchiefs_might_used: number;
  packs_intercession_max: number;
  packs_intercession_used: number;
  known_runes: string[];
  rune_charges_used: Record<string, number>;
  conditions: string[];
  death_save_successes: number;
  death_save_failures: number;
  feats: { id: string; level: number; abilityChoice?: string; skillChoices?: string[] }[];
  asi_history: { level: number; type: "asi" | "feat"; detail: string }[];
  notes: string;
};

export type Attack = {
  id: string;
  name: string;
  to_hit_bonus: number;
  damage_dice: string;
  damage_type: string;
  properties: string;
  sort_order: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  sort_order: number;
};

export type WalletTransaction = {
  id: string;
  occurred_on: string;
  amount: number;
  description: string;
  created_at: string;
};

export type Quest = {
  id: string;
  title: string;
  status: "active" | "completed" | "failed";
  description: string;
  created_at: string;
  updated_at: string;
};

export type SessionLog = {
  id: string;
  logged_on: string;
  entry: string;
  created_at: string;
};

export async function getCharacter(): Promise<CharacterRow> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("character").select("*").eq("id", 1).single();
  if (error || !data) throw new Error("Character row missing — run supabase/schema.sql.");
  return data as CharacterRow;
}

export async function getAttacks(): Promise<Attack[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("attacks").select("*").order("sort_order");
  if (error) throw error;
  return data as Attack[];
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as InventoryItem[];
}

export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .order("occurred_on", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as WalletTransaction[];
}

export async function getQuests(): Promise<Quest[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Quest[];
}

export async function getSessionLogs(): Promise<SessionLog[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_logs")
    .select("*")
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SessionLog[];
}
