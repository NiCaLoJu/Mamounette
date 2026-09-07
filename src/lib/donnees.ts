import { db, urlSignee } from "./supabase";
import { aujourdhui } from "./dates";
import type { Bon, Capsule, Projet, RendezVous } from "./types";

export type Auteur = { prenom: string; couleur: string };
export type Temoignage = {
  id: string;
  texte: string;
  auteur_id: string;
  auteur: Auteur | null;
};

export type Message = {
  id: string;
  texte: string | null;
  media_chemin: string | null;
  media_url?: string | null;
  cree_le: string;
  auteur_id: string;
  auteur: Auteur | null;
};

export type CapsuleAffichee = Capsule & {
  auteur: Auteur | null;
  media_url: string | null;
  reactions: { emoji: string | null }[];
  temoignages: Temoignage[];
  messages: Message[];
};

const CHAMPS =
  "*, auteur:membres(prenom, couleur), reactions(emoji), temoignages(id, texte, auteur_id, auteur:membres(prenom, couleur)), messages(id, texte, media_chemin, cree_le, auteur_id, auteur:membres(prenom, couleur))";

/** Ajoute les URLs signées des médias à un lot de capsules. */
async function avecMedias(lignes: CapsuleAffichee[]): Promise<CapsuleAffichee[]> {
  return Promise.all(
    lignes.map(async (c) => ({
      ...c,
      media_url: await urlSignee(c.media_chemin),
      messages: await Promise.all(
        (c.messages ?? [])
          .sort((a, b) => a.cree_le.localeCompare(b.cree_le))
          .map(async (m) => ({ ...m, media_url: await urlSignee(m.media_chemin) })),
      ),
    })),
  );
}

/** Le rendez-vous d'aujourd'hui, s'il y en a un. */
export async function rendezVousDuJour(): Promise<RendezVous | null> {
  const { data } = await db()
    .from("rendezvous")
    .select("*")
    .eq("date", aujourdhui())
    .maybeSingle();
  return (data as RendezVous) ?? null;
}

/**
 * Ce qu'elle voit aujourd'hui : les capsules programmées pour le rendez-vous
 * du jour, plus celles publiées en direct depuis ce matin.
 */
export async function capsulesDuJour(): Promise<CapsuleAffichee[]> {
  const rdv = await rendezVousDuJour();
  const debutDuJour = `${aujourdhui()}T00:00:00`;

  const requete = db()
    .from("capsules")
    .select(CHAMPS)
    .eq("etat", "publiee")
    .order("cree_le", { ascending: true });

  const filtre = rdv
    ? `rendezvous_id.eq.${rdv.id},publiee_le.gte.${debutDuJour}`
    : `publiee_le.gte.${debutDuJour}`;

  const { data } = await requete.or(filtre);
  return avecMedias((data ?? []) as CapsuleAffichee[]);
}

/** Tout ce qu'elle a déjà ouvert, du plus récent au plus ancien. */
export async function capsulesOuvertes(limite = 100): Promise<CapsuleAffichee[]> {
  const { data } = await db()
    .from("capsules")
    .select(CHAMPS)
    .eq("etat", "publiee")
    .not("ouverte_le", "is", null)
    .order("ouverte_le", { ascending: false })
    .limit(limite);
  return avecMedias((data ?? []) as CapsuleAffichee[]);
}

/** Une capsule précise. */
export async function capsule(id: string): Promise<CapsuleAffichee | null> {
  const { data } = await db().from("capsules").select(CHAMPS).eq("id", id).maybeSingle();
  if (!data) return null;
  const [avec] = await avecMedias([data as CapsuleAffichee]);
  return avec;
}

/** Combien de capsules dorment encore dans la réserve. */
export async function tailleReserve(): Promise<number> {
  const { count } = await db()
    .from("capsules")
    .select("id", { count: "exact", head: true })
    .eq("destination", "reserve")
    .neq("etat", "brouillon")
    .is("piochee_le", null);
  return count ?? 0;
}

/** La frise : tous les rendez-vous, passés et à venir. */
export async function frise(): Promise<(RendezVous & { capsules: number })[]> {
  const { data: rdvs } = await db()
    .from("rendezvous")
    .select("*")
    .order("date", { ascending: true });

  const { data: capsules } = await db()
    .from("capsules")
    .select("rendezvous_id")
    .not("rendezvous_id", "is", null);

  const comptes = new Map<string, number>();
  for (const c of capsules ?? []) {
    const id = (c as { rendezvous_id: string }).rendezvous_id;
    comptes.set(id, (comptes.get(id) ?? 0) + 1);
  }

  return ((rdvs ?? []) as RendezVous[]).map((r) => ({
    ...r,
    capsules: comptes.get(r.id) ?? 0,
  }));
}

