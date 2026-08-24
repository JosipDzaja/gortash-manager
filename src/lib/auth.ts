import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/allowlist";

/**
 * Authoritative access check for every page/action that touches character
 * data. proxy.ts does an optimistic redirect first, but this is the real
 * gate — Server Actions can be called directly, bypassing proxy-guarded
 * navigation, so every one of them must call this too.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  if (error || !data || !isEmailAllowed(email)) {
    redirect("/login");
  }

  return { email: email as string, claims: data.claims };
}
