import type { CapsuleAffichee } from "@/lib/donnees";
import { domaine, idYoutube } from "@/lib/liens";

/** Le contenu d'une capsule une fois ouverte, selon son type. */
export default function ContenuCapsule({ capsule }: { capsule: CapsuleAffichee }) {
  const { type, corps, media_url, lien_url, payload } = capsule;

  return (
    <div className="flex flex-col gap-3">
      {type === "photo" && media_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={media_url}
          alt={capsule.titre ?? "Photo de famille"}
          className="w-full rounded-2xl object-cover"
        />
      )}

      {type === "vocal" && media_url && (
        <audio controls preload="metadata" src={media_url} className="w-full" />
      )}

      {type === "video" && media_url && (
        <video controls playsInline preload="metadata" src={media_url} className="w-full rounded-2xl" />
      )}

      {type === "lien" && lien_url && <Lien url={lien_url} />}

      {type === "quiz" && <Quiz payload={payload} />}

      {type === "temoignage" && <Temoignages capsule={capsule} />}

      {corps && <p className="whitespace-pre-wrap leading-relaxed">{corps}</p>}
    </div>
  );
}

function Lien({ url }: { url: string }) {
  const youtube = idYoutube(url);

  if (youtube) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtube}`}
          title="Vidéo"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="border-bordure flex items-center gap-3 rounded-2xl border bg-white p-4 no-underline"
    >
      <span className="text-2xl">🔗</span>
      <span className="flex flex-col">
        <span className="font-medium">Ouvrir</span>
        <span className="text-encre-douce text-xs">{domaine(url)}</span>
      </span>
    </a>
  );
}

function Quiz({ payload }: { payload: Record<string, unknown> }) {
  const question = payload.question as string | undefined;
  const choix = (payload.choix as string[] | undefined) ?? [];
  const reponse = payload.reponse as string | undefined;

  if (!question) return null;

  return (
    <div className="bg-rose-clair rounded-2xl p-4">
      <p className="mb-3 font-medium">{question}</p>
      <ul className="flex flex-col gap-2">
        {choix.map((c) => (
          <li key={c} className="rounded-xl bg-white px-3 py-2 text-sm">
            {c}
          </li>
        ))}
      </ul>
      {reponse && (
        <details className="mt-3">
          <summary className="text-encre-douce cursor-pointer text-sm">La réponse…</summary>
          <p className="mt-2 text-sm">{reponse}</p>
        </details>
      )}
    </div>
  );
}

/**
 * Trois versions de la même histoire, dans un ordre qui ne trahit personne :
 * mélangées à partir de leur identifiant, donc stable d'une visite à l'autre
 * mais sans rapport avec l'ordre dans lequel les garçons ont répondu.
 */
function Temoignages({ capsule }: { capsule: CapsuleAffichee }) {
  const question = capsule.payload?.question as string | undefined;
  const voix = [...(capsule.temoignages ?? [])].sort((a, b) => melange(a.id) - melange(b.id));

  if (!question || voix.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium">{question}</p>
      <p className="text-encre-douce text-sm">
        {voix.length} réponses. À toi de deviner qui a dit quoi.
      </p>

      {voix.map((v, i) => (
        <blockquote key={v.id} className="border-rose border-l-2 bg-white/70 py-2 pl-3 text-sm">
          <span className="text-encre-douce mr-2 text-xs">n° {i + 1}</span>
          <span className="italic">{v.texte}</span>
        </blockquote>
      ))}

      <details>
        <summary className="text-encre-douce cursor-pointer text-sm">Qui est qui ?</summary>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {voix.map((v, i) => (
            <li key={v.id}>
              <span className="text-encre-douce">n° {i + 1} —</span>{" "}
              <strong>{v.auteur?.prenom ?? "?"}</strong>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

/** Un petit brassage déterministe à partir de l'identifiant. */
function melange(id: string): number {
  let valeur = 0;
  for (const caractere of id) valeur = (valeur * 31 + caractere.charCodeAt(0)) % 100_000;
  return valeur;
}
