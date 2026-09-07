import { frise, capsulesOuvertes } from "@/lib/donnees";
import { aujourdhui, ecartJours, enCourt } from "@/lib/dates";
import { EMOJIS_TYPE } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Chemin() {
  const [etapes, ouvertes] = await Promise.all([frise(), capsulesOuvertes(60)]);
  const jour = aujourdhui();
  const franchies = etapes.filter((e) => ecartJours(jour, e.date) <= 0).length;

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <h1 className="titre text-3xl">Le chemin</h1>
        <p className="text-encre-douce mt-1 text-sm">
          {franchies > 0
            ? `${franchies} étape${franchies > 1 ? "s" : ""} déjà derrière toi.`
            : "Chaque étape laissera une trace ici."}
        </p>
      </header>

      <ol className="mb-10 flex flex-wrap gap-2">
        {etapes.map((etape) => {
          const passee = ecartJours(jour, etape.date) <= 0;
          return (
            <li
              key={etape.id}
              title={enCourt(etape.date)}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm ${
                passee
                  ? "bg-or font-medium text-white shadow-sm"
                  : "border-bordure text-encre-douce border border-dashed"
              }`}
            >
              {passee ? "★" : "·"}
            </li>
          );
        })}
      </ol>

      <h2 className="titre mb-3 text-xl">Ta collection</h2>
      {ouvertes.length === 0 ? (
        <p className="text-encre-douce text-sm">
          Tout ce que tu ouvriras se rangera ici, pour y revenir quand tu veux.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ouvertes.map((capsule) => (
            <li
              key={capsule.id}
              className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2"
            >
              <span className="text-xl">{EMOJIS_TYPE[capsule.type]}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {capsule.titre ?? capsule.teaser ?? "Une surprise"}
                </span>
                <span className="text-encre-douce text-xs">
                  {capsule.auteur?.prenom}
                  {capsule.ouverte_le && ` · ${enCourt(capsule.ouverte_le.slice(0, 10))}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
