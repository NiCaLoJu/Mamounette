"use server";

import { revalidatePath } from "next/cache";
import { db } from "./supabase";
import { exigerEnfant, exigerMembre } from "./auth";
import { notifierEnfants, notifierMaman } from "./notifications";
import { capsule as chargerCapsule, type CapsuleAffichee } from "./donnees";
import type { DestinationCapsule, TypeCapsule } from "./types";

// ---------------------------------------------------------------------------
// Côté maman
// ---------------------------------------------------------------------------

/** Ouvrir une case : on note la date la première fois seulement. */
export async function ouvrirCapsule(id: string) {
  const membre = await exigerMembre();
  if (membre.role !== "maman") return;

  const { data: capsule } = await db()
    .from("capsules")
    .select("id, titre, ouverte_le, auteur_id")
    .eq("id", id)
    .maybeSingle();

  if (!capsule || capsule.ouverte_le) return;

  await db().from("capsules").update({ ouverte_le: new Date().toISOString() }).eq("id", id);
  revalidatePath("/");
}

export async function reagir(capsuleId: string, emoji: string) {
  const membre = await exigerMembre();
  if (membre.role !== "maman") return;

  await db().from("reactions").insert({ capsule_id: capsuleId, emoji });

  const { data: capsule } = await db()
    .from("capsules")
    .select("titre, auteur_id")
    .eq("id", capsuleId)
    .maybeSingle();

  if (capsule?.auteur_id) {
    await notifierEnfants(
      `${emoji} Maman a réagi`,
      capsule.titre ?? "Elle vient d'ouvrir une de vos capsules.",
      { destinataire: capsule.auteur_id },
    );
  }

  revalidatePath("/");
}

/**
 * La pioche : une capsule au hasard dans la réserve, n'importe quel jour.
 * C'est aussi ce qui rend la réserve utile toute l'année.
 */
export async function piocher(): Promise<CapsuleAffichee | null> {
  const membre = await exigerMembre();
  if (membre.role !== "maman") return null;

  const { data: candidates } = await db()
    .from("capsules")
    .select("id")
    .eq("destination", "reserve")
    .neq("etat", "brouillon")
    .is("piochee_le", null)
    .limit(50);

  if (!candidates?.length) return null;

  const choisie = candidates[Math.floor(Math.random() * candidates.length)].id as string;
  const maintenant = new Date().toISOString();

  await db()
    .from("capsules")
    .update({ piochee_le: maintenant, etat: "publiee", publiee_le: maintenant })
    .eq("id", choisie);

  revalidatePath("/");
  revalidatePath("/pioche");
  return chargerCapsule(choisie);
}

export async function reclamerBon(id: string) {
  const membre = await exigerMembre();
  if (membre.role !== "maman") return;

  const { data: bon } = await db()
    .from("bons")
    .select("titre, etat")
    .eq("id", id)
    .maybeSingle();

  if (!bon || bon.etat !== "disponible") return;

  await db()
    .from("bons")
    .update({ etat: "reclame", reclame_le: new Date().toISOString() })
    .eq("id", id);

  await notifierEnfants("🎟️ Maman réclame un bon", bon.titre, { url: "/admin/bons" });
  revalidatePath("/bons");
}

export async function marquerEnvie(projetId: string, envie: boolean) {
  const membre = await exigerMembre();
  if (membre.role !== "maman") return;

  await db().from("projets").update({ envie }).eq("id", projetId);
  revalidatePath("/projets");
}

// ---------------------------------------------------------------------------
// Côté administration
// ---------------------------------------------------------------------------

async function televerser(fichier: File | null, prefixe: string): Promise<string | null> {
  if (!fichier || fichier.size === 0) return null;

  const extension = fichier.name.split(".").pop()?.toLowerCase() ?? "bin";
  const chemin = `${prefixe}/${crypto.randomUUID()}.${extension}`;

  const { error } = await db()
    .storage.from("media")
    .upload(chemin, fichier, { contentType: fichier.type, upsert: false });

  if (error) throw new Error(`Envoi du fichier impossible : ${error.message}`);
  return chemin;
}

