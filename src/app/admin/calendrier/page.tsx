import { creerRendezVous, supprimerRendezVous } from "@/lib/actions";
import { frise, membres } from "@/lib/donnees";
import { aujourdhui, ecartJours, enLettres } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function Calendrier() {
  const [dates, gens] = await Promise.all([frise(), membres()]);
  const enfants = gens.filter((g) => g.role === "enfant");
  const jour = aujourdhui();

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="titre mb-1 text-2xl">Les dates</h1>
        <p className="text-encre-douce text-sm">
          Elles ne servent qu'ici : elles disent à l'app quel jour ouvrir une journée. Elle ne voit
          jamais cette page.
        </p>
      </div>

      <form
        action={creerRendezVous}
        className="border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">Ajouter une date</span>
          <input
            type="date"
            name="date"
            required
            className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-encre-douce text-sm">
            Référent — celui qui garantit le minimum ce jour-là
          </span>
          <select name="referent_id" className="border-bordure rounded-2xl border px-3 py-2.5 text-sm">
            <option value="">Personne pour l'instant</option>
            {enfants.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="bg-rose rounded-full py-2.5 text-sm text-white">
          Ajouter
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {dates.map((date) => {
          const passee = ecartJours(jour, date.date) < 0;
          return (
            <li
              key={date.id}
              className={`border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 ${
                passee ? "opacity-50" : ""
              }`}
            >
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium capitalize">{enLettres(date.date)}</span>
                <span className="text-encre-douce text-xs">
                  {date.capsules} capsule{date.capsules > 1 ? "s" : ""}
                </span>
              </span>

              <form action={supprimerRendezVous.bind(null, date.id)}>
                <button type="submit" className="text-encre-douce text-xs underline">
                  retirer
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
