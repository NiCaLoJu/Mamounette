"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, TEINTES } from "@/lib/sections";

/** Le menu de l'admin : une pastille pastel par rubrique. */
export default function NavAdmin() {
  const chemin = usePathname();

  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2">
        {SECTIONS.map((section) => {
          const actif =
            section.href === "/admin" ? chemin === "/admin" : chemin.startsWith(section.href);
          const teinte = TEINTES[section.teinte];

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                style={{
                  backgroundColor: teinte.fond,
                  color: teinte.encre,
                  borderColor: actif ? teinte.encre : teinte.bordure,
                }}
                className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 text-sm no-underline transition ${
                  actif ? "border-2 font-medium" : "border"
                }`}
              >
                <span>{section.emoji}</span>
                {section.libelle}
              </Link>
            </li>
          );
        })}

        <li>
          <Link
            href="/"
            className="border-bordure text-encre-douce flex min-h-11 items-center whitespace-nowrap rounded-2xl border border-dashed px-3 text-sm no-underline"
          >
            👀 Comme maman
          </Link>
        </li>
      </ul>
    </nav>
  );
}
