import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { NOM_COOKIE } from "@/lib/auth";

/**
 * Le lien secret. On l'ouvre une fois, l'appareil s'en souvient ensuite —
 * aucun compte, aucun mot de passe.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const { data: membre } = await db()
    .from("membres")
    .select("id, role")
    .eq("token", token)
    .eq("actif", true)
    .maybeSingle();

  if (!membre) {
    return NextResponse.redirect(new URL("/lien-invalide", _requete.url));
  }

  const destination = membre.role === "maman" ? "/" : "/admin";
  const reponse = NextResponse.redirect(new URL(destination, _requete.url));

  reponse.cookies.set(NOM_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2, // deux ans
    path: "/",
  });

  return reponse;
}
