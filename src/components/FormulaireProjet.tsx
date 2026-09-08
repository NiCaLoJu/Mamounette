"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerProjet } from "@/lib/actions";
import { compresser } from "@/lib/image";
import { envoyerFichier } from "@/lib/envoi";

/** Une idée pour plus tard — avec une photo, ça devient concret. */
export default function FormulaireProjet() {
  const router = useRouter();
  const [fichier, setFichier] = useState<File | null>(null);
  const [etape, setEtape] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const champ = "border-bordure w-full rounded-2xl border px-3 py-2.5 text-sm";

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);

    const formulaire = new FormData(evenement.currentTarget);

    if (fichier) {
      try {
        setEtape("Envoi de la photo…");
        formulaire.set("media_chemin", await envoyerFichier(await compresser(fichier), "projets"));
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "L'envoi de la photo a échoué.");
        return;
      }
    }

    setEtape("On ajoute…");

    demarrer(async () => {
      try {
        await creerProjet(formulaire);
        setEtape(null);
        setFichier(null);
        router.refresh();
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "Quelque chose a coincé.");
      }
    });
  }

  return (
    <form
      onSubmit={envoyer}
      className="border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-4"
    >
      <input
        name="titre"
        required
        placeholder="Un week-end tous ensemble en Bretagne"
        className={champ}
      />
      <textarea name="description" rows={3} placeholder="Ce qu'on ferait…" className={champ} />

      {/* Une date transforme une envie en cap : elle verra le compte à rebours. */}
      <fieldset className="border-bordure rounded-2xl border p-3">
        <legend className="text-encre-douce px-1 text-sm">
          Une date ? <em>— facultatif, mais c'est ce qui fait le compte à rebours</em>
        </legend>
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-encre-douce w-14 shrink-0">Du</span>
            <input type="date" name="debut" className={champ} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-encre-douce w-14 shrink-0">Au</span>
            <input type="date" name="fin" className={champ} />
          </label>
          <p className="text-encre-douce text-xs">
            Laisse « Au » vide pour une seule journée.
          </p>
        </div>
      </fieldset>
      <input
        type="file"
        accept="image/*,.heic,.heif"
        onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
        className={champ}
      />

      {erreur && <p className="text-rose text-sm">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours || etape !== null}
        className="bg-rose rounded-full py-2.5 text-sm text-white disabled:opacity-60"
      >
        {etape ?? "Ajouter le projet"}
      </button>
    </form>
  );
}
