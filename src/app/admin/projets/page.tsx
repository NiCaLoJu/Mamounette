import { creerProjet } from "@/lib/actions";
import { projets } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function ProjetsAdmin() {
  const liste = await projets();

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="titre mb-1 text-2xl">La boîte à projets</h1>
        <p className="text-encre-douce text-sm">
          Ne déposez pas qu'une idée : une photo du gîte, la carte du resto. Le futur devient
          concret.
        </p>
      </div>

      <form
        action={creerProjet}
        className="border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-4"
      >
        <input
          name="titre"
          required
          placeholder="Un week-end tous ensemble en Bretagne"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <textarea
          name="description"
          rows={3}
          placeholder="Ce qu'on ferait…"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <input
          type="file"
          name="media"
          accept="image/*"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <button type="submit" className="bg-rose rounded-full py-2.5 text-sm text-white">
          Ajouter le projet
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {liste.map((projet) => (
          <li
            key={projet.id}
            className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5"
          >
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{projet.titre}</span>
              <span className="text-encre-douce text-xs">
                {projet.auteur?.prenom}
                {projet.envie && " · elle a dit oh oui 💛"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
