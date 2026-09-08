import FormulaireProjet from "@/components/FormulaireProjet";
import EnteteSection from "@/components/EnteteSection";
import { projets } from "@/lib/donnees";
import ListeProjetsAdmin from "@/components/ListeProjetsAdmin";

export const dynamic = "force-dynamic";

export default async function ProjetsAdmin() {
  const liste = await projets();

  return (
    <main className="flex flex-col gap-6">
      <EnteteSection
        emoji="🌍"
        titre="La boîte à projets"
        description="Ne déposez pas qu'une idée : une photo du gîte, la carte du resto. Le futur devient concret."
        teinte="lagon"
      />

      <FormulaireProjet />

      <ListeProjetsAdmin projets={liste} />
    </main>
  );
}
