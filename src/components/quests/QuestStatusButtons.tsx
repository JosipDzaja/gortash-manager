"use client";

import { useTransition } from "react";
import { updateQuestStatus } from "@/lib/actions/quests";

const STATUSES = ["active", "completed", "failed"] as const;

export function QuestStatusButtons({
  id,
  status,
}: {
  id: string;
  status: "active" | "completed" | "failed";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={pending || s === status}
          onClick={() => startTransition(() => updateQuestStatus(id, s))}
          className={`rounded-md border px-2 py-1 text-[11px] capitalize ${
            s === status
              ? "border-gold text-gold-strong"
              : "border-border text-muted hover:border-gold hover:text-foreground"
          } disabled:cursor-default`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
