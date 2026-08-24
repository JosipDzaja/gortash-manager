import { getWalletTransactions } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui";
import { addWalletTransaction, deleteWalletTransaction } from "@/lib/actions/wallet";

export default async function WalletPage() {
  const transactions = await getWalletTransactions();

  const withBalance = transactions.reduce<Array<(typeof transactions)[number] & { balance: number }>>(
    (acc, t) => {
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({ ...t, balance: previousBalance + Number(t.amount) });
      return acc;
    },
    []
  );
  const currentBalance = withBalance.length > 0 ? withBalance[withBalance.length - 1].balance : 0;
  const reversed = [...withBalance].reverse();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="text-center">
        <CardTitle>Balance</CardTitle>
        <p className="text-4xl font-semibold text-gold-strong">{currentBalance.toFixed(2)} gp</p>
      </Card>

      <Card>
        <CardTitle>New Transaction</CardTitle>
        <form action={addWalletTransaction} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input
            name="occurred_on"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="col-span-2 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none sm:col-span-1"
          />
          <input
            name="amount"
            type="number"
            step="0.01"
            required
            placeholder="+/- gp"
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <input
            name="description"
            placeholder="Description"
            className="col-span-2 rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none sm:col-span-1"
          />
          <button
            type="submit"
            className="rounded-md border border-gold bg-gold/10 px-2 py-1.5 text-sm text-gold-strong hover:bg-gold/20"
          >
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-muted">
          Use a negative amount to spend gold, positive to gain it.
        </p>
      </Card>

      <Card>
        <CardTitle>Ledger</CardTitle>
        <div className="flex flex-col gap-1.5">
          {reversed.length === 0 && <p className="text-sm text-muted">No transactions yet.</p>}
          {reversed.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{t.description || "—"}</p>
                <p className="text-xs text-muted">
                  {t.occurred_on} · balance {t.balance.toFixed(2)} gp
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    Number(t.amount) >= 0 ? "text-success" : "text-blood-strong"
                  }`}
                >
                  {Number(t.amount) >= 0 ? "+" : ""}
                  {Number(t.amount).toFixed(2)}
                </span>
                <form action={deleteWalletTransaction.bind(null, t.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:border-blood-strong hover:text-blood-strong"
                  >
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
