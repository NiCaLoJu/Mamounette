import EnteteSection from "@/components/EnteteSection";
import ListeBonsAdmin from "@/components/ListeBonsAdmin";
import { creerBon } from "@/lib/actions";
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

      <ListeBonsAdmin bons={liste} />
    </main>
  );
}
