"use client";

import { useTransition } from "react";
import { EditableNumber } from "@/components/EditableNumber";
import { SavedTextField } from "@/components/ui";
import { updateInventoryItem, deleteInventoryItem } from "@/lib/actions/inventory";
import type { InventoryItem } from "@/lib/data";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-start gap-2">
        <SavedTextField
          value={item.name}
          onSave={(name) => updateInventoryItem(item.id, { name })}
          className="flex-1"
        />
        <EditableNumber
          value={item.quantity}
          min={0}
          width="w-14"
          onSave={(quantity) => updateInventoryItem(item.id, { quantity })}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteInventoryItem(item.id))}
          className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-blood-strong hover:text-blood-strong"
        >
          ✕
        </button>
      </div>
      <SavedTextField
        value={item.notes}
        onSave={(notes) => updateInventoryItem(item.id, { notes })}
        placeholder="Notes…"
        className="mt-2 w-full text-xs text-muted"
      />
    </div>
  );
}
