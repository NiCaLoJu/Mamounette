"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Suppression avec confirmation, réutilisée par les projets et les bons. */
export default function BoutonRetirer({
  onConfirme,
  avertissement,
  libelle = "Supprimer",
}: {
  onConfirme: () => Promise<void>;
  avertissement: string;
  libelle?: string;
}) {
  const router = useRouter();
  const [confirme, setConfirme] = useState(false);
  const [enCours, demarrer] = useTransition();

  if (!confirme) {
    return (
      <button
        type="button"
        onClick={() => setConfirme(true)}
        className="text-encre-douce text-sm underline"
      >
        {libelle}
      </button>
    );
  }

  return (
    <div className="border-bordure flex flex-col gap-2 rounded-2xl border border-dashed p-3">
      <p className="text-sm">{avertissement}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={enCours}
          onClick={() =>
            demarrer(async () => {
              await onConfirme();
              router.refresh();
            })
          }
          className="bg-encre flex-1 rounded-full py-2 text-sm text-white disabled:opacity-60"
        >
          {enCours ? "Suppression…" : "Oui, supprimer"}
        </button>
        <button
          type="button"
          onClick={() => setConfirme(false)}
          className="border-bordure flex-1 rounded-full border py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
