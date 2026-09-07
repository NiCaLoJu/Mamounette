"use client";

import { useState, useTransition } from "react";
import { ouvrirCapsule, reagir } from "@/lib/actions";
import type { CapsuleAffichee } from "@/lib/donnees";
import { EMOJIS_TYPE } from "@/lib/types";
import ContenuCapsule from "./ContenuCapsule";
import Composeur from "./Composeur";
import FilMessages from "./FilMessages";

const EMOJIS = ["❤️", "😂", "🥹", "😍", "🤩"];

/**
 * Une case fermée avec son étiquette de teasing. Elle ouvre à son rythme.
 */
export default function CaseAvent({
  capsule,
  moi,
}: {
  capsule: CapsuleAffichee;
  moi: string;
}) {
  const [ouverte, setOuverte] = useState(Boolean(capsule.ouverte_le));
  const [reaction, setReaction] = useState<string | null>(
    capsule.reactions?.[0]?.emoji ?? null,
  );
  const [, demarrer] = useTransition();

  function ouvrir() {
    setOuverte(true);
    demarrer(() => {
      void ouvrirCapsule(capsule.id);
    });
  }

  if (!ouverte) {
    return (
      <button
        onClick={ouvrir}
        className="border-bordure flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border bg-white p-4 text-center shadow-sm transition active:scale-[0.97]"
      >
        <span className="text-3xl">{EMOJIS_TYPE[capsule.type]}</span>
        <span className="text-encre-douce text-sm leading-snug">
          {capsule.teaser ?? "Une surprise"}
        </span>
      </button>
    );
  }

  return (
    <article className="eclot border-bordure col-span-2 flex flex-col gap-3 rounded-3xl border bg-white p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="titre text-lg">{capsule.titre ?? "Pour toi"}</h3>
        {capsule.auteur && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
            style={{ backgroundColor: capsule.auteur.couleur }}
          >
            {capsule.auteur.prenom}
          </span>
        )}
      </header>

      <ContenuCapsule capsule={capsule} />

      {capsule.messages?.length > 0 && (
        <div className="border-bordure border-t pt-3">
          <FilMessages messages={capsule.messages} moi={moi} />
        </div>
      )}

      <div className="border-bordure mt-1 flex items-center gap-1 border-t pt-3">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              setReaction(emoji);
              demarrer(() => {
                void reagir(capsule.id, emoji);
              });
            }}
            className={`rounded-full px-2 py-1 text-xl transition active:scale-90 ${
              reaction === emoji ? "bg-rose-clair" : "opacity-50"
            }`}
            aria-label={`Réagir avec ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <span className="ml-auto">
          <Composeur capsuleId={capsule.id} placeholder="Un mot en retour…" compact />
        </span>
      </div>
    </article>
  );
}
