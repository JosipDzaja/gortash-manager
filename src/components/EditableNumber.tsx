"use client";

import { useState, useTransition } from "react";

export function EditableNumber({
  value,
  onSave,
  className,
  min,
  max,
  width = "w-16",
}: {
  value: number;
  onSave: (value: number) => Promise<void>;
  className?: string;
  min?: number;
  max?: number;
  width?: string;
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
      type="number"
      value={local}
      min={min}
      max={max}
      onChange={(e) => setLocal(e.target.value === "" ? 0 : Number(e.target.value))}
      onBlur={() => {
        if (local !== value) startTransition(() => onSave(local));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={`${width} rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-foreground focus:border-gold focus:outline-none ${
        pending ? "opacity-60" : ""
      } ${className ?? ""}`}
    />
  );
}
