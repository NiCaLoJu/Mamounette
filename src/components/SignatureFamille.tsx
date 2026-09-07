import { membres } from "@/lib/donnees";

/**
 * La légende des couleurs. Chaque case fermée porte celle de son auteur :
 * au bout de deux ou trois fois, elle sait qui a déposé quoi avant d'ouvrir.
 */
export default async function SignatureFamille() {
  const gens = (await membres()).filter((g) => g.role === "enfant");
  if (gens.length === 0) return null;

  return (
    <ul className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1">
      {gens.map((g) => (
        <li key={g.id} className="text-encre-douce flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: g.couleur }}
          />
          {g.prenom}
        </li>
      ))}
    </ul>
  );
}
