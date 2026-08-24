"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TEMP DEBUG: shows the exact authorize URL (and redirect_to param) instead
  // of auto-navigating, so we can verify what's being sent from a phone with
  // no devtools. Remove once the redirect issue is confirmed fixed.
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);
    setDebugUrl(null);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        setError(error.message);
        setPending(false);
        return;
      }
      if (data?.url) {
        setDebugUrl(data.url);
        setPending(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed. This page may need to be served over HTTPS."
      );
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-full border border-border bg-surface text-2xl">
          🐺
        </div>
        <h1 className="font-serif text-2xl tracking-wide text-gold-strong">
          House Valemont
        </h1>
        <p className="max-w-xs text-sm text-muted">
          &ldquo;The Pack Endures.&rdquo; Sign in to access Gortash&apos;s character sheet.
        </p>
      </div>

      <button
        onClick={signInWithGoogle}
        disabled={pending}
        className="flex items-center gap-3 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold disabled:opacity-50"
      >
        <GoogleIcon />
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>

      {error && <p className="max-w-xs text-sm text-blood-strong">{error}</p>}

      {debugUrl && (
        <div className="max-w-xs space-y-2 rounded-lg border border-border bg-surface p-3 text-left">
          <p className="break-all text-xs text-muted">{debugUrl}</p>
          <a
            href={debugUrl}
            className="block rounded border border-gold px-3 py-2 text-center text-xs font-medium text-gold-strong"
          >
            Proceed to Google
          </a>
        </div>
      )}

      <p className="max-w-xs text-xs text-muted">
        Access is restricted to allowlisted accounts only.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
