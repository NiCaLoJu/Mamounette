"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ecrire } from "@/lib/actions";
import { envoyerFichier } from "@/lib/envoi";
import EnregistreurVocal from "./EnregistreurVocal";

/**
 * De quoi répondre : quelques mots, ou sa voix. Sans obligation ni relance —
 * le bouton d'écriture reste discret tant qu'on ne l'ouvre pas.
 */
export default function Composeur({
  capsuleId,
  placeholder = "Écris-leur un mot…",
  compact = false,
}: {
  capsuleId?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(!compact);
  const [texte, setTexte] = useState("");
  const [vocal, setVocal] = useState<{ fichier: File; duree: number } | null>(null);
  const [micro, setMicro] = useState(false);
  const [etape, setEtape] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-encre-douce text-sm underline"
      >
        ✍️ Répondre
      </button>
    );
  }

  async function envoyer() {
    setErreur(null);
    const formulaire = new FormData();
    if (capsuleId) formulaire.set("capsule_id", capsuleId);
    formulaire.set("texte", texte);

    if (vocal) {
      try {
        setEtape("Envoi du vocal…");
        formulaire.set("media_chemin", await envoyerFichier(vocal.fichier, "messages"));
        formulaire.set("media_duree", String(vocal.duree));
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "L'envoi a échoué.");
        return;
      }
    }

    setEtape("On envoie…");

    demarrer(async () => {
      try {
        await ecrire(formulaire);
        setTexte("");
        setVocal(null);
        setMicro(false);
        setEtape(null);
        if (compact) setOuvert(false);
        router.refresh();
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "Le message n'est pas parti.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className="border-bordure w-full rounded-2xl border bg-white px-3 py-2.5 text-sm"
      />

      {micro ? (
        <EnregistreurVocal
          onEnregistre={(fichier, duree) => setVocal({ fichier, duree })}
        />
      ) : (
        <button
          type="button"
          onClick={() => setMicro(true)}
          className="text-encre-douce self-start text-sm underline"
        >
          🎙️ Ou enregistrer ma voix
        </button>
      )}

      {erreur && <p className="text-rose text-sm">{erreur}</p>}

      <button
        type="button"
        onClick={envoyer}
        disabled={enCours || etape !== null || (!texte.trim() && !vocal)}
        className="bg-rose rounded-full py-2.5 text-sm text-white disabled:opacity-40"
      >
        {etape ?? "Envoyer"}
      </button>
    </div>
  );
}
