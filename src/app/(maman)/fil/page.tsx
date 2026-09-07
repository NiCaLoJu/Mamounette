import Composeur from "@/components/Composeur";
import FilMessages from "@/components/FilMessages";
import { exigerMembre } from "@/lib/auth";
import { fil } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function Fil() {
  const [moi, messages] = await Promise.all([exigerMembre(), fil()]);

  return (
    <main className="px-4 pt-8">
      <header className="mb-6">
        <h1 className="titre text-rose text-3xl">Le fil</h1>
        <p className="text-encre-douce mt-1 text-sm">
          Écris-leur quand tu veux, ou envoie ta voix. Ils reçoivent tout.
        </p>
      </header>

      <div className="mb-6">
        <FilMessages
          messages={messages}
          moi={moi.id}
          vide="Rien encore. Tu peux commencer, ils adoreront ça."
        />
      </div>

      <div className="border-bordure sticky bottom-24 rounded-3xl border bg-white p-3 shadow-sm">
        <Composeur placeholder="Un mot pour tes garçons…" />
      </div>
    </main>
  );
}
