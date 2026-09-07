"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerCapsule } from "@/lib/actions";
import { compresser } from "@/lib/image";
import { LIBELLES_TYPE, EMOJIS_TYPE, type TypeCapsule } from "@/lib/types";
import EnregistreurVocal from "./EnregistreurVocal";

const TYPES: TypeCapsule[] = [
  "anecdote",
  "photo",
  "vocal",
  "video",
  "lien",
  "quiz",
  "temoignage",
  "episode",
];

type RendezVousOption = { id: string; date: string; libelle: string };

export default function FormulaireCapsule({ rendezvous }: { rendezvous: RendezVousOption[] }) {
  const router = useRouter();
  const [type, setType] = useState<TypeCapsule>("anecdote");
  const [destination, setDestination] = useState<"reserve" | "rendezvous" | "direct">("reserve");
  const [fichier, setFichier] = useState<File | null>(null);
  const [duree, setDuree] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  // Quiz
  const [choix, setChoix] = useState<string[]>(["", "", ""]);
  // Triple témoignage
  const [reponses, setReponses] = useState<string[]>(["", "", ""]);

  function construirePayload(formulaire: FormData): string {
    if (type === "quiz") {
      return JSON.stringify({
        question: formulaire.get("question"),
        choix: choix.filter(Boolean),
        reponse: formulaire.get("reponse"),
      });
    }
    if (type === "temoignage") {
      return JSON.stringify({
        question: formulaire.get("question"),
        reponses: reponses.filter(Boolean),
        solution: formulaire.get("solution"),
      });
    }
    return "{}";
  }

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);

    const formulaire = new FormData(evenement.currentTarget);
    formulaire.set("type", type);
    formulaire.set("destination", destination);
    formulaire.set("payload", construirePayload(formulaire));

    if (fichier) {
      const pret = fichier.type.startsWith("image/") ? await compresser(fichier) : fichier;
      formulaire.set("media", pret);
      formulaire.set("media_duree", String(duree));
    } else {
      formulaire.delete("media");
    }

    demarrer(async () => {
      try {
        await creerCapsule(formulaire);
        router.push("/admin");
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Quelque chose a coincé.");
      }
    });
  }

  const champ =
    "border-bordure w-full rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-rose";

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-5">
      {/* Le type */}
      <fieldset>
        <legend className="text-encre-douce mb-2 text-sm">Quel genre de capsule ?</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                type === t
                  ? "border-rose bg-rose text-white"
                  : "border-bordure bg-white"
              }`}
            >
              {EMOJIS_TYPE[t]} {LIBELLES_TYPE[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-encre-douce text-sm">Titre</span>
        <input name="titre" className={champ} placeholder="Le jour où papa a repeint le chat" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-encre-douce text-sm">
          L'étiquette sur la case fermée <em>— ce qu'elle lit avant d'ouvrir</em>
        </span>
        <input name="teaser" className={champ} placeholder="Une bêtise de 2005" maxLength={60} />
      </label>

      {/* Selon le type */}
      {(type === "anecdote" || type === "photo" || type === "vocal" || type === "video" || type === "episode") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">Le mot qui va avec</span>
          <textarea name="corps" rows={5} className={champ} placeholder="Raconte…" />
        </label>
      )}

      {type === "lien" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">Le lien (YouTube, musique, podcast)</span>
          <input
            name="lien_url"
            type="url"
            className={champ}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </label>
      )}

      {(type === "photo" || type === "video") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">
            {type === "photo" ? "La photo" : "La micro-vidéo (15 secondes suffisent)"}
          </span>
          <input
            type="file"
            accept={type === "photo" ? "image/*" : "video/*"}
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
            className={champ}
          />
        </label>
      )}

      {type === "vocal" && (
        <EnregistreurVocal
          onEnregistre={(f, d) => {
            setFichier(f);
            setDuree(d);
          }}
        />
      )}

      {type === "quiz" && (
        <div className="flex flex-col gap-3">
          <input name="question" className={champ} placeholder="Qui a fait la pire bêtise en 2005 ?" />
          {choix.map((valeur, i) => (
            <input
              key={i}
              value={valeur}
              onChange={(e) => {
                const copie = [...choix];
                copie[i] = e.target.value;
                setChoix(copie);
              }}
              className={champ}
              placeholder={`Proposition ${i + 1}`}
            />
          ))}
          <input name="reponse" className={champ} placeholder="La réponse (et le fin mot de l'histoire)" />
        </div>
      )}

      {type === "temoignage" && (
        <div className="flex flex-col gap-3">
          <input
            name="question"
            className={champ}
            placeholder="Le pire plat que maman nous ait fait avaler"
          />
          {reponses.map((valeur, i) => (
            <textarea
              key={i}
              value={valeur}
              onChange={(e) => {
                const copie = [...reponses];
                copie[i] = e.target.value;
                setReponses(copie);
              }}
              rows={2}
              className={champ}
              placeholder={`Réponse anonyme ${i + 1}`}
            />
          ))}
          <input name="solution" className={champ} placeholder="Qui est qui (elle le découvre après)" />
        </div>
      )}

      {/* La destination */}
      <fieldset className="border-bordure rounded-2xl border bg-white p-4">
        <legend className="px-1 text-sm">Pour quand ?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {(
            [
              ["reserve", "🫙 La réserve", "Sans date. Alimente la pioche et sauve les jours vides."],
              ["rendezvous", "📅 Une date précise", "S'ouvrira le jour dit."],
              ["direct", "⚡ Tout de suite", "Elle est prévenue dans la minute."],
            ] as const
          ).map(([valeur, libelle, aide]) => (
            <label key={valeur} className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name="dest"
                checked={destination === valeur}
                onChange={() => setDestination(valeur)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{libelle}</span>
                <span className="text-encre-douce block text-xs">{aide}</span>
              </span>
            </label>
          ))}
        </div>

        {destination === "rendezvous" && (
          <select name="rendezvous_id" className={`${champ} mt-3`} required>
            {rendezvous.length === 0 && <option value="">Aucune date enregistrée</option>}
            {rendezvous.map((r) => (
              <option key={r.id} value={r.id}>
                {r.libelle}
              </option>
            ))}
          </select>
        )}
      </fieldset>

      {erreur && <p className="text-rose text-sm">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="bg-rose rounded-full py-3 text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {enCours ? "On dépose…" : "Déposer"}
      </button>
    </form>
  );
}
