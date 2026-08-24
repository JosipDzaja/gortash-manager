"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/overview", label: "Overview", icon: "📜" },
  { href: "/combat", label: "Combat", icon: "⚔️" },
  { href: "/inventory", label: "Inventory", icon: "🎒" },
  { href: "/wallet", label: "Wallet", icon: "💰" },
  { href: "/quests", label: "Quests", icon: "🗺️" },
  { href: "/backstory", label: "Backstory", icon: "🐺" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition ${
                  active ? "text-gold-strong" : "text-muted hover:text-foreground"
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
