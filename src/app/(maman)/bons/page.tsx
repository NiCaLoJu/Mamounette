import ListeBons from "@/components/ListeBons";
import { bons } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function PageBons() {
  const liste = await bons();

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <h1 className="titre text-3xl">Bons pour…</h1>
        <p className="text-encre-douce mt-1 text-sm">
          À réclamer quand tu veux. C'est fait pour ça.
        </p>
      </header>

      <ListeBons bons={liste} />
    </main>
  );
}
