import Link from "next/link";
import { prochainProjet } from "@/lib/donnees";
import { compteARebours, intervalleEnLettres } from "@/lib/dates";

/**
 * Le prochain cap, sur l'accueil. Pas un décompte de séances : une chose
 * agréable qui approche, et qu'on peut regarder venir tous les jours.
 */
export default async function CapProchain() {
  const projet = await prochainProjet();
  if (!projet?.debut) return null;

  const rebours = compteARebours(projet.debut, projet.fin);

  return (
    <Link
      href="/projets"
      style={{ background: "linear-gradient(135deg, #f0c15c, #e08aa4)" }}
      className="mb-6 flex items-center gap-3 rounded-3xl px-4 py-3 text-white no-underline shadow-sm"
    >
      <span className="text-2xl">🌍</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="titre text-lg leading-tight">{rebours.libelle}</span>
        <span className="truncate text-xs opacity-90">
          {projet.titre} · {intervalleEnLettres(projet.debut, projet.fin)}
        </span>
      </span>
    </Link>
  );
}
