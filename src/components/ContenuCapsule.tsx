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

      {type === "temoignage" && <Temoignages payload={payload} />}

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

function Temoignages({ payload }: { payload: Record<string, unknown> }) {
  const question = payload.question as string | undefined;
  const reponses = (payload.reponses as string[] | undefined) ?? [];
  const solution = payload.solution as string | undefined;

  if (!question) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium">{question}</p>
      <p className="text-encre-douce text-sm">Trois réponses. À toi de deviner qui a dit quoi.</p>
      {reponses.map((r, i) => (
        <blockquote
          key={i}
          className="border-rose border-l-2 bg-white/70 py-2 pl-3 text-sm italic"
        >
          {r}
        </blockquote>
      ))}
      {solution && (
        <details>
          <summary className="text-encre-douce cursor-pointer text-sm">Qui est qui ?</summary>
          <p className="mt-2 text-sm">{solution}</p>
        </details>
      )}
    </div>
  );
}
