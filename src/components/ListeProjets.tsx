"use client";

import { useTransition } from "react";
import { marquerEnvie } from "@/lib/actions";
import type { Projet } from "@/lib/types";
import type { Auteur } from "@/lib/donnees";

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
        <li key={projet.id} className="border-bordure overflow-hidden rounded-3xl border bg-white">
          {projet.media_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={projet.media_url} alt={projet.titre} className="h-40 w-full object-cover" />
          )}

          <div className="p-4">
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
