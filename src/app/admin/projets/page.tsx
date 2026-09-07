import FormulaireProjet from "@/components/FormulaireProjet";
import EnteteSection from "@/components/EnteteSection";
import { projets } from "@/lib/donnees";

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

      <ul className="flex flex-col gap-2">
        {liste.map((projet) => (
          <li
            key={projet.id}
            className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5"
          >
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{projet.titre}</span>
              <span className="text-encre-douce text-xs">
                {projet.auteur?.prenom}
                {projet.envie && " · elle a dit oh oui 💛"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
