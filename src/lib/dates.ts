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
