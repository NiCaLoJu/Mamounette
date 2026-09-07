import CaseAvent from "@/components/CaseAvent";
import Notifications from "@/components/Notifications";
import { capsulesDuJour, rendezVousDuJour, tailleReserve } from "@/lib/donnees";
import { enLettres, aujourdhui } from "@/lib/dates";
import { exigerMembre } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Aujourdhui() {
  const moi = await exigerMembre();
  const [capsules, rdv, reserve] = await Promise.all([
    capsulesDuJour(),
    rendezVousDuJour(),
    tailleReserve(),
  ]);

  const nonOuvertes = capsules.filter((c) => !c.ouverte_le).length;

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <p className="text-encre-douce text-sm capitalize">{enLettres(aujourdhui())}</p>
        <h1 className="titre text-3xl">
          {capsules.length === 0
            ? "Rien aujourd'hui"
            : nonOuvertes > 0
              ? "Il y a quelque chose pour toi"
              : "Ta journée"}
        </h1>
        {capsules.length > 0 && nonOuvertes > 0 && (
          <p className="text-encre-douce mt-1 text-sm">
            {nonOuvertes} case{nonOuvertes > 1 ? "s" : ""} à ouvrir — à ton rythme.
          </p>
        )}
      </header>

      <Notifications />

      {capsules.length === 0 ? (
        <div className="border-bordure rounded-3xl border border-dashed p-8 text-center">
          <p className="mb-2 text-4xl">🌿</p>
          <p className="text-encre-douce text-sm">
            Pas de nouvelle case aujourd'hui.
            {reserve > 0 && (
              <>
                {" "}
                Mais il reste {reserve} surprise{reserve > 1 ? "s" : ""} dans la boîte : va faire un
                tour du côté de <strong>la pioche</strong>.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {capsules.map((capsule) => (
            <CaseAvent key={capsule.id} capsule={capsule} moi={moi.id} />
          ))}
        </div>
      )}

      {rdv && capsules.length > 0 && (
        <p className="text-encre-douce mt-8 text-center text-xs">
          Fait avec beaucoup d'amour par tes garçons.
        </p>
      )}
    </main>
  );
}
