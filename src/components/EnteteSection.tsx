import { TEINTES, type Teinte } from "@/lib/sections";

/** Le bandeau de tête d'une page d'admin, dans la couleur de sa rubrique. */
export default function EnteteSection({
  emoji,
  titre,
  description,
  teinte,
}: {
  emoji: string;
  titre: string;
  description?: string;
  teinte: keyof typeof TEINTES;
}) {
  const couleurs: Teinte = TEINTES[teinte];

  return (
    <header
      style={{ backgroundColor: couleurs.fond, borderColor: couleurs.bordure }}
      className="rounded-3xl border p-5"
    >
      <p className="mb-1 text-2xl">{emoji}</p>
      <h1 className="titre text-2xl" style={{ color: couleurs.encre }}>
        {titre}
      </h1>
      {description && (
        <p className="mt-1 text-sm" style={{ color: couleurs.encre, opacity: 0.8 }}>
          {description}
        </p>
      )}
    </header>
  );
}
