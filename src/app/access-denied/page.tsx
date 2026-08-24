import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-3xl">🚫</div>
      <h1 className="text-xl font-medium text-gold-strong">Not on the list</h1>
      <p className="max-w-xs text-sm text-muted">
        Your Google account isn&apos;t allowlisted for this character sheet. If this is a
        mistake, ask the owner to add your email to <code>ALLOWED_EMAILS</code> and the{" "}
        <code>app_allowed_emails</code> table.
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="mt-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:border-gold"
        >
          Sign out and try a different account
        </button>
      </form>
      <Link href="/login" className="text-xs text-muted underline">
        Back to login
      </Link>
    </div>
  );
}
