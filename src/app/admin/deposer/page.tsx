import FormulaireCapsule from "@/components/FormulaireCapsule";
import EnteteSection from "@/components/EnteteSection";
import { prochainsRendezVous } from "@/lib/donnees";
import { enLettres } from "@/lib/dates";
import type { TypeCapsule } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Deposer({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; rdv?: string }>;
}) {
  const [{ type, rdv }, rdvs] = await Promise.all([searchParams, prochainsRendezVous(12)]);

  return (
    <main>
      <EnteteSection
        emoji="✨"
        titre="Déposer une capsule"
        description="Le plus court est souvent le meilleur : une photo brute, un vocal de dix secondes."
        teinte="rose"
      />

      <FormulaireCapsule
        typeInitial={type as TypeCapsule | undefined}
        rdvInitial={rdv}
        rendezvous={rdvs.map((r) => ({
          id: r.id,
          date: r.date,
          libelle: `${enLettres(r.date)} — ${r.capsules} prête(s)`,
        }))}
      />
    </main>
  );
}
