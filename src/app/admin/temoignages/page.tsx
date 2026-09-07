import Link from "next/link";
import ListeTemoignages from "@/components/ListeTemoignages";
import EnteteSection from "@/components/EnteteSection";
import { exigerEnfant } from "@/lib/auth";
import { temoignagesEnCours } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function Temoignages() {
  const moi = await exigerEnfant();
  const enCours = await temoignagesEnCours(moi.id);
  const aCompleter = enCours.filter((t) => !t.aRepondu).length;

  return (
    <main className="flex flex-col gap-5">
      <EnteteSection
        emoji="🕵️"
        titre="Les triples témoignages"
        description={
          aCompleter > 0
            ? `${aCompleter} attend${aCompleter > 1 ? "ent" : ""} ta version.`
            : "Trois versions de la même histoire. Elle devine qui a dit quoi."
        }
        teinte="menthe"
      />

      <ListeTemoignages temoignages={enCours} moi={moi.id} />

      <Link
        href="/admin/deposer"
        className="border-bordure rounded-full border border-dashed py-2.5 text-center text-sm no-underline"
      >
        Lancer un nouveau témoignage
      </Link>
    </main>
  );
}
