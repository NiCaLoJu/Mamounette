import Composeur from "@/components/Composeur";
import FilMessages from "@/components/FilMessages";
import { exigerEnfant } from "@/lib/auth";
import { fil, marquerFilLu } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function FilAdmin() {
  const [moi, messages] = await Promise.all([exigerEnfant(), fil()]);

  // Ouvrir la page vaut lecture : la pastille du tableau de bord s'éteint.
  await marquerFilLu();

  return (
    <main className="flex flex-col gap-5">
      <div>
        <h1 className="titre mb-1 text-2xl">Le fil</h1>
        <p className="text-encre-douce text-sm">
          Ce qu'elle écrit, et ce que vous lui répondez. Elle est prévenue à chaque message.
        </p>
      </div>

      <FilMessages messages={messages} moi={moi.id} vide="Elle n'a encore rien écrit." />

      <div className="border-bordure sticky bottom-4 rounded-3xl border bg-white p-3 shadow-sm">
        <Composeur placeholder="Répondre à maman…" />
      </div>
    </main>
  );
}
