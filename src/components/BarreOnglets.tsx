"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", libelle: "Aujourd'hui", emoji: "💌" },
  { href: "/pioche", libelle: "La pioche", emoji: "🎁" },
  { href: "/chemin", libelle: "Le chemin", emoji: "✨" },
  { href: "/bons", libelle: "Mes bons", emoji: "🎟️" },
  { href: "/projets", libelle: "Projets", emoji: "🌍" },
];

export default function BarreOnglets() {
  const chemin = usePathname();

  return (
    <nav className="border-bordure fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ONGLETS.map((onglet) => {
          const actif = chemin === onglet.href;
          return (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] no-underline transition ${
                  actif ? "text-rose" : "text-encre-douce"
                }`}
              >
                <span className="text-xl">{onglet.emoji}</span>
                {onglet.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
