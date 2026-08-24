import { AbilityKey } from "./types";

export type FeatAutoEffects = {
  /** Ability score increase this feat grants, chosen from `options` (or "any"). */
  abilityIncrease?: { options: AbilityKey[] | "any"; amount: number };
  /** Skill proficiencies granted outright. */
  skillProficiencies?: string[];
  /** Let the player choose N skills (from any list, or a restricted one) as proficient. */
  chooseSkillProficiencies?: { count: number; from?: string[] };
  toolProficiencies?: string[];
  savingThrowProficiencies?: AbilityKey[];
  speedBonus?: number;
  languagesGained?: number;
};

export type Feat = {
  id: string;
  name: string;
  prerequisite?: string;
  /** simple = effects apply automatically to the sheet; complex = shown as reference text only. */
  category: "simple" | "complex";
  summary: string;
  autoEffects?: FeatAutoEffects;
};

export const FEATS_2014: Feat[] = [
  {
    id: "alert",
    name: "Alert",
    category: "simple",
    summary: "+5 to initiative; can't be surprised while conscious; hidden attackers gain no advantage against you.",
  },
  {
    id: "athlete",
    name: "Athlete",
    category: "simple",
    summary: "Better climbing/jumping/standing up, +1 Str or Dex.",
    autoEffects: { abilityIncrease: { options: ["str", "dex"], amount: 1 } },
  },
  {
    id: "actor",
    name: "Actor",
    category: "simple",
    summary: "+1 Cha; advantage on Deception/Performance checks to pass as someone else; can mimic voices/sounds.",
    autoEffects: { abilityIncrease: { options: ["cha"], amount: 1 } },
  },
  {
    id: "charger",
    name: "Charger",
    category: "complex",
    summary: "Dash then bonus-action attack or shove with a damage/distance bonus if you moved 10+ ft straight first.",
  },
  {
    id: "crossbow_expert",
    name: "Crossbow Expert",
    category: "complex",
    summary: "Ignore loading property of crossbows, no disadvantage for firing in melee range, bonus-action hand crossbow shot after an attack.",
  },
  {
    id: "defensive_duelist",
    name: "Defensive Duelist",
    category: "complex",
    summary: "Reaction while wielding a finesse weapon: add proficiency bonus to AC against one melee attack.",
  },
  {
    id: "dual_wielder",
    name: "Dual Wielder",
    category: "complex",
    summary: "+1 AC while dual wielding; can two-weapon fight with non-light weapons; can draw two weapons at once.",
  },
  {
    id: "dungeon_delver",
    name: "Dungeon Delver",
    category: "complex",
    summary: "Advantage on checks to spot secret doors/traps, resistance to trap damage, normal pace while searching.",
  },
  {
    id: "durable",
    name: "Durable",
    category: "simple",
    summary: "+1 Con; when you roll Hit Dice to regain HP, the minimum per die is 2x your Con modifier.",
    autoEffects: { abilityIncrease: { options: ["con"], amount: 1 } },
  },
  {
    id: "elemental_adept",
    name: "Elemental Adept",
    category: "complex",
    summary: "Choose a damage type: your spells of that type ignore resistance and treat 1s on damage dice as 2s. (Not relevant without spellcasting.)",
  },
  {
    id: "grappler",
    name: "Grappler",
    category: "complex",
    summary: "Advantage on attacks against a creature you're grappling; can attempt to pin a grappled creature.",
  },
  {
    id: "great_weapon_master",
    name: "Great Weapon Master",
    category: "complex",
    summary: "Bonus-action attack after a crit/kill with a heavy weapon; can take -5 to hit for +10 damage on heavy weapon attacks.",
  },
  {
    id: "healer",
    name: "Healer",
    category: "complex",
    summary: "Using a healer's kit to stabilize also restores 1 HP; can spend the kit as an action to heal further HP.",
  },
  {
    id: "heavily_armored",
    name: "Heavily Armored",
    category: "simple",
    summary: "+1 Str; gain proficiency with heavy armor.",
    autoEffects: { abilityIncrease: { options: ["str"], amount: 1 } },
  },
  {
    id: "heavy_armor_master",
    name: "Heavy Armor Master",
    category: "simple",
    summary: "+1 Str; while wearing heavy armor, reduce non-magical bludgeoning/piercing/slashing damage taken by 3.",
    autoEffects: { abilityIncrease: { options: ["str"], amount: 1 } },
  },
  {
    id: "inspiring_leader",
    name: "Inspiring Leader",
    category: "complex",
    summary: "Spend 10 minutes inspiring allies within 30 ft; each gains temporary HP equal to your level + Cha modifier.",
  },
  {
    id: "keen_mind",
    name: "Keen Mind",
    category: "simple",
    summary: "+1 Int; always know which way is north, hours until sunrise/sunset, and recall anything seen/heard in the last month.",
    autoEffects: { abilityIncrease: { options: ["int"], amount: 1 } },
  },
  {
    id: "lightly_armored",
    name: "Lightly Armored",
    category: "simple",
    summary: "+1 Str or Dex; gain proficiency with light armor.",
    autoEffects: { abilityIncrease: { options: ["str", "dex"], amount: 1 } },
  },
  {
    id: "linguist",
    name: "Linguist",
    category: "simple",
    summary: "+1 Int; learn 3 languages; can write ciphers others can't decode without your help.",
    autoEffects: { abilityIncrease: { options: ["int"], amount: 1 }, languagesGained: 3 },
  },
  {
    id: "lucky",
    name: "Lucky",
    category: "complex",
    summary: "3 luck points per long rest to gain advantage on a roll or impose disadvantage on an attack against you.",
  },
  {
    id: "mage_slayer",
    name: "Mage Slayer",
    category: "complex",
    summary: "Reaction attack against a creature that casts a spell within 5 ft; advantage on saves vs spells cast within 5 ft; can impose disadvantage on a caster's concentration save.",
  },
  {
    id: "magic_initiate",
    name: "Magic Initiate",
    category: "complex",
    summary: "Learn two cantrips and one 1st-level spell (once/long rest) from a chosen class's list. (Not relevant without spellcasting.)",
  },
  {
    id: "martial_adept",
    name: "Martial Adept",
    category: "complex",
    summary: "Learn two Battle Master maneuvers and gain a d6 superiority die (regained on short/long rest).",
  },
  {
    id: "medium_armor_master",
    name: "Medium Armor Master",
    category: "complex",
    summary: "No stealth disadvantage in medium armor; Dex bonus to AC in medium armor caps at +3 instead of +2.",
  },
  {
    id: "mobile",
    name: "Mobile",
    category: "simple",
    summary: "+10 ft speed; difficult terrain doesn't slow your Dash; no opportunity attacks from a creature you melee'd this turn.",
    autoEffects: { speedBonus: 10 },
  },
  {
    id: "moderately_armored",
    name: "Moderately Armored",
    category: "simple",
    summary: "+1 Str or Dex; gain proficiency with medium armor and shields.",
    autoEffects: { abilityIncrease: { options: ["str", "dex"], amount: 1 } },
  },
  {
    id: "mounted_combatant",
    name: "Mounted Combatant",
    category: "complex",
    summary: "Advantage on melee attacks vs an unmounted creature smaller than your mount; can force an attack aimed at your mount to target you; your mount takes no damage on a mount Dex save that would halve it.",
  },
  {
    id: "observant",
    name: "Observant",
    category: "simple",
    summary: "+1 Int or Wis; can read lips; +5 passive Perception and passive Investigation.",
    autoEffects: { abilityIncrease: { options: ["int", "wis"], amount: 1 } },
  },
  {
    id: "polearm_master",
    name: "Polearm Master",
    category: "complex",
    summary: "Bonus-action butt-end attack (1d4) with a glaive/halberd/quarterstaff/spear; opportunity attack against anyone entering your reach with such a weapon.",
  },
  {
    id: "resilient",
    name: "Resilient",
    category: "simple",
    summary: "+1 to a chosen ability score and gain proficiency in saving throws with that ability.",
    autoEffects: {
      abilityIncrease: { options: "any", amount: 1 },
      savingThrowProficiencies: [],
    },
  },
  {
    id: "ritual_caster",
    name: "Ritual Caster",
    category: "complex",
    summary: "Gain a ritual book with two 1st-level ritual spells from a chosen class; can add more found in the wild. (Not relevant without spellcasting.)",
  },
  {
    id: "savage_attacker",
    name: "Savage Attacker",
    category: "complex",
    summary: "Once per turn, reroll your weapon damage dice and use either result.",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    category: "complex",
    summary: "Opportunity attacks reduce the target's speed to 0; you can opportunity-attack even if the trigger creature disengaged; when a creature within 5 ft attacks someone other than you, you can use your reaction to attack it.",
  },
  {
    id: "sharpshooter",
    name: "Sharpshooter",
    category: "complex",
    summary: "No long-range disadvantage, ignore half/three-quarters cover, can take -5 to hit for +10 damage with ranged weapons.",
  },
  {
    id: "shield_master",
    name: "Shield Master",
    category: "complex",
    summary: "Bonus-action shove while wielding a shield; add shield bonus to Dex saves vs effects that target only you; no damage on a successful Dex save vs certain effects.",
  },
  {
    id: "skilled",
    name: "Skilled",
    category: "simple",
    summary: "Gain proficiency in any combination of three skills or tools.",
    autoEffects: { chooseSkillProficiencies: { count: 3 } },
  },
  {
    id: "skulker",
    name: "Skulker",
    category: "complex",
    summary: "Hide when only lightly obscured; missing a ranged attack while hidden doesn't reveal you; dim light doesn't worsen your Perception.",
  },
  {
    id: "spell_sniper",
    name: "Spell Sniper",
    category: "complex",
    summary: "Double the range of attack-roll spells, ignore half/three-quarters cover with them, learn an attack-roll cantrip. (Not relevant without spellcasting.)",
  },
  {
    id: "tavern_brawler",
    name: "Tavern Brawler",
    category: "simple",
    summary: "+1 Str or Con; proficient with improvised weapons and unarmed strikes (1d4); bonus-action grapple attempt after an unarmed hit.",
    autoEffects: { abilityIncrease: { options: ["str", "con"], amount: 1 } },
  },
  {
    id: "tough",
    name: "Tough",
    category: "complex",
    summary: "Max HP increases by 2 per character level (and again each time you level up).",
  },
  {
    id: "war_caster",
    name: "War Caster",
    category: "complex",
    summary: "Advantage on concentration saves; can perform somatic components with weapons/shield in hand; can cast a spell as an opportunity attack. (Not relevant without spellcasting.)",
  },
  {
    id: "weapon_master",
    name: "Weapon Master",
    category: "simple",
    summary: "+1 Str or Dex; gain proficiency with four weapons of your choice.",
    autoEffects: { abilityIncrease: { options: ["str", "dex"], amount: 1 } },
  },
];

export function getFeat(id: string): Feat | undefined {
  return FEATS_2014.find((f) => f.id === id);
}
