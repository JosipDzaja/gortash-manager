import type { ReactNode } from "react";
import { getCharacter } from "@/lib/data";
import { TabNav } from "@/components/TabNav";
import { logout } from "@/lib/actions/auth";

export default async function SheetLayout({ children }: { children: ReactNode }) {
  const character = await getCharacter();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium tracking-wide text-gold-strong">
              {character.name}
            </p>
            <p className="text-xs text-muted">
              Level {character.level} {character.race} {character.subclass_name}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-gold hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="themed-scrollbar mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4">
        {children}
      </main>

      <TabNav />
    </div>
  );
}
