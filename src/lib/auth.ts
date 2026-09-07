import { cookies } from "next/headers";
import { db } from "./supabase";
import type { Membre } from "./types";

export const NOM_COOKIE = "mamounette";

/** Le membre associé au lien secret mémorisé sur cet appareil, s'il y en a un. */
export async function membreCourant(): Promise<Membre | null> {
  const token = (await cookies()).get(NOM_COOKIE)?.value;
  if (!token) return null;

  const { data } = await db()
    .from("membres")
    .select("*")
    .eq("token", token)
    .eq("actif", true)
    .maybeSingle();

  return (data as Membre) ?? null;
}

/** Comme membreCourant, mais lève si personne n'est identifié. */
export async function exigerMembre(): Promise<Membre> {
  const membre = await membreCourant();
  if (!membre) throw new Error("Aucun membre identifié sur cet appareil.");
  return membre;
}

/** Comme exigerMembre, mais réservé à l'espace d'administration. */
export async function exigerEnfant(): Promise<Membre> {
  const membre = await exigerMembre();
  if (membre.role !== "enfant") throw new Error("Accès réservé.");
  return membre;
}
