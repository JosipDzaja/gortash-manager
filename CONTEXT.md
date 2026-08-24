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

**Ability Score**:
One of a character's six core stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma). Has a Base Score and a Total.
_Avoid_: stat, attribute

**Base Score**:
An Ability Score's directly-editable stored value, independent of any Score Adjustment.
_Avoid_: rolled score, starting score, total

**Total**:
The Base Score plus every Score Adjustment for that ability. What Ability Modifier is derived from.
_Avoid_: effective score, current score, base score

**Score Adjustment**:
A freeform contribution to an Ability Score's Total — a description plus an amount, either added (Buff), subtracted (Debuff), or set as a floor the Total can't fall below (Set to). Covers anything from a feat to a potion to a curse. Added and removed freely; never alters the Base Score.
_Avoid_: modifier (reserved for Ability Modifier), bonus

**Ability Modifier**:
The +/-N derived from an Ability Score's Total (floor((total-10)/2)), used in checks, saves, and attacks. Not a Score Adjustment.
_Avoid_: modifier (alone — always qualify as Ability Modifier or Score Adjustment)
