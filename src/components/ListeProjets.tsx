"use client";

import { useTransition } from "react";
import { marquerEnvie } from "@/lib/actions";
import type { Projet } from "@/lib/types";
import type { Auteur } from "@/lib/donnees";
import { avecAlpha } from "@/lib/couleur";
import { compteARebours, intervalleEnLettres } from "@/lib/dates";

type ProjetAffiche = Projet & { auteur: Auteur | null; media_url: string | null };

export default function ListeProjets({ projets }: { projets: ProjetAffiche[] }) {
  const [, demarrer] = useTransition();

  if (projets.length === 0) {
    return (
      <p className="text-encre-douce text-sm">
        La boîte est encore vide. Elle se remplira d'idées pour plus tard.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {projets.map((projet) => (
        <li
          key={projet.id}
          style={{ backgroundColor: avecAlpha(projet.auteur?.couleur ?? "#c96f8b", 0.07) }}
          className="border-bordure overflow-hidden rounded-3xl border"
        >
          {projet.media_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={projet.media_url} alt={projet.titre} className="h-40 w-full object-cover" />
          )}

          <div className="p-4">
            {projet.debut && <Rebours debut={projet.debut} fin={projet.fin} />}

            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h3 className="titre text-lg">{projet.titre}</h3>
              {projet.auteur && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
                  style={{ backgroundColor: projet.auteur.couleur }}
                >
                  {projet.auteur.prenom}
                </span>
              )}
            </div>

            {projet.description && (
              <p className="text-encre-douce mb-3 text-sm">{projet.description}</p>
            )}

            <button
              onClick={() => demarrer(() => void marquerEnvie(projet.id, !projet.envie))}
              className={`w-full rounded-full py-2 text-sm transition active:scale-[0.98] ${
                projet.envie ? "bg-rose text-white" : "bg-rose-clair text-encre"
              }`}
            >
              {projet.envie ? "Oh oui ✓" : "Oh oui !"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Le compte à rebours d'un projet daté. La jauge se remplit à mesure qu'on
 * s'approche — sur les deux derniers mois, pour que le progrès soit visible
 * même quand la date est encore loin.
 */
function Rebours({ debut, fin }: { debut: string; fin: string | null }) {
  const rebours = compteARebours(debut, fin);
  const avancement = Math.max(0, Math.min(100, ((60 - rebours.jours) / 60) * 100));

  const fonds = {
    attente: "linear-gradient(135deg, #f0c15c, #e08aa4)",
    maintenant: "linear-gradient(135deg, #57a773, #2f8f5b)",
    passe: "linear-gradient(135deg, #cfc6cb, #b3a8ae)",
  } as const;

  return (
    <div className="mb-3">
      <div
        className="flex items-baseline justify-between gap-2 rounded-2xl px-3 py-2 text-white"
        style={{ background: fonds[rebours.etat] }}
      >
        <span className="titre text-lg">{rebours.libelle}</span>
        <span className="text-xs opacity-90">{intervalleEnLettres(debut, fin)}</span>
      </div>

      {rebours.etat === "attente" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${avancement}%`, background: fonds.attente }}
          />
        </div>
      )}
    </div>
  );
}
