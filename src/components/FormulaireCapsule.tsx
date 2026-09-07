"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerCapsule, modifierCapsule } from "@/lib/actions";
import { compresser } from "@/lib/image";
import { envoyerFichier } from "@/lib/envoi";
import { LIBELLES_TYPE, EMOJIS_TYPE, type TypeCapsule } from "@/lib/types";
import type { CapsuleAffichee } from "@/lib/donnees";
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

/** Trois cases, pré-remplies quand on modifie une capsule existante. */
function troisChamps(valeurs: unknown): string[] {
  const liste = Array.isArray(valeurs) ? (valeurs as string[]) : [];
  return [liste[0] ?? "", liste[1] ?? "", liste[2] ?? ""];
}

/**
 * Le même formulaire sert au dépôt et à la modification : une capsule qu'on
 * ne peut plus retrouver ni corriger après coup est une capsule perdue.
 */
export default function FormulaireCapsule({
  rendezvous,
  capsule,
  typeInitial,
  rdvInitial,
}: {
  rendezvous: RendezVousOption[];
  capsule?: CapsuleAffichee;
  typeInitial?: TypeCapsule;
  rdvInitial?: string;
}) {
  const router = useRouter();
  const modification = Boolean(capsule);

  const [type, setType] = useState<TypeCapsule>(capsule?.type ?? typeInitial ?? "anecdote");
  const [destination, setDestination] = useState<"reserve" | "rendezvous" | "direct">(
    capsule?.destination ?? (rdvInitial ? "rendezvous" : "reserve"),
  );
  const [fichier, setFichier] = useState<File | null>(null);
  const [duree, setDuree] = useState(capsule?.media_duree ?? 0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [etape, setEtape] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  // Quiz
  const [choix, setChoix] = useState<string[]>(troisChamps(capsule?.payload?.choix));

  function construirePayload(formulaire: FormData): string {
    if (type === "quiz") {
      return JSON.stringify({
        question: formulaire.get("question"),
        choix: choix.filter(Boolean),
        reponse: formulaire.get("reponse"),
      });
    }
    if (type === "temoignage") {
      return JSON.stringify({ question: formulaire.get("question") });
    }
    return "{}";
  }

  async function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);

    const formulaire = new FormData(evenement.currentTarget);
    if (capsule) formulaire.set("id", capsule.id);
    formulaire.set("type", type);
    formulaire.set("destination", destination);
    formulaire.set("payload", construirePayload(formulaire));

    // Le fichier part directement vers le stockage : il ne passe pas par
    // le serveur, qui refuserait tout ce qui dépasse quelques mégaoctets.
    if (fichier) {
      try {
        setEtape("Préparation…");
        const pret = fichier.type.startsWith("image/") ? await compresser(fichier) : fichier;

        setEtape(pret.size > 2_000_000 ? "Envoi du fichier… (ça peut prendre un moment)" : "Envoi…");
        formulaire.set("media_chemin", await envoyerFichier(pret, type));
        formulaire.set("media_duree", String(duree));
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "L'envoi du fichier a échoué.");
        return;
      }
    }

    setEtape("On dépose…");

    demarrer(async () => {
      try {
        if (modification) {
          await modifierCapsule(formulaire);
          router.push("/admin/capsules");
        } else {
          await creerCapsule(formulaire);
          router.push("/admin");
        }
      } catch (e) {
        setEtape(null);
        setErreur(e instanceof Error ? e.message : "Quelque chose a coincé.");
      }
    });
  }

  const champ =
    "border-bordure w-full rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-rose";

  return (
    <form onSubmit={envoyer} className="flex flex-col gap-5">
      {/* Le type */}
      <fieldset disabled={modification} className="disabled:opacity-60">
        <legend className="text-encre-douce mb-2 text-sm">
          {modification ? "Type (non modifiable)" : "Quel genre de capsule ?"}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-sm transition ${
                type === t ? "border-rose bg-rose text-white" : "border-bordure bg-white"
              }`}
            >
              <span className="text-lg">{EMOJIS_TYPE[t]}</span>
              {LIBELLES_TYPE[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-encre-douce text-sm">
          Titre <em>— c'est ce qu'elle lit sur la case fermée</em>
        </span>
        <input
          name="titre"
          required
          maxLength={70}
          defaultValue={capsule?.titre ?? capsule?.teaser ?? ""}
          className={champ}
          placeholder="Le jour où papa a repeint le chat"
        />
      </label>

      {/* Selon le type */}
      {(type === "anecdote" || type === "photo" || type === "vocal" || type === "video" || type === "episode") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">Le mot qui va avec</span>
          <textarea
            name="corps"
            defaultValue={capsule?.corps ?? ""}
            rows={5}
            className={champ}
            placeholder="Raconte…"
          />
        </label>
      )}

      {type === "lien" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">Le lien (YouTube, musique, podcast)</span>
          <input
            name="lien_url"
            type="url"
            defaultValue={capsule?.lien_url ?? ""}
            className={champ}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </label>
      )}

      {/* Le média déjà en place : on le voit avant de décider de le remplacer. */}
      {capsule?.media_url && (
        <div className="border-bordure flex flex-col gap-2 rounded-2xl border bg-white p-4">
          <p className="text-encre-douce text-sm">Fichier actuel</p>
          {capsule.type === "photo" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={capsule.media_url} alt="" className="w-full rounded-xl" />
          )}
          {capsule.type === "vocal" && <audio controls src={capsule.media_url} className="w-full" />}
          {capsule.type === "video" && (
            <video controls playsInline src={capsule.media_url} className="w-full rounded-xl" />
          )}
          <p className="text-encre-douce text-xs">
            Choisis un nouveau fichier ci-dessous pour le remplacer, ou laisse vide pour le garder.
          </p>
        </div>
      )}

      {(type === "photo" || type === "video") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">
            {type === "photo" ? "La photo" : "La micro-vidéo (15 secondes suffisent)"}
          </span>
          <input
            type="file"
            accept={type === "photo" ? "image/*,.heic,.heif" : "video/*,.mov"}
            onChange={(e) => {
              setErreur(null);
              setFichier(e.target.files?.[0] ?? null);
            }}
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
          <input
            name="question"
            defaultValue={(capsule?.payload?.question as string) ?? ""}
            className={champ}
            placeholder="Qui a fait la pire bêtise en 2005 ?"
          />
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
          <input
            name="reponse"
            defaultValue={(capsule?.payload?.reponse as string) ?? ""}
            className={champ}
            placeholder="La réponse (et le fin mot de l'histoire)"
          />
        </div>
      )}

      {type === "temoignage" && (
        <div className="flex flex-col gap-3">
          <input
            name="question"
            required
            defaultValue={(capsule?.payload?.question as string) ?? ""}
            className={champ}
            placeholder="Le pire plat que maman nous ait fait avaler"
          />

          {modification ? (
            <p className="border-bordure rounded-2xl border border-dashed p-4 text-sm">
              Les trois versions se complètent depuis{" "}
              <a href="/admin/temoignages" className="underline">
                Témoignages
              </a>
              .
            </p>
          ) : (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-encre-douce text-sm">Ta version</span>
                <textarea
                  name="ma_reponse"
                  required
                  rows={3}
                  className={champ}
                  placeholder="Raconte la tienne…"
                />
              </label>
              <p className="bg-rose-clair rounded-2xl p-3 text-sm">
                Foufou et Loulou seront prévenus tout de suite. La capsule reste au brouillon
                jusqu'à ce que vous ayez répondu tous les trois — et c'est l'application qui
                mélangera vos réponses.
              </p>
            </>
          )}
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
          <select
            name="rendezvous_id"
            defaultValue={capsule?.rendezvous_id ?? rdvInitial ?? ""}
            className={`${champ} mt-3`}
            required
          >
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

      <div className="bg-fond sticky bottom-0 -mx-4 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
        <button
          type="submit"
          disabled={enCours || etape !== null}
          className="bg-rose w-full rounded-full py-3.5 text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          {etape ?? (modification ? "Enregistrer" : "Déposer")}
        </button>
      </div>
    </form>
  );
}
