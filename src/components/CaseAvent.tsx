"use client";

import { useState, useTransition } from "react";
import { ouvrirCapsule, reagir } from "@/lib/actions";
import type { CapsuleAffichee } from "@/lib/donnees";
import { EMOJIS_TYPE } from "@/lib/types";
import { avecAlpha } from "@/lib/couleur";
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

  const couleur = capsule.auteur?.couleur ?? "#c96f8b";

  if (!ouverte) {
    return (
      <button
        onClick={ouvrir}
        style={{
          background: `linear-gradient(160deg, ${avecAlpha(couleur, 0.16)}, ${avecAlpha(couleur, 0.05)})`,
          borderColor: avecAlpha(couleur, 0.35),
        }}
        className="relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-3xl border p-4 text-center shadow-sm transition active:scale-[0.97]"
      >
        {capsule.auteur && (
          <span
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium text-white"
            style={{ backgroundColor: couleur }}
          >
            {capsule.auteur.prenom.charAt(0)}
          </span>
        )}

        <span className="text-3xl">{EMOJIS_TYPE[capsule.type]}</span>
        <span className="text-sm leading-snug" style={{ color: couleur }}>
          {/* `teaser` ne sert plus qu'aux quelques capsules d'avant. */}
          {capsule.titre ?? capsule.teaser ?? "Une surprise"}
        </span>
      </button>
    );
  }

  return (
    <article
      style={{ borderTopColor: couleur }}
      className="eclot border-bordure col-span-2 flex flex-col gap-3 rounded-3xl border border-t-4 bg-white p-4 shadow-sm"
    >
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="titre text-lg">{capsule.titre ?? "Pour toi"}</h3>
        {capsule.auteur && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs text-white"
            style={{ backgroundColor: couleur }}
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

      <div className="border-bordure mt-1 flex items-center justify-between border-t pt-3">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              setReaction(emoji);
              demarrer(() => {
                void reagir(capsule.id, emoji);
              });
            }}
            className={`min-h-11 min-w-11 rounded-full text-2xl transition active:scale-90 ${
              reaction === emoji ? "bg-rose-clair bat" : "opacity-45"
            }`}
            aria-label={`Réagir avec ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <Composeur capsuleId={capsule.id} placeholder="Un mot en retour…" compact />
    </article>
  );
}
