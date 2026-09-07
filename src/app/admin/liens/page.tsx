import EnteteSection from "@/components/EnteteSection";
import { membres } from "@/lib/donnees";

export const dynamic = "force-dynamic";

/**
 * Les liens secrets. À ouvrir une seule fois sur chaque téléphone —
 * l'appareil s'en souvient ensuite.
 */
export default async function Liens() {
  const gens = await membres();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <main className="flex flex-col gap-6">
      <EnteteSection
        emoji="🔑"
        titre="Les liens d'accès"
        description="Un lien par personne, à ouvrir une fois sur son téléphone. Ne les partagez nulle part ailleurs : c'est la seule clé de l'application."
        teinte="brume"
      />

      <ul className="flex flex-col gap-3">
        {gens.map((g) => (
          <li key={g.id} className="border-bordure rounded-2xl border bg-white p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-medium">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: g.couleur }}
              />
              {g.prenom}
              <span className="text-encre-douce text-xs">
                {g.role === "maman" ? "· son application" : "· accès admin"}
              </span>
            </p>
            <code className="text-encre-douce block break-all text-xs">
              {base}/entree/{g.token}
            </code>
          </li>
        ))}
      </ul>
    </main>
  );
}
