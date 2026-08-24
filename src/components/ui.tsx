"use client";

import { useState, useTransition, type ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">{children}</h2>
  );
}

export function SavedTextArea({
  value,
  onSave,
  placeholder,
  rows = 3,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [pending, startTransition] = useTransition();

  if (value !== syncedValue && !pending) {
    setSyncedValue(value);
    setLocal(value);
  }

  return (
    <textarea
      value={local}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) startTransition(() => onSave(local));
      }}
      className={`w-full resize-y rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none ${
        pending ? "opacity-60" : ""
      }`}
    />
  );
}

export function SavedTextField({
  value,
  onSave,
  placeholder,
  className,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [pending, startTransition] = useTransition();

  if (value !== syncedValue && !pending) {
    setSyncedValue(value);
    setLocal(value);
  }

  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) startTransition(() => onSave(local));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={`rounded-md border border-border bg-surface-2 px-2 py-1 text-sm text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none ${
        pending ? "opacity-60" : ""
      } ${className ?? ""}`}
    />
  );
}

export function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      onClick={() => startTransition(onClick)}
      className={`rounded-md border border-border px-2 py-1 text-xs transition hover:border-gold ${
        danger ? "text-blood-strong hover:border-blood-strong" : "text-muted hover:text-foreground"
      } ${pending ? "opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gold" | "success" | "danger" }) {
  const toneClass = {
    default: "border-border text-muted",
    gold: "border-gold text-gold-strong",
    success: "border-success text-success",
    danger: "border-blood-strong text-blood-strong",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${toneClass}`}>
      {children}
    </span>
  );
}
