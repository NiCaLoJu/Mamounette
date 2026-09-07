import Link from "next/link";
import {
  dernieresReactions,
  prochainsRendezVous,
  motsNonLus,
  tailleReserve,
  temoignagesAttendus,
  toutesLesCapsules,
} from "@/lib/donnees";
import { exigerEnfant } from "@/lib/auth";
import { aujourdhui, ecartJours, enLettres, enRelatif } from "@/lib/dates";
import { EMOJIS_TYPE } from "@/lib/types";
import Notifications from "@/components/Notifications";

export const dynamic = "force-dynamic";

const CAPSULES_MINIMUM = 3;

export default async function TableauDeBord() {
  const moi = await exigerEnfant();
  const [rdvs, reserve, capsules, reactions, temoignages, nonLus] = await Promise.all([
    prochainsRendezVous(4),
    tailleReserve(),
    toutesLesCapsules(12),
    dernieresReactions(6),
    temoignagesAttendus(moi.id),
    motsNonLus(),
  ]);

  const prochain = rdvs[0];
  const jours = prochain ? ecartJours(aujourdhui(), prochain.date) : null;
  const alerte = prochain && prochain.capsules < CAPSULES_MINIMUM && (jours ?? 99) <= 5;

  return (
    <main className="flex flex-col gap-6">
      <Notifications />

      {/* Déposer doit tenir en deux gestes, debout dans le métro. */}
      <nav className="grid grid-cols-3 gap-2">
        {[
          { type: "photo", emoji: "📷", libelle: "Photo" },
          { type: "vocal", emoji: "🎙️", libelle: "Vocal" },
          { type: "anecdote", emoji: "✏️", libelle: "Un mot" },
        ].map((raccourci) => (
          <Link
            key={raccourci.type}
            href={`/admin/deposer?type=${raccourci.type}`}
            className="border-bordure flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border bg-white text-sm no-underline transition active:scale-[0.97]"
          >
            <span className="text-2xl">{raccourci.emoji}</span>
            {raccourci.libelle}
          </Link>
        ))}
      </nav>

      {nonLus > 0 && (
        <Link
          href="/admin/fil"
          className="border-rose bg-rose-clair rounded-3xl border p-4 text-sm no-underline"
        >
          <strong>
            💬 Maman a écrit {nonLus} message{nonLus > 1 ? "s" : ""}.
          </strong>
          <span className="text-encre-douce block">Va lui répondre.</span>
        </Link>
      )}

      {/* Ce que les autres attendent de toi passe avant tout le reste. */}
      {temoignages > 0 && (
        <Link
          href="/admin/temoignages"
          className="border-rose bg-rose-clair rounded-3xl border p-4 text-sm no-underline"
        >
          <strong>
            🕵️ {temoignages} témoignage{temoignages > 1 ? "s" : ""} attend
            {temoignages > 1 ? "ent" : ""} ta version.
          </strong>
          <span className="text-encre-douce block">
            Sans toi, la capsule reste au brouillon et elle ne la verra jamais.
          </span>
        </Link>
      )}

      {/* Le prochain rendez-vous — c'est tout l'objet de cette page. */}
      <section
        className={`rounded-3xl border p-5 ${
          alerte ? "border-rose bg-rose-clair" : "border-bordure bg-white"
        }`}
      >
        {prochain ? (
          <>
            <p className="text-encre-douce text-sm">Prochaine date · {enRelatif(prochain.date)}</p>
            <h2 className="titre text-2xl capitalize">{enLettres(prochain.date)}</h2>
            <p className="mt-2 text-sm">
              <strong>{prochain.capsules}</strong> capsule{prochain.capsules > 1 ? "s" : ""} prête
              {prochain.capsules > 1 ? "s" : ""}
              {prochain.referent && <> · référent : {prochain.referent}</>}
            </p>
            {alerte && (
              <p className="mt-3 text-sm font-medium">
                Il en manque. C'est le moment de déposer quelque chose.
              </p>
            )}
            <Link
              href={`/admin/deposer?rdv=${prochain.id}`}
              className="bg-rose mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm text-white no-underline"
            >
              Préparer cette journée
            </Link>
          </>
        ) : (
          <>
            <h2 className="titre text-xl">Aucune date enregistrée</h2>
            <p className="text-encre-douce mt-1 text-sm">
              Commence par ajouter les prochains rendez-vous.
            </p>
            <Link
              href="/admin/calendrier"
              className="bg-rose mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm text-white no-underline"
            >
              Ajouter les dates
            </Link>
          </>
        )}
      </section>

      {/* La réserve : le filet de sécurité du projet. */}
      <Link
        href="/admin/capsules?filtre=reserve"
        className="border-bordure rounded-3xl border bg-white p-5 no-underline"
      >
        <h2 className="titre mb-1 text-xl">La réserve</h2>
        <p className="text-encre-douce text-sm">
          {reserve === 0 ? (
            <>
              Elle est vide. C'est le point faible du projet : sans réserve, un jour sans dépôt est
              un jour vide pour elle.
            </>
          ) : (
            <>
              {reserve} capsule{reserve > 1 ? "s" : ""} en attente. Elles alimentent la pioche et
              complètent automatiquement les journées trop maigres.
            </>
          )}
        </p>
      </Link>

      {/* Ses réactions : le seul retour qu'on ait, et le meilleur carburant. */}
      {reactions.length > 0 && (
        <section>
          <h2 className="titre mb-3 text-xl">Elle a réagi</h2>
          <ul className="flex flex-col gap-2">
            {reactions.map((reaction, i) => (
              <li
                key={i}
                className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 text-sm"
              >
                <span className="text-xl">{reaction.emoji}</span>
                <span className="text-encre-douce truncate">
                  {reaction.capsule?.titre ?? reaction.capsule?.teaser ?? "une capsule"}
                  {reaction.capsule?.auteur && ` · de ${reaction.capsule.auteur.prenom}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Les dépôts récents. */}
      <section>
        <h2 className="titre mb-3 text-xl">Derniers dépôts</h2>
        {capsules.length === 0 ? (
          <p className="text-encre-douce text-sm">Rien encore. À vous trois de jouer.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {capsules.map((capsule) => (
              <li key={capsule.id}>
                <Link
                  href={`/admin/capsules/${capsule.id}`}
                  className="border-bordure flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 no-underline"
                >
                <span className="text-xl">{EMOJIS_TYPE[capsule.type]}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {capsule.titre ?? capsule.teaser ?? "Sans titre"}
                  </span>
                  <span className="text-encre-douce text-xs">
                    {capsule.auteur?.prenom} ·{" "}
                    {capsule.destination === "reserve"
                      ? "réserve"
                      : capsule.destination === "direct"
                        ? "en direct"
                        : "programmée"}
                    {capsule.ouverte_le && " · ouverte ✓"}
                  </span>
                </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