export async function bons(): Promise<(Bon & { auteur: Auteur | null })[]> {
  const { data } = await db()
    .from("bons")
    .select("*, auteur:membres(prenom, couleur)")
    .order("cree_le", { ascending: false });
  return (data ?? []) as (Bon & { auteur: Auteur | null })[];
}

export async function projets(): Promise<
  (Projet & { auteur: Auteur | null; media_url: string | null })[]
> {
  const { data } = await db()
    .from("projets")
    .select("*, auteur:membres(prenom, couleur)")
    .order("cree_le", { ascending: false });

  return Promise.all(
    ((data ?? []) as (Projet & { auteur: Auteur | null })[]).map(async (p) => ({
      ...p,
      media_url: await urlSignee(p.media_chemin),
    })),
  );
}

// ---------------------------------------------------------------------------
// Côté administration
// ---------------------------------------------------------------------------

export async function membres(): Promise<
  { id: string; prenom: string; couleur: string; role: string; token: string }[]
> {
  const { data } = await db()
    .from("membres")
    .select("id, prenom, couleur, role, token")
    .eq("actif", true)
    .order("role", { ascending: false });
  return (data ?? []) as { id: string; prenom: string; couleur: string; role: string; token: string }[];
}

/** Les rendez-vous à venir, avec ce qui est prêt pour chacun. */
export async function prochainsRendezVous(limite = 6): Promise<
  (RendezVous & { capsules: number; referent: string | null })[]
> {
  const { data: rdvs } = await db()
    .from("rendezvous")
    .select("*, referent:membres(prenom)")
    .gte("date", aujourdhui())
    .order("date", { ascending: true })
    .limit(limite);

  return Promise.all(
    ((rdvs ?? []) as (RendezVous & { referent: { prenom: string } | null })[]).map(async (r) => {
      const { count } = await db()
        .from("capsules")
        .select("id", { count: "exact", head: true })
        .eq("rendezvous_id", r.id);

      return { ...r, capsules: count ?? 0, referent: r.referent?.prenom ?? null };
    }),
  );
}

/** Tout ce qui a été déposé, du plus récent au plus ancien. */
export async function toutesLesCapsules(limite = 100): Promise<CapsuleAffichee[]> {
  const { data } = await db()
    .from("capsules")
    .select(CHAMPS)
    .order("cree_le", { ascending: false })
    .limit(limite);
  return avecMedias((data ?? []) as CapsuleAffichee[]);
}

/** Ce qu'elle a ouvert et réagi récemment — le retour dont les garçons ont besoin. */
export async function dernieresReactions(limite = 10) {
  const { data } = await db()
    .from("reactions")
    .select("emoji, cree_le, capsule:capsules(titre, teaser, auteur:membres(prenom))")
    .order("cree_le", { ascending: false })
    .limit(limite);
  return (data ?? []) as unknown as {
    emoji: string | null;
    cree_le: string;
    capsule: { titre: string | null; teaser: string | null; auteur: { prenom: string } | null } | null;
  }[];
}

export async function rappelsAVenir() {
  const { data } = await db()
    .from("rappels")
    .select("*, destinataire:membres!rappels_membre_id_fkey(prenom)")
    .is("envoye_le", null)
    .order("envoyer_le", { ascending: true })
    .limit(30);
  return (data ?? []) as unknown as {
    id: string;
    titre: string;
    corps: string | null;
    envoyer_le: string;
    destinataire: { prenom: string } | null;
  }[];
}

export type FiltreCapsules = "tout" | "reserve" | "programmees" | "publiees" | "feuilleton";

/** La bibliothèque de l'admin : tout ce qui a été déposé, filtrable. */
export async function capsulesFiltrees(
  filtre: FiltreCapsules = "tout",
  limite = 200,
): Promise<CapsuleAffichee[]> {
  let requete = db().from("capsules").select(CHAMPS);

  if (filtre === "reserve") {
    requete = requete.eq("destination", "reserve").is("piochee_le", null);
  } else if (filtre === "programmees") {
    requete = requete.eq("etat", "programmee");
  } else if (filtre === "publiees") {
    requete = requete.eq("etat", "publiee");
  } else if (filtre === "feuilleton") {
    requete = requete.eq("type", "episode");
  }

  const { data } = await requete.order("cree_le", { ascending: false }).limit(limite);
  return avecMedias((data ?? []) as CapsuleAffichee[]);
}

