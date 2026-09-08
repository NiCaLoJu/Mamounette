export type RoleMembre = "maman" | "enfant";

export type Membre = {
  id: string;
  prenom: string;
  role: RoleMembre;
  couleur: string;
  token: string;
  actif: boolean;
};

export type TypeCapsule =
  | "anecdote"
  | "photo"
  | "vocal"
  | "video"
  | "lien"
  | "quiz"
  | "temoignage"
  | "episode";

export type DestinationCapsule = "rendezvous" | "reserve" | "direct";
export type EtatCapsule = "brouillon" | "programmee" | "publiee";

export type Capsule = {
  id: string;
  type: TypeCapsule;
  auteur_id: string;
  titre: string | null;
  teaser: string | null;
  corps: string | null;
  media_chemin: string | null;
  media_duree: number | null;
  lien_url: string | null;
  payload: Record<string, unknown>;
  destination: DestinationCapsule;
  rendezvous_id: string | null;
  serie_id: string | null;
  episode_num: number | null;
  etat: EtatCapsule;
  publiee_le: string | null;
  ouverte_le: string | null;
  piochee_le: string | null;
  cree_le: string;
};

export type RendezVous = {
  id: string;
  date: string;
  referent_id: string | null;
};

export type Bon = {
  id: string;
  auteur_id: string;
  titre: string;
  description: string | null;
  etat: "disponible" | "reclame" | "honore";
  reclame_le: string | null;
  honore_le: string | null;
};

export type Projet = {
  id: string;
  auteur_id: string;
  titre: string;
  description: string | null;
  media_chemin: string | null;
  envie: boolean;
  debut: string | null;
  fin: string | null;
};

/** Libellés affichés pour chaque type de capsule. */
export const LIBELLES_TYPE: Record<TypeCapsule, string> = {
  anecdote: "Anecdote",
  photo: "Photo",
  vocal: "Note vocale",
  video: "Micro-vidéo",
  lien: "Sélection détente",
  quiz: "Quiz",
  temoignage: "Triple témoignage",
  episode: "Épisode",
};

export const EMOJIS_TYPE: Record<TypeCapsule, string> = {
  anecdote: "✏️",
  photo: "📷",
  vocal: "🎙️",
  video: "🎬",
  lien: "🎧",
  quiz: "❓",
  temoignage: "🕵️",
  episode: "📖",
};
