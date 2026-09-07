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

/**
 * Prépare un envoi direct du navigateur vers Supabase.
 *
 * Le fichier ne transite pas par ici : une fonction serverless Vercel refuse
 * les corps de requête au-delà de 4,5 Mo, ce qu'une simple vidéo dépasse.
 * On signe donc une autorisation d'écriture à usage unique, et le téléphone
 * parle directement au stockage.
 */
export async function preparerEnvoi(prefixe: string, extension: string) {
  await exigerMembre();

  const chemin = `${prefixe}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await db().storage.from("media").createSignedUploadUrl(chemin);

  if (error || !data) {
    throw new Error(`Envoi impossible : ${error?.message ?? "autorisation refusée"}`);
  }

  return { chemin, token: data.token };
}

export async function creerCapsule(formulaire: FormData) {
  const auteur = await exigerEnfant();

  const type = formulaire.get("type") as TypeCapsule;
  const destination = formulaire.get("destination") as DestinationCapsule;
  const rendezvousId = (formulaire.get("rendezvous_id") as string) || null;

  const payloadBrut = formulaire.get("payload") as string | null;
  let payload: Record<string, unknown> = {};
  if (payloadBrut) {
    try {
      payload = JSON.parse(payloadBrut);
    } catch {
      payload = {};
    }
  }

  // Un triple témoignage naît incomplet : il attend la voix des deux autres.
  const collaboratif = type === "temoignage";
  const publieeImmediatement = destination === "direct" && !collaboratif;
  const maintenant = new Date().toISOString();

  const { data: creee, error } = await db()
    .from("capsules")
    .insert({
      type,
      auteur_id: auteur.id,
      titre: (formulaire.get("titre") as string) || null,
      corps: (formulaire.get("corps") as string) || null,
      lien_url: (formulaire.get("lien_url") as string) || null,
      media_chemin: (formulaire.get("media_chemin") as string) || null,
      media_duree: Number(formulaire.get("media_duree")) || null,
      payload,
      destination,
      rendezvous_id: destination === "rendezvous" ? rendezvousId : null,
      etat: collaboratif ? "brouillon" : publieeImmediatement ? "publiee" : "programmee",
      publiee_le: publieeImmediatement ? maintenant : null,
    })
    .select("id")
    .single();

  if (error || !creee) throw new Error(error?.message ?? "Dépôt impossible.");

  // Celui qui lance donne sa version tout de suite, puis prévient les autres.
  if (collaboratif) {
    const maReponse = (formulaire.get("ma_reponse") as string)?.trim();
    if (maReponse) {
      await db()
        .from("temoignages")
        .insert({ capsule_id: creee.id, auteur_id: auteur.id, texte: maReponse });
    }

    await notifierEnfants(
      "🕵️ À toi de répondre",
      `${auteur.prenom} lance : « ${payload.question ?? "un témoignage"} »`,
      { sauf: auteur.id, url: "/admin/temoignages" },
    );
  }

  if (publieeImmediatement) {
    await notifierMaman(
      "Un mot pour toi 💌",
      (formulaire.get("titre") as string) || "Quelqu'un vient de déposer quelque chose.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function supprimerCapsule(id: string) {
  await exigerEnfant();

  const { data: capsule } = await db()
    .from("capsules")
    .select("media_chemin")
    .eq("id", id)
    .maybeSingle();

  // Le fichier part avec la capsule, sans quoi le stockage se remplit de
  // médias que plus rien ne référence.
  if (capsule?.media_chemin) {
    await db().storage.from("media").remove([capsule.media_chemin as string]);
  }

  await db().from("capsules").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/capsules");
  revalidatePath("/");
}

/**
 * Modifier une capsule déjà déposée : la renommer, la réécrire, la déplacer
 * vers une autre date ou la remettre à la réserve.
 */
export async function modifierCapsule(formulaire: FormData) {
  await exigerEnfant();

  const id = formulaire.get("id") as string;
  if (!id) throw new Error("Capsule introuvable.");

  const { data: existante } = await db()
    .from("capsules")
    .select("etat, media_chemin")
    .eq("id", id)
    .maybeSingle();

  if (!existante) throw new Error("Capsule introuvable.");

  const destination = formulaire.get("destination") as DestinationCapsule;
  const rendezvousId = (formulaire.get("rendezvous_id") as string) || null;
  const nouveauMedia = (formulaire.get("media_chemin") as string) || null;

  const payloadBrut = formulaire.get("payload") as string | null;
  let payload: Record<string, unknown> = {};
  if (payloadBrut) {
    try {
      payload = JSON.parse(payloadBrut);
    } catch {
      payload = {};
    }
  }

  // Une capsule déjà chez elle le reste : on ne la lui retire pas sous les yeux.
  const dejaPubliee = existante.etat === "publiee";
  const maintenant = new Date().toISOString();

  if (nouveauMedia && existante.media_chemin) {
    await db().storage.from("media").remove([existante.media_chemin as string]);
  }

  const { error } = await db()
    .from("capsules")
    .update({
      titre: (formulaire.get("titre") as string) || null,
      corps: (formulaire.get("corps") as string) || null,
      lien_url: (formulaire.get("lien_url") as string) || null,
      ...(nouveauMedia ? { media_chemin: nouveauMedia } : {}),
      payload,
      destination,
      rendezvous_id: destination === "rendezvous" ? rendezvousId : null,
      etat: dejaPubliee ? "publiee" : destination === "direct" ? "publiee" : "programmee",
      publiee_le: dejaPubliee
        ? undefined
        : destination === "direct"
          ? maintenant
          : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (!dejaPubliee && destination === "direct") {
    await notifierMaman(
      "Un mot pour toi 💌",
      (formulaire.get("titre") as string) || "Quelqu'un vient de déposer quelque chose.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/capsules");
  revalidatePath("/");
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

  await db().from("projets").insert({
    auteur_id: auteur.id,
    titre: formulaire.get("titre") as string,
    description: (formulaire.get("description") as string) || null,
    media_chemin: (formulaire.get("media_chemin") as string) || null,
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

// ---------------------------------------------------------------------------
// Le triple témoignage collaboratif
// ---------------------------------------------------------------------------

/**
 * Ajouter sa version. Quand les trois voix y sont, la capsule quitte le
 * brouillon toute seule et rejoint la file d'attente.
 */
export async function repondreTemoignage(capsuleId: string, texte: string) {
  const auteur = await exigerEnfant();
  const propre = texte.trim();
  if (!propre) return;

  const { error } = await db()
    .from("temoignages")
    .upsert(
      { capsule_id: capsuleId, auteur_id: auteur.id, texte: propre },
      { onConflict: "capsule_id,auteur_id" },
    );

  if (error) throw new Error(error.message);

  const { data: capsule } = await db()
    .from("capsules")
    .select("id, etat, destination, payload")
    .eq("id", capsuleId)
    .maybeSingle();

  if (!capsule || capsule.etat !== "brouillon") return;

  const [{ data: attendus }, { data: reponses }] = await Promise.all([
    db()
      .from("membres")
      .select("id")
      .eq("role", "enfant")
      .eq("attendu_temoignages", true)
      .eq("actif", true),
    db().from("temoignages").select("auteur_id").eq("capsule_id", capsuleId),
  ]);

  const ontRepondu = new Set((reponses ?? []).map((r) => r.auteur_id as string));
  const complet = (attendus ?? []).every((m) => ontRepondu.has(m.id as string));

  if (complet) {
    const direct = capsule.destination === "direct";
    const maintenant = new Date().toISOString();

    await db()
      .from("capsules")
      .update({
        etat: direct ? "publiee" : "programmee",
        publiee_le: direct ? maintenant : null,
      })
      .eq("id", capsuleId);

    await notifierEnfants(
      "✅ Témoignage complet",
      `« ${(capsule.payload as Record<string, unknown>)?.question ?? "Le témoignage"} » est prêt.`,
      { url: "/admin/capsules" },
    );

    if (direct) {
      await notifierMaman("Un mot pour toi 💌", "Trois versions t'attendent.");
    }
  } else {
    await notifierEnfants("🕵️ Une voix de plus", `${auteur.prenom} a donné sa version.`, {
      sauf: auteur.id,
      url: "/admin/temoignages",
    });
  }

  revalidatePath("/admin/temoignages");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// La conversation — elle écrit, ils répondent
// ---------------------------------------------------------------------------

/**
 * Un mot sous une capsule, ou un message envoyé sans raison. La même action
 * sert aux deux sens : ce qui change, c'est qui est prévenu.
 */
export async function ecrire(formulaire: FormData) {
  const auteur = await exigerMembre();

  const texte = ((formulaire.get("texte") as string) ?? "").trim();
  const media = (formulaire.get("media_chemin") as string) || null;
  if (!texte && !media) return;

  const capsuleId = (formulaire.get("capsule_id") as string) || null;

  const { error } = await db().from("messages").insert({
    capsule_id: capsuleId,
    auteur_id: auteur.id,
    texte: texte || null,
    media_chemin: media,
    media_duree: Number(formulaire.get("media_duree")) || null,
  });

  if (error) throw new Error(error.message);

  const apercu = texte || "Elle t'a laissé un vocal.";

  if (auteur.role === "maman") {
    await notifierEnfants(`💬 Maman a écrit`, apercu, { url: "/admin/fil" });
  } else {
    await notifierMaman(`💬 ${auteur.prenom} t'a répondu`, texte || "Un vocal t'attend.", "/fil", {
      plafond: false,
    });
  }

  revalidatePath("/fil");
  revalidatePath("/");
  revalidatePath("/admin/fil");
  revalidatePath("/admin");
}

