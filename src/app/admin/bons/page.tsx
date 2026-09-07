import EnteteSection from "@/components/EnteteSection";
import { creerBon, honorerBon } from "@/lib/actions";
import { bons } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function BonsAdmin() {
  const liste = await bons();

  return (
    <main className="flex flex-col gap-6">
      <EnteteSection
        emoji="🎟️"
        titre="Les bons pour…"
        description="Un vrai coupon : elle le réclame, vous êtes prévenus, vous le marquez fait."
        teinte="corail"
      />

      <form
        action={creerBon}
        className="border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-4"
      >
        <input
          name="titre"
          required
          placeholder="Bon pour un bon petit plat maison"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <input
          name="description"
          placeholder="Détail (facultatif)"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <button type="submit" className="bg-rose rounded-full py-2.5 text-sm text-white">
          Créer le bon
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {liste.map((bon) => (
          <li
            key={bon.id}
            className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5"
          >
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{bon.titre}</span>
              <span className="text-encre-douce text-xs">
                {bon.auteur?.prenom} ·{" "}
                {bon.etat === "disponible"
                  ? "disponible"
                  : bon.etat === "reclame"
                    ? "⚡ réclamé — à honorer"
                    : "fait ✓"}
              </span>
            </span>

            {bon.etat === "reclame" && (
              <form action={honorerBon.bind(null, bon.id)}>
                <button type="submit" className="bg-rose-clair rounded-full px-3 py-1.5 text-xs">
                  C'est fait
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
