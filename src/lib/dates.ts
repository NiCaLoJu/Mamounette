export const FUSEAU = "Europe/Paris";

/** La date du jour à Paris, au format YYYY-MM-DD. */
export function aujourdhui(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** « mardi 14 octobre » */
export function enLettres(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** « 14 oct. 2025 » */
export function enCourt(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** Nombre de jours entre deux dates ISO (positif si `b` est après `a`). */
export function ecartJours(a: string, b: string): number {
  const ms = Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** « dans 3 jours », « aujourd'hui », « il y a 2 jours » */
export function enRelatif(iso: string): string {
  const jours = ecartJours(aujourdhui(), iso);
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return "demain";
  if (jours === -1) return "hier";
  if (jours > 0) return `dans ${jours} jours`;
  return `il y a ${-jours} jours`;
}

export type Rebours = {
  /** Ce qu'on affiche en gros : « dans 34 jours », « c'est demain ! »… */
  libelle: string;
  /** Passé, en cours, ou encore devant. */
  etat: "attente" | "maintenant" | "passe";
  /** Nombre de jours restants, pour la jauge. Négatif une fois la date passée. */
  jours: number;
};

/**
 * Le compte à rebours d'un projet. Un intervalle (un week-end, une semaine)
 * reste « maintenant » du premier au dernier jour.
 */
export function compteARebours(debut: string, fin?: string | null): Rebours {
  const jour = aujourdhui();
  const jours = ecartJours(jour, debut);
  const dernier = fin ?? debut;

  if (jours <= 0 && ecartJours(jour, dernier) >= 0) {
    return { libelle: "C'est maintenant 🎉", etat: "maintenant", jours: 0 };
  }

  if (ecartJours(jour, dernier) < 0) {
    return { libelle: "Déjà vécu 💛", etat: "passe", jours };
  }

  if (jours === 1) return { libelle: "C'est demain !", etat: "attente", jours };
  if (jours <= 7) return { libelle: `Dans ${jours} jours`, etat: "attente", jours };

  // Au-delà de deux mois, le compte en jours devient décourageant.
  if (jours <= 60) return { libelle: `Dans ${jours} jours`, etat: "attente", jours };

  const mois = Math.round(jours / 30);
  return { libelle: `Dans ${mois} mois`, etat: "attente", jours };
}

/** « du 12 au 15 juin » ou « le 12 juin » */
export function intervalleEnLettres(debut: string, fin?: string | null): string {
  if (!fin || fin === debut) return `le ${enLettresSansJour(debut)}`;
  return `du ${enLettresSansJour(debut)} au ${enLettresSansJour(fin)}`;
}

/** « 12 juin » — sans le jour de la semaine. */
export function enLettresSansJour(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso}T12:00:00Z`));
}
