"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", libelle: "Aujourd'hui", emoji: "💌" },
  { href: "/fil", libelle: "Le fil", emoji: "💬" },
  { href: "/pioche", libelle: "Pioche", emoji: "🎁" },
  { href: "/tresors", libelle: "Mes trésors", emoji: "💎" },
  { href: "/bons", libelle: "Bons", emoji: "🎟️" },
  { href: "/projets", libelle: "Projets", emoji: "🌍" },
];

/**
 * Les rubriques vides n'apparaissent pas : elles s'ajoutent au fur et à mesure
 * que les garçons les remplissent. « Aujourd'hui » et « Le fil » restent
 * toujours là — l'un est l'accueil, l'autre son seul moyen de nous parler.
 */
export default function BarreOnglets({ garnis }: { garnis: Record<string, boolean> }) {
  const chemin = usePathname();
  const visibles = ONGLETS.filter((o) => garnis[o.href] !== false);

  return (
    <nav className="border-bordure fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {visibles.map((onglet) => {
          const actif = chemin === onglet.href;
          return (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] no-underline transition ${
                  actif ? "text-rose font-medium" : "text-encre-douce"
                }`}
              >
                <span
                  className={`flex h-8 w-11 items-center justify-center rounded-full text-xl transition ${
                    actif ? "bg-rose-clair" : ""
                  }`}
                >
                  {onglet.emoji}
                </span>
                {onglet.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
