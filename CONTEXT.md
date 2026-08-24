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

**Proficiency**:
Umbrella term for the four independent lists of things a character is trained in: Skill Proficiency and Saving Throw Proficiency (fixed D&D lists, toggled on/off), and Weapon & Armor Proficiency and Tool Proficiency (freeform, entries added/removed by name). Never use "Proficiency" alone in code or UI — always qualify which kind.
_Avoid_: proficiency (alone, unqualified)

**Weapon & Armor Proficiency**:
A weapon or armor category the character can use without penalty, stored as a freeform name (e.g. "Martial Weapons", "Medium Armor", "Handaxes"). One combined list, not split into separate weapon/armor lists.
_Avoid_: weapon proficiency / armor proficiency (as separate concepts)

**Tool Proficiency**:
A tool, kit, or instrument the character is trained to use, stored as a freeform name (e.g. "Thieves' Tools", "Smith's Tools"). Distinct list from Weapon & Armor Proficiency.
_Avoid_: proficiency (alone)

**Racial Trait**:
A named feature granted by the character's race (e.g. "Darkvision", "Relentless Endurance"), stored as a name plus a description. Distinct from a Score Adjustment — a Racial Trait is a fixed feature, not a numeric contribution to an Ability Score's Total.
_Avoid_: feature, trait (alone)

**Language**:
A language the character can speak, read, or write, stored as a freeform name (e.g. "Common", "Deep Speech"). No fluency or literacy distinction tracked.
_Avoid_: tongue
