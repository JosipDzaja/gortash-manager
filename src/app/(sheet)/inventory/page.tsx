import { getInventoryItems } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui";
import { InventoryRow } from "@/components/inventory/InventoryRow";
import { addInventoryItem } from "@/lib/actions/inventory";

export default async function InventoryPage() {
  const items = await getInventoryItems();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>Inventory</CardTitle>
        <div className="flex flex-col gap-2">
          {items.length === 0 && <p className="text-sm text-muted">No items yet.</p>}
          {items.map((item) => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </div>

        <form action={addInventoryItem} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            name="name"
            required
            placeholder="Item name"
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="quantity"
            type="number"
            defaultValue={1}
            min={1}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none sm:w-20"
          />
          <input
            name="notes"
            placeholder="Notes (optional)"
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md border border-gold bg-gold/10 px-4 py-2 text-sm text-gold-strong hover:bg-gold/20"
          >
            Add
          </button>
        </form>
      </Card>
    </div>
  );
}