export async function creerCapsule(formulaire: FormData) {
  const auteur = await exigerEnfant();

  const type = formulaire.get("type") as TypeCapsule;
  const destination = formulaire.get("destination") as DestinationCapsule;
  const rendezvousId = (formulaire.get("rendezvous_id") as string) || null;
  const fichier = formulaire.get("media") as File | null;

  const payloadBrut = formulaire.get("payload") as string | null;
  let payload: Record<string, unknown> = {};
  if (payloadBrut) {
    try {
      payload = JSON.parse(payloadBrut);
    } catch {
      payload = {};
    }
  }

  const publieeImmediatement = destination === "direct";
  const maintenant = new Date().toISOString();

  const { error } = await db()
    .from("capsules")
    .insert({
      type,
      auteur_id: auteur.id,
      titre: (formulaire.get("titre") as string) || null,
      teaser: (formulaire.get("teaser") as string) || null,
      corps: (formulaire.get("corps") as string) || null,
      lien_url: (formulaire.get("lien_url") as string) || null,
      media_chemin: await televerser(fichier, type),
      media_duree: Number(formulaire.get("media_duree")) || null,
      payload,
      destination,
      rendezvous_id: destination === "rendezvous" ? rendezvousId : null,
      etat: publieeImmediatement ? "publiee" : "programmee",
      publiee_le: publieeImmediatement ? maintenant : null,
    });

  if (error) throw new Error(error.message);

  if (publieeImmediatement) {
    await notifierMaman(
      "Un mot pour toi 💌",
      (formulaire.get("teaser") as string) || "Quelqu'un vient de déposer quelque chose.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function supprimerCapsule(id: string) {
  await exigerEnfant();
  await db().from("capsules").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function publierCapsules(rendezvousId: string) {
  await exigerEnfant();
  const maintenant = new Date().toISOString();

  await db()
    .from("capsules")
    .update({ etat: "publiee", publiee_le: maintenant })
    .eq("rendezvous_id", rendezvousId)
    .eq("etat", "programmee");

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function creerRendezVous(formulaire: FormData) {
  await exigerEnfant();
  const date = formulaire.get("date") as string;
  const referent = (formulaire.get("referent_id") as string) || null;
  if (!date) return;

  await db().from("rendezvous").upsert({ date, referent_id: referent }, { onConflict: "date" });
  revalidatePath("/admin/calendrier");
}

export async function supprimerRendezVous(id: string) {
  await exigerEnfant();
  await db().from("rendezvous").delete().eq("id", id);
  revalidatePath("/admin/calendrier");
}

export async function creerBon(formulaire: FormData) {
  const auteur = await exigerEnfant();

  await db().from("bons").insert({
    auteur_id: auteur.id,
    titre: formulaire.get("titre") as string,
    description: (formulaire.get("description") as string) || null,
  });

  revalidatePath("/admin/bons");
  revalidatePath("/bons");
}

export async function honorerBon(id: string) {
  await exigerEnfant();
  await db()
    .from("bons")
    .update({ etat: "honore", honore_le: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/bons");
  revalidatePath("/bons");
}

export async function creerProjet(formulaire: FormData) {
  const auteur = await exigerEnfant();
  const fichier = formulaire.get("media") as File | null;

  await db().from("projets").insert({
    auteur_id: auteur.id,
    titre: formulaire.get("titre") as string,
    description: (formulaire.get("description") as string) || null,
    media_chemin: await televerser(fichier, "projets"),
  });

  revalidatePath("/admin/projets");
  revalidatePath("/projets");
}

export async function programmerRappel(formulaire: FormData) {
  const auteur = await exigerEnfant();

  await db().from("rappels").insert({
    membre_id: (formulaire.get("membre_id") as string) || null,
    titre: formulaire.get("titre") as string,
    corps: (formulaire.get("corps") as string) || null,
    url: (formulaire.get("url") as string) || "/",
    envoyer_le: new Date(formulaire.get("envoyer_le") as string).toISOString(),
    cree_par: auteur.id,
  });

  revalidatePath("/admin/rappels");
}

export async function annulerRappel(id: string) {
  await exigerEnfant();
  await db().from("rappels").delete().eq("id", id).is("envoye_le", null);
  revalidatePath("/admin/rappels");
}
