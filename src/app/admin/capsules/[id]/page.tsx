import Link from "next/link";
import { notFound } from "next/navigation";
import FormulaireCapsule from "@/components/FormulaireCapsule";
import BoutonSupprimer from "@/components/BoutonSupprimer";
import { capsule as chargerCapsule, prochainsRendezVous } from "@/lib/donnees";
import { enLettres } from "@/lib/dates";
import { LIBELLES_TYPE } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ModifierCapsule({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [capsule, rdvs] = await Promise.all([chargerCapsule(id), prochainsRendezVous(12)]);

  if (!capsule) notFound();

  return (
    <main className="flex flex-col gap-5">
      <div>
        <Link href="/admin/capsules" className="text-encre-douce text-sm no-underline">
          ← Toutes les capsules
        </Link>
        <h1 className="titre mt-2 text-2xl">
          {capsule.titre ?? `${LIBELLES_TYPE[capsule.type]} sans titre`}
        </h1>
        <p className="text-encre-douce text-sm">
          Déposée par {capsule.auteur?.prenom}
          {capsule.ouverte_le && " · elle l'a déjà ouverte"}
        </p>
      </div>

      {capsule.etat === "publiee" && (
        <p className="bg-rose-clair rounded-2xl p-3 text-sm">
          Cette capsule est déjà chez elle. Tu peux la corriger, mais elle ne disparaîtra pas de son
          application — sauf si tu la supprimes.
        </p>
      )}

      <FormulaireCapsule
        capsule={capsule}
        rendezvous={rdvs.map((r) => ({
          id: r.id,
          date: r.date,
          libelle: `${enLettres(r.date)} — ${r.capsules} prête(s)`,
        }))}
      />

      <BoutonSupprimer id={capsule.id} />
    </main>
  );
}
