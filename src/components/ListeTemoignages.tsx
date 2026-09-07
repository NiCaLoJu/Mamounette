"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { repondreTemoignage } from "@/lib/actions";
import type { TemoignageEnCours } from "@/lib/donnees";

export default function ListeTemoignages({
  temoignages,
  moi,
}: {
  temoignages: TemoignageEnCours[];
  moi: string;
}) {
  if (temoignages.length === 0) {
    return (
      <p className="text-encre-douce text-sm">
        Aucun témoignage en cours. Lance-en un depuis « Déposer ».
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {temoignages.map((temoignage) => (
        <Carte key={temoignage.id} temoignage={temoignage} moi={moi} />
      ))}
    </ul>
  );
}

function Carte({ temoignage, moi }: { temoignage: TemoignageEnCours; moi: string }) {
  const router = useRouter();
  const [texte, setTexte] = useState(
    temoignage.temoignages.find((t) => t.auteur_id === moi)?.texte ?? "",
  );
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <li
      className={`rounded-3xl border p-4 ${
        temoignage.aRepondu ? "border-bordure bg-white" : "border-rose bg-rose-clair"
      }`}
    >
      <p className="titre mb-1 text-lg">{temoignage.question}</p>
      <p className="text-encre-douce mb-3 text-xs">
        Lancé par {temoignage.auteur?.prenom} ·{" "}
        {temoignage.manquants.length === 0
          ? "complet"
          : `on attend ${temoignage.manquants.join(" et ")}`}
      </p>

      {/* Les versions déjà données, visibles entre vous — pas encore chez elle. */}
      {temoignage.temoignages.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {temoignage.temoignages.map((voix) => (
            <li key={voix.id} className="rounded-xl bg-white/70 px-3 py-2 text-sm">
              <span
                className="mr-2 rounded-full px-2 py-0.5 text-[11px] text-white"
                style={{ backgroundColor: voix.auteur?.couleur ?? "#8b7bb8" }}
              >
                {voix.auteur?.prenom}
              </span>
              {voix.texte}
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={3}
        placeholder={temoignage.aRepondu ? "Corrige ta version…" : "Ta version…"}
        className="border-bordure w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
      />

      {erreur && <p className="text-rose mt-2 text-sm">{erreur}</p>}

      <button
        type="button"
        disabled={enCours || !texte.trim()}
        onClick={() =>
          demarrer(async () => {
            try {
              await repondreTemoignage(temoignage.id, texte);
              router.refresh();
            } catch (e) {
              setErreur(e instanceof Error ? e.message : "Impossible d'enregistrer.");
            }
          })
        }
        className="bg-rose mt-2 w-full rounded-full py-2.5 text-sm text-white disabled:opacity-60"
      >
        {enCours ? "On enregistre…" : temoignage.aRepondu ? "Corriger ma version" : "Ajouter ma version"}
      </button>
    </li>
  );
}
