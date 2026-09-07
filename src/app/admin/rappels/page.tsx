import { annulerRappel, programmerRappel } from "@/lib/actions";
import { membres, rappelsAVenir } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function Rappels() {
  const [gens, aVenir] = await Promise.all([membres(), rappelsAVenir()]);
  const maman = gens.find((g) => g.role === "maman");

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="titre mb-1 text-2xl">Rappels programmés</h1>
        <p className="text-encre-douce text-sm">
          Un mot qui arrive un mardi soir sans raison. Attention quand même : une seule notification
          par jour lui parvient, c'est volontaire.
        </p>
      </div>

      <form
        action={programmerRappel}
        className="border-bordure flex flex-col gap-3 rounded-3xl border bg-white p-4"
      >
        <select
          name="membre_id"
          defaultValue={maman?.id ?? ""}
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        >
          {gens.map((g) => (
            <option key={g.id} value={g.id}>
              Pour {g.prenom}
            </option>
          ))}
          <option value="">Pour nous trois</option>
        </select>

        <input
          name="titre"
          required
          placeholder="On pense à toi 💛"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <input
          name="corps"
          placeholder="Le petit texte en dessous"
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />
        <input
          type="datetime-local"
          name="envoyer_le"
          required
          className="border-bordure rounded-2xl border px-3 py-2.5 text-sm"
        />

        <button type="submit" className="bg-rose rounded-full py-2.5 text-sm text-white">
          Programmer
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {aVenir.length === 0 && (
          <p className="text-encre-douce text-sm">Aucun rappel en attente.</p>
        )}
        {aVenir.map((rappel) => (
          <li
            key={rappel.id}
            className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5"
          >
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{rappel.titre}</span>
              <span className="text-encre-douce text-xs">
                {new Date(rappel.envoyer_le).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Europe/Paris",
                })}
                {rappel.destinataire && ` · ${rappel.destinataire.prenom}`}
              </span>
            </span>

            <form action={annulerRappel.bind(null, rappel.id)}>
              <button type="submit" className="text-encre-douce text-xs underline">
                annuler
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
