"use client";

import { useState, useTransition } from "react";
import { piocher, reagir } from "@/lib/actions";
import type { CapsuleAffichee } from "@/lib/donnees";
import ContenuCapsule from "./ContenuCapsule";
import Composeur from "./Composeur";

const EMOJIS = ["❤️", "😂", "🥹", "😍", "🤩"];

/** Un bouton, n'importe quel jour : une surprise au hasard dans la réserve. */
export default function Pioche({ restantes }: { restantes: number }) {
  const [tiree, setTiree] = useState<CapsuleAffichee | null>(null);
  const [vide, setVide] = useState(restantes === 0);
  const [enCours, demarrer] = useTransition();

  function tirer() {
    demarrer(async () => {
      const capsule = await piocher();
      if (capsule) setTiree(capsule);
      else setVide(true);
    });
  }

  if (tiree) {
    return (
      <article className="eclot border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-5 shadow-sm">
        <header className="flex items-baseline justify-between gap-2">
          <h2 className="titre text-xl">{tiree.titre ?? "Pour toi"}</h2>
          {tiree.auteur && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
              style={{ backgroundColor: tiree.auteur.couleur }}
            >
              {tiree.auteur.prenom}
            </span>
          )}
        </header>

        <ContenuCapsule capsule={tiree} />

        <div className="border-bordure flex items-center gap-1 border-t pt-3">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => reagir(tiree.id, emoji)}
              className="rounded-full px-2 py-1 text-xl opacity-60 transition active:scale-90"
              aria-label={`Réagir avec ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <Composeur capsuleId={tiree.id} placeholder="Un mot en retour…" compact />

        <button
          onClick={() => {
            setTiree(null);
            tirer();
          }}
          className="text-encre-douce mt-1 text-sm underline"
        >
          En piocher une autre
        </button>
      </article>
    );
  }

  if (vide) {
    return (
      <div className="border-bordure rounded-3xl border border-dashed p-8 text-center">
        <p className="mb-2 text-4xl">🫙</p>
        <p className="text-encre-douce text-sm">
          La boîte est vide pour le moment. Tes garçons vont la remplir.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={tirer}
      disabled={enCours}
      className="bg-rose flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-3xl p-8 text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
    >
      <span className="text-5xl">{enCours ? "✨" : "🎁"}</span>
      <span className="titre text-xl">{enCours ? "On regarde…" : "Pioche une surprise"}</span>
      <span className="text-sm opacity-80">
        {restantes} surprise{restantes > 1 ? "s" : ""} dans la boîte
      </span>
    </button>
  );
}
