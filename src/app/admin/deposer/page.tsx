import FormulaireCapsule from "@/components/FormulaireCapsule";
import { prochainsRendezVous } from "@/lib/donnees";
import { enLettres } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function Deposer() {
  const rdvs = await prochainsRendezVous(12);

  return (
    <main>
      <h1 className="titre mb-1 text-2xl">Déposer une capsule</h1>
      <p className="text-encre-douce mb-6 text-sm">
        Le plus court est souvent le meilleur : une photo brute, un vocal de dix secondes.
      </p>

      <FormulaireCapsule
        rendezvous={rdvs.map((r) => ({
          id: r.id,
          date: r.date,
          libelle: `${enLettres(r.date)} — ${r.capsules} prête(s)`,
        }))}
      />
    </main>
  );
}
