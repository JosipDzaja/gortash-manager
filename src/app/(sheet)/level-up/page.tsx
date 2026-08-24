import { getCharacter } from "@/lib/data";
import { LevelUpWizard } from "@/components/levelup/LevelUpWizard";

export default async function LevelUpPage() {
  const character = await getCharacter();
  return <LevelUpWizard character={character} />;
}
