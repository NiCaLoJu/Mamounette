import Link from "next/link";
import { redirect } from "next/navigation";
import { membreCourant } from "@/lib/auth";

const LIENS = [
  { href: "/admin", libelle: "Tableau de bord" },
  { href: "/admin/deposer", libelle: "Déposer" },
  { href: "/admin/capsules", libelle: "Capsules" },
  { href: "/admin/temoignages", libelle: "Témoignages" },
  { href: "/admin/calendrier", libelle: "Dates" },
  { href: "/admin/bons", libelle: "Bons" },
  { href: "/admin/projets", libelle: "Projets" },
  { href: "/admin/rappels", libelle: "Rappels" },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const membre = await membreCourant();
  if (!membre) redirect("/bienvenue");
  if (membre.role !== "enfant") redirect("/");

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-16">
      <header className="flex items-center justify-between gap-3 py-5">
        <Link href="/admin" className="titre text-xl no-underline">
          Mamounette <span className="text-encre-douce text-sm">· admin</span>
        </Link>
        <span
          className="rounded-full px-2.5 py-1 text-xs text-white"
          style={{ backgroundColor: membre.couleur }}
        >
          {membre.prenom}
        </span>
      </header>

      <nav className="-mx-4 mb-6 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {LIENS.map((lien) => (
            <li key={lien.href}>
              <Link
                href={lien.href}
                className="border-bordure block whitespace-nowrap rounded-full border bg-white px-3 py-1.5 text-sm no-underline"
              >
                {lien.libelle}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="border-bordure text-encre-douce block whitespace-nowrap rounded-full border border-dashed px-3 py-1.5 text-sm no-underline"
            >
              Voir comme maman
            </Link>
          </li>
        </ul>
      </nav>

      {children}
    </div>
  );
}
