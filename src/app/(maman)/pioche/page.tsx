import Pioche from "@/components/Pioche";
import { tailleReserve } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function PagePioche() {
  const restantes = await tailleReserve();

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <h1 className="titre text-rose text-3xl">La pioche</h1>
        <p className="text-encre-douce mt-1 text-sm">
          Quand tu veux, sans raison. Il y en aura toujours d'autres.
        </p>
      </header>

      <Pioche restantes={restantes} />
    </main>
  );
}
