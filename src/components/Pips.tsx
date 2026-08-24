"use client";

import { useTransition } from "react";

/** A row of clickable resource pips. Filled (gold) = available, empty = used. */
export function Pips({
  used,
  max,
  onChange,
  label,
}: {
  used: number;
  max: number;
  onChange: (used: number) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  if (max <= 0) return null;
  const available = max - used;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted">{label}</span>}
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < available;
          return (
            <button
              key={i}
              type="button"
              disabled={pending}
              onClick={() => {
                const newAvailable = filled ? i : i + 1;
                startTransition(() => onChange(max - newAvailable));
              }}
              className={`size-5 rounded-full border transition ${
                filled ? "border-gold bg-gold" : "border-border bg-transparent"
              } ${pending ? "opacity-60" : ""}`}
              aria-label={`Pip ${i + 1}`}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted">
        {available}/{max}
      </span>
    </div>
  );
}
