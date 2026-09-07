"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supprimerCapsule } from "@/lib/actions";

/** Suppression définitive — on demande confirmation, le fichier part avec. */
export default function BoutonSupprimer({ id }: { id: string }) {
  const router = useRouter();
  const [confirme, setConfirme] = useState(false);
  const [enCours, demarrer] = useTransition();

  if (!confirme) {
    return (
      <button
        type="button"
        onClick={() => setConfirme(true)}
        className="text-encre-douce w-full py-3 text-sm underline"
      >
        Supprimer cette capsule
      </button>
    );
  }

  return (
    <div className="border-bordure flex flex-col gap-2 rounded-2xl border border-dashed p-4">
      <p className="text-sm">
        Elle sera effacée définitivement, avec son fichier. C'est sans retour.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            demarrer(async () => {
              await supprimerCapsule(id);
              router.push("/admin/capsules");
            })
          }
          disabled={enCours}
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
