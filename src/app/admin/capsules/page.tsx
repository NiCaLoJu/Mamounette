import Link from "next/link";
import { capsulesFiltrees, type FiltreCapsules } from "@/lib/donnees";
import { enCourt } from "@/lib/dates";
import { EMOJIS_TYPE, LIBELLES_TYPE } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTRES: { cle: FiltreCapsules; libelle: string }[] = [
  { cle: "tout", libelle: "Tout" },
  { cle: "reserve", libelle: "La réserve" },
  { cle: "programmees", libelle: "Programmées" },
  { cle: "publiees", libelle: "Chez elle" },
  { cle: "feuilleton", libelle: "Feuilleton" },
];

export default async function Capsules({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const actif = (FILTRES.find((f) => f.cle === filtre)?.cle ?? "tout") as FiltreCapsules;
  const capsules = await capsulesFiltrees(actif);

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="titre mb-1 text-2xl">Toutes les capsules</h1>
        <p className="text-encre-douce text-sm">
          Rien n'est perdu : tout se relit, se corrige, se déplace ou se supprime.
        </p>
      </div>

      <nav className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {FILTRES.map((f) => (
            <li key={f.cle}>
              <Link
                href={f.cle === "tout" ? "/admin/capsules" : `/admin/capsules?filtre=${f.cle}`}
                className={`block whitespace-nowrap rounded-full border px-3 py-1.5 text-sm no-underline ${
                  actif === f.cle ? "border-rose bg-rose text-white" : "border-bordure bg-white"
                }`}
              >
                {f.libelle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {capsules.length === 0 ? (
        <p className="text-encre-douce text-sm">Rien dans cette catégorie.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {capsules.map((capsule) => (
            <li key={capsule.id}>
              <Link
                href={`/admin/capsules/${capsule.id}`}
                className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 no-underline"
              >
                <span className="text-xl">{EMOJIS_TYPE[capsule.type]}</span>

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {capsule.titre ?? capsule.teaser ?? `${LIBELLES_TYPE[capsule.type]} sans titre`}
                  </span>
                  <span className="text-encre-douce text-xs">
                    {capsule.auteur?.prenom} · {enCourt(capsule.cree_le.slice(0, 10))}
                    {capsule.ouverte_le && " · ouverte ✓"}
                  </span>
                </span>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                    capsule.etat === "publiee"
                      ? "bg-rose-clair"
                      : capsule.destination === "reserve"
                        ? "border-bordure border border-dashed"
                        : "bg-or/20"
                  }`}
                >
                  {capsule.etat === "publiee"
                    ? "chez elle"
                    : capsule.destination === "reserve"
                      ? "réserve"
                      : "programmée"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
