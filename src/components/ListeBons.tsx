"use client";

import { useTransition } from "react";
import { reclamerBon } from "@/lib/actions";
import type { Bon } from "@/lib/types";
import type { Auteur } from "@/lib/donnees";

export default function ListeBons({ bons }: { bons: (Bon & { auteur: Auteur | null })[] }) {
  const [enCours, demarrer] = useTransition();

  if (bons.length === 0) {
    return (
      <p className="text-encre-douce text-sm">
        Tes garçons n'ont pas encore déposé de bons. Ça ne devrait pas tarder.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {bons.map((bon) => (
        <li
          key={bon.id}
          className={`border-bordure rounded-3xl border bg-white p-4 ${
            bon.etat === "honore" ? "opacity-50" : ""
          }`}
        >
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h3 className="titre text-lg">{bon.titre}</h3>
            {bon.auteur && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: bon.auteur.couleur }}
              >
                {bon.auteur.prenom}
              </span>
            )}
          </div>

          {bon.description && (
            <p className="text-encre-douce mb-3 text-sm">{bon.description}</p>
          )}

          {bon.etat === "disponible" && (
            <button
              onClick={() => demarrer(() => void reclamerBon(bon.id))}
              disabled={enCours}
              className="bg-rose w-full rounded-full py-2 text-sm text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              Je le réclame
            </button>
          )}

          {bon.etat === "reclame" && (
            <p className="bg-rose-clair rounded-full py-2 text-center text-sm">
              Réclamé — ils sont prévenus 🎉
            </p>
          )}

          {bon.etat === "honore" && (
            <p className="text-encre-douce py-2 text-center text-sm">Utilisé ✓</p>
          )}
        </li>
      ))}
    </ul>
  );
}
