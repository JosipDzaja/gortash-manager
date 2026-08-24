import { getAbilityAdjustments, getCharacter } from "@/lib/data";
import { LevelUpWizard } from "@/components/levelup/LevelUpWizard";

export default async function LevelUpPage() {
  const [character, adjustments] = await Promise.all([getCharacter(), getAbilityAdjustments()]);
  return <LevelUpWizard character={character} adjustments={adjustments} />;
}
