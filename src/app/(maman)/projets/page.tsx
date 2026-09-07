import ListeProjets from "@/components/ListeProjets";
import { projets } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function PageProjets() {
  const liste = await projets();

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <h1 className="titre text-3xl">La boîte à projets</h1>
        <p className="text-encre-douce mt-1 text-sm">
          Des choses à faire tous ensemble. Dis-nous celles qui te tentent.
        </p>
      </header>

      <ListeProjets projets={liste} />
    </main>
  );
}
