"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BoutonRetirer from "./BoutonRetirer";
import { honorerBon, modifierBon, rouvrirBon, supprimerBon } from "@/lib/actions";
import type { Bon } from "@/lib/types";
import type { Auteur } from "@/lib/donnees";

type BonAdmin = Bon & { auteur: Auteur | null };

const ETATS = {
  disponible: "disponible",
  reclame: "⚡ réclamé — à honorer",
  honore: "fait ✓",
} as const;

export default function ListeBonsAdmin({ bons }: { bons: BonAdmin[] }) {
  const [ouvert, setOuvert] = useState<string | null>(null);

  if (bons.length === 0) {
    return <p className="text-encre-douce text-sm">Aucun bon pour l'instant.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {bons.map((bon) => (
        <li key={bon.id} className="border-bordure rounded-2xl border bg-white">
          <button
            type="button"
            onClick={() => setOuvert(ouvert === bon.id ? null : bon.id)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{bon.titre}</span>
              <span className="text-encre-douce text-xs">
                {bon.auteur?.prenom} · {ETATS[bon.etat]}
              </span>
            </span>
            <span className="text-encre-douce text-xs">{ouvert === bon.id ? "▲" : "▼"}</span>
          </button>

          {ouvert === bon.id && <Edition bon={bon} onFerme={() => setOuvert(null)} />}
        </li>
      ))}
    </ul>
  );
}

function Edition({ bon, onFerme }: { bon: BonAdmin; onFerme: () => void }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const champ = "border-bordure w-full rounded-2xl border px-3 py-2.5 text-sm";

  return (
    <div className="border-bordure flex flex-col gap-3 border-t p-3">
      <form
        onSubmit={(evenement) => {
          evenement.preventDefault();
          const formulaire = new FormData(evenement.currentTarget);
          formulaire.set("id", bon.id);

          demarrer(async () => {
            try {
              await modifierBon(formulaire);
              router.refresh();
            } catch (e) {
              setErreur(e instanceof Error ? e.message : "Impossible d'enregistrer.");
            }
          });
        }}
        className="flex flex-col gap-3"
      >
        <input name="titre" required defaultValue={bon.titre} className={champ} />
        <input
          name="description"
          defaultValue={bon.description ?? ""}
          placeholder="Détail (facultatif)"
          className={champ}
        />

        {erreur && <p className="text-rose text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="bg-rose rounded-full py-2.5 text-sm text-white disabled:opacity-60"
        >
          {enCours ? "On enregistre…" : "Enregistrer"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        {bon.etat === "reclame" && (
          <button
            type="button"
            onClick={() => demarrer(() => honorerBon(bon.id).then(() => router.refresh()))}
            className="bg-rose-clair rounded-full px-4 py-2 text-sm"
          >
            C'est fait
          </button>
        )}

        {bon.etat !== "disponible" && (
          <button
            type="button"
            onClick={() => demarrer(() => rouvrirBon(bon.id).then(() => router.refresh()))}
            className="text-encre-douce text-sm underline"
          >
            Le remettre en jeu
          </button>
        )}

        <BoutonRetirer
          libelle="Supprimer ce bon"
          avertissement="Le bon sera effacé et disparaîtra de son application."
          onConfirme={async () => {
            await supprimerBon(bon.id);
            onFerme();
          }}
        />
      </div>
    </div>
  );
}
