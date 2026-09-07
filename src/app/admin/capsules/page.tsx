import Link from "next/link";
import EnteteSection from "@/components/EnteteSection";
import { TEINTES } from "@/lib/sections";
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
      <EnteteSection
        emoji="🗂️"
        titre="Toutes les capsules"
        description="Rien n'est perdu : tout se relit, se corrige, se déplace ou se supprime."
        teinte="lilas"
      />

      <nav className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {FILTRES.map((f) => (
            <li key={f.cle}>
              <Link
                href={f.cle === "tout" ? "/admin/capsules" : `/admin/capsules?filtre=${f.cle}`}
                style={
                  actif === f.cle
                    ? { backgroundColor: TEINTES.lilas.encre, borderColor: TEINTES.lilas.encre }
                    : { backgroundColor: TEINTES.lilas.fond, borderColor: TEINTES.lilas.bordure, color: TEINTES.lilas.encre }
                }
                className={`flex min-h-10 items-center whitespace-nowrap rounded-2xl border px-3 text-sm no-underline ${
                  actif === f.cle ? "font-medium text-white" : ""
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
                  style={
                    capsule.etat === "publiee"
                      ? { backgroundColor: TEINTES.menthe.fond, color: TEINTES.menthe.encre }
                      : capsule.destination === "reserve"
                        ? { backgroundColor: TEINTES.lilas.fond, color: TEINTES.lilas.encre }
                        : { backgroundColor: TEINTES.sable.fond, color: TEINTES.sable.encre }
                  }
                  className="shrink-0 rounded-full px-2 py-1 text-[11px]"
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
