import { getWalletTransactions } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui";
import { addWalletTransaction, deleteWalletTransaction } from "@/lib/actions/wallet";

const CURRENCIES = [
  { key: "pp", label: "pp", name: "Platinum", colorClass: "text-platinum" },
  { key: "gp", label: "gp", name: "Gold", colorClass: "text-gold-strong" },
  { key: "ep", label: "ep", name: "Electrum", colorClass: "text-electrum" },
  { key: "sp", label: "sp", name: "Silver", colorClass: "text-silver" },
  { key: "cp", label: "cp", name: "Copper", colorClass: "text-copper" },
] as const;

function fieldFor(currencyKey: (typeof CURRENCIES)[number]["key"]) {
  return `amount_${currencyKey}` as const;
}

export default async function WalletPage() {
  const transactions = await getWalletTransactions();

  const totals = transactions.reduce(
    (acc, t) => {
      for (const { key } of CURRENCIES) acc[key] += t[fieldFor(key)];
      return acc;
    },
    { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
  );

  const reversed = [...transactions].reverse();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="text-center">
        <CardTitle>Wallet</CardTitle>
        <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
          {CURRENCIES.map(({ key, label, colorClass }) => (
            <p key={key} className={`text-2xl font-semibold ${colorClass}`}>
              {totals[key]} <span className="text-sm font-normal text-muted">{label}</span>
            </p>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>New Transaction</CardTitle>
        <form action={addWalletTransaction} className="flex flex-col gap-2">
          <input
            name="occurred_on"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <div className="grid grid-cols-5 gap-2">
            {CURRENCIES.map(({ key, label }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-center text-[10px] uppercase tracking-wider text-muted">
                  {label}
                </span>
                <input
                  name={fieldFor(key)}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  className="w-full rounded-md border border-border bg-surface-2 px-1.5 py-1.5 text-center text-sm focus:border-gold focus:outline-none"
                />
              </label>
            ))}
          </div>
          <input
            name="description"
            placeholder="Description"
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 text-sm focus:border-gold focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              name="direction"
              value="income"
              className="flex-1 rounded-md border border-success bg-success/10 px-2 py-1.5 text-sm text-success hover:bg-success/20"
            >
              Income
            </button>
            <button
              type="submit"
              name="direction"
              value="expense"
              className="flex-1 rounded-md border border-blood-strong bg-blood-strong/10 px-2 py-1.5 text-sm text-blood-strong hover:bg-blood-strong/20"
            >
              Expense
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted">
          Enter the coins involved, then choose Income to add them or Expense to spend them.
        </p>
      </Card>

      <Card>
        <CardTitle>Ledger</CardTitle>
        <div className="flex flex-col gap-1.5">
          {reversed.length === 0 && <p className="text-sm text-muted">No transactions yet.</p>}
          {reversed.map((t) => {
            const isExpense = CURRENCIES.some(({ key }) => t[fieldFor(key)] < 0);
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{t.description || "—"}</p>
                  <p className="text-xs text-muted">{t.occurred_on}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div
                    className={`flex flex-wrap justify-end gap-x-2 text-sm font-medium ${
                      isExpense ? "text-blood-strong" : "text-success"
                    }`}
                  >
                    {CURRENCIES.filter(({ key }) => t[fieldFor(key)] !== 0).map(({ key, label }) => {
                      const value = t[fieldFor(key)];
                      return (
                        <span key={key}>
                          {value >= 0 ? "+" : ""}
                          {value} {label}
                        </span>
                      );
                    })}
                  </div>
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
            );
          })}
        </div>
      </Card>
    </div>
  );
}
