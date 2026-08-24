# Gortash Manager

A D&D 5e character sheet and campaign tracker, backed by Supabase Postgres with Next.js Server Components/Actions.

## Language

**Currency**:
One of five D&D 5e coin denominations tracked independently: copper (cp), silver (sp), electrum (ep), gold (gp), platinum (pp).
_Avoid_: coin type, money type

**Wallet**:
A character's current holdings, expressed as one running total per Currency. Never stored directly — always derived by summing all Transactions.
_Avoid_: balance, purse, funds (as the noun for the whole holdings)

**Transaction**:
A single logged event that changes the Wallet: a date, a description, and one or more Currency amounts (e.g. "+12 gp, +30 sp" recorded as one Transaction). The Transaction log is the permanent record; the Wallet is just its sum.
_Avoid_: entry, ledger line

**Income**:
A Transaction whose Currency amounts increase the Wallet.
_Avoid_: deposit, gain

**Expense**:
A Transaction whose Currency amounts decrease the Wallet.
_Avoid_: withdrawal, spend, purchase
