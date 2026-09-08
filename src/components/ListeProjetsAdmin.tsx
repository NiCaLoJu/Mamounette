"use client";

import { useState } from "react";
import FormulaireProjet from "./FormulaireProjet";
import BoutonRetirer from "./BoutonRetirer";
import { supprimerProjet } from "@/lib/actions";
import { compteARebours, intervalleEnLettres } from "@/lib/dates";
import type { Projet } from "@/lib/types";
import type { Auteur } from "@/lib/donnees";

type ProjetAdmin = Projet & { auteur: Auteur | null; media_url: string | null };

/** Chaque projet se déplie pour être corrigé ou retiré. */
export default function ListeProjetsAdmin({ projets }: { projets: ProjetAdmin[] }) {
  const [ouvert, setOuvert] = useState<string | null>(null);

  if (projets.length === 0) {
    return <p className="text-encre-douce text-sm">Aucun projet pour l'instant.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {projets.map((projet) => (
        <li key={projet.id} className="border-bordure rounded-2xl border bg-white">
          <button
            type="button"
            onClick={() => setOuvert(ouvert === projet.id ? null : projet.id)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{projet.titre}</span>
              <span className="text-encre-douce text-xs">
                {projet.auteur?.prenom}
                {projet.debut &&
                  ` · ${intervalleEnLettres(projet.debut, projet.fin)} · ${
                    compteARebours(projet.debut, projet.fin).libelle
                  }`}
                {projet.envie && " · elle a dit oh oui 💛"}
              </span>
            </span>
            <span className="text-encre-douce text-xs">{ouvert === projet.id ? "▲" : "▼"}</span>
          </button>

          {ouvert === projet.id && (
            <div className="border-bordure flex flex-col gap-3 border-t p-3">
              <FormulaireProjet projet={projet} />
              <BoutonRetirer
                libelle="Supprimer ce projet"
                avertissement="Le projet et sa photo seront effacés, et il disparaîtra de son application."
                onConfirme={async () => {
                  await supprimerProjet(projet.id);
                  setOuvert(null);
                }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