// ---------------------------------------------------------------------------
// Le triple témoignage collaboratif
// ---------------------------------------------------------------------------

export type TemoignageEnCours = CapsuleAffichee & {
  question: string;
  manquants: string[];
  aRepondu: boolean;
};

/** Qui doit répondre pour qu'un témoignage soit complet. */
async function participants(): Promise<{ id: string; prenom: string }[]> {
  const { data } = await db()
    .from("membres")
    .select("id, prenom")
    .eq("role", "enfant")
    .eq("attendu_temoignages", true)
    .eq("actif", true);
  return (data ?? []) as { id: string; prenom: string }[];
}

/**
 * Les témoignages encore au brouillon, avec qui manque à l'appel.
 * Ceux qui attendent ta réponse remontent en premier.
 */
export async function temoignagesEnCours(membreId: string): Promise<TemoignageEnCours[]> {
  const [{ data }, attendus] = await Promise.all([
    db()
      .from("capsules")
      .select(CHAMPS)
      .eq("type", "temoignage")
      .eq("etat", "brouillon")
      .order("cree_le", { ascending: false }),
    participants(),
  ]);

  const capsules = (data ?? []) as CapsuleAffichee[];

  const { data: reponses } = await db()
    .from("temoignages")
    .select("capsule_id, auteur_id")
    .in("capsule_id", capsules.length ? capsules.map((c) => c.id) : ["-"]);

  const parCapsule = new Map<string, Set<string>>();
  for (const r of reponses ?? []) {
    const cle = r.capsule_id as string;
    if (!parCapsule.has(cle)) parCapsule.set(cle, new Set());
    parCapsule.get(cle)!.add(r.auteur_id as string);
  }

  return capsules
    .map((capsule) => {
      const ontRepondu = parCapsule.get(capsule.id) ?? new Set<string>();
      return {
        ...capsule,
        question: (capsule.payload?.question as string) ?? "Sans question",
        manquants: attendus.filter((p) => !ontRepondu.has(p.id)).map((p) => p.prenom),
        aRepondu: ontRepondu.has(membreId),
      };
    })
    .sort((a, b) => Number(a.aRepondu) - Number(b.aRepondu));
}

/** Combien attendent ta réponse — pour la pastille du tableau de bord. */
export async function temoignagesAttendus(membreId: string): Promise<number> {
  const enCours = await temoignagesEnCours(membreId);
  return enCours.filter((t) => !t.aRepondu).length;
}

// ---------------------------------------------------------------------------
// La conversation
// ---------------------------------------------------------------------------

export type MessageDuFil = Message & {
  capsule: { titre: string | null; teaser: string | null } | null;
};

/** Toute la conversation, du plus ancien au plus récent. */
export async function fil(limite = 150): Promise<MessageDuFil[]> {
  const { data } = await db()
    .from("messages")
    .select("*, auteur:membres(prenom, couleur), capsule:capsules(titre, teaser)")
    .order("cree_le", { ascending: false })
    .limit(limite);

  const messages = ((data ?? []) as unknown as MessageDuFil[]).reverse();

  return Promise.all(
    messages.map(async (m) => ({ ...m, media_url: await urlSignee(m.media_chemin) })),
  );
}

/** Ce qu'elle a écrit et que personne n'a encore lu. */
export async function motsNonLus(): Promise<number> {
  const { data: maman } = await db()
    .from("membres")
    .select("id")
    .eq("role", "maman")
    .maybeSingle();

  if (!maman) return 0;

  const { count } = await db()
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("auteur_id", maman.id)
    .is("lu_le", null);

  return count ?? 0;
}

/**
 * Ouvrir le fil vaut lecture. C'est une simple écriture, pas une action
 * serveur : on l'appelle pendant le rendu de la page.
 */
export async function marquerFilLu(): Promise<void> {
  const { data: maman } = await db()
    .from("membres")
    .select("id")
    .eq("role", "maman")
    .maybeSingle();

  if (!maman) return;

  await db()
    .from("messages")
    .update({ lu_le: new Date().toISOString() })
    .eq("auteur_id", maman.id)
    .is("lu_le", null);
}
