import Link from "next/link";
import { redirect } from "next/navigation";
import { membreCourant } from "@/lib/auth";
import NavAdmin from "@/components/NavAdmin";


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

      <NavAdmin />

      {children}
    </div>
  );
}
