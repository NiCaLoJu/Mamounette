import { redirect } from "next/navigation";
import { membreCourant } from "@/lib/auth";
import { ongletsGarnis } from "@/lib/donnees";
import BarreOnglets from "@/components/BarreOnglets";

export default async function LayoutMaman({ children }: { children: React.ReactNode }) {
  const membre = await membreCourant();
  if (!membre) redirect("/bienvenue");

  const apercu = membre.role === "enfant";
  const garnis = await ongletsGarnis();

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      {apercu && (
        <p className="bg-encre px-4 py-1.5 text-center text-xs text-white">
          Aperçu — c'est ce que maman voit.{" "}
          <a href="/admin" className="underline">
            Retour à l'admin
          </a>
        </p>
      )}
      {children}
      <BarreOnglets garnis={garnis} />
    </div>
  );
}
