import CaseAvent from "@/components/CaseAvent";
import Notifications from "@/components/Notifications";
import SignatureFamille from "@/components/SignatureFamille";
import CapProchain from "@/components/CapProchain";
import { capsulesDuJour, rendezVousDuJour, tailleReserve } from "@/lib/donnees";
import { enLettres, aujourdhui } from "@/lib/dates";
import { exigerMembre } from "@/lib/auth";
import { salutation } from "@/lib/couleur";

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
        <h1 className="titre text-rose text-3xl leading-tight">
          {salutation()} Mamounette
        </h1>
        <p className="mt-1">
          {capsules.length === 0
            ? "Rien de neuf aujourd'hui, mais on pense à toi."
            : nonOuvertes > 0
              ? `${nonOuvertes} case${nonOuvertes > 1 ? "s" : ""} t'attend${nonOuvertes > 1 ? "ent" : ""} — à ton rythme 💛`
              : "Tu as tout ouvert. Reviens quand tu veux les relire."}
        </p>
      </header>

      <Notifications />

      <CapProchain />

      {capsules.length > 0 && <SignatureFamille />}

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
