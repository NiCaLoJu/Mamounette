/**
 * Une teinte pastel par rubrique de l'admin. Le menu, l'en-tête de la page et
 * ses encadrés partagent la même couleur : on sait où on est sans lire.
 */
export type Teinte = {
  fond: string;
  encre: string;
  bordure: string;
};

export const TEINTES: Record<string, Teinte> = {
  abricot: { fond: "#ffe9d6", encre: "#8a4b1f", bordure: "#f8d3b4" },
  rose: { fond: "#ffd9e4", encre: "#9c3557", bordure: "#f6bcd0" },
  lilas: { fond: "#e6dcff", encre: "#52398f", bordure: "#cfc0f5" },
  menthe: { fond: "#d6f0e4", encre: "#1f6b4c", bordure: "#b3e2cd" },
  ciel: { fond: "#d9ecff", encre: "#1f4f82", bordure: "#b6d8f7" },
  sable: { fond: "#fff0c9", encre: "#8a6a12", bordure: "#f3e0a3" },
  corail: { fond: "#ffdfd1", encre: "#9c4a2a", bordure: "#f7c4ae" },
  lagon: { fond: "#d9f2f7", encre: "#14657a", bordure: "#b3e3ed" },
  prune: { fond: "#f3ddf1", encre: "#7a3d72", bordure: "#e5c3e2" },
  brume: { fond: "#e6e9ee", encre: "#4a5568", bordure: "#d0d6df" },
};

export type Section = {
  href: string;
  libelle: string;
  emoji: string;
  teinte: keyof typeof TEINTES;
};

export const SECTIONS: Section[] = [
  { href: "/admin", libelle: "Tableau de bord", emoji: "🏠", teinte: "abricot" },
  { href: "/admin/deposer", libelle: "Déposer", emoji: "✨", teinte: "rose" },
  { href: "/admin/capsules", libelle: "Capsules", emoji: "🗂️", teinte: "lilas" },
  { href: "/admin/temoignages", libelle: "Témoignages", emoji: "🕵️", teinte: "menthe" },
  { href: "/admin/fil", libelle: "Le fil", emoji: "💬", teinte: "ciel" },
  { href: "/admin/calendrier", libelle: "Dates", emoji: "📅", teinte: "sable" },
  { href: "/admin/bons", libelle: "Bons", emoji: "🎟️", teinte: "corail" },
  { href: "/admin/projets", libelle: "Projets", emoji: "🌍", teinte: "lagon" },
  { href: "/admin/rappels", libelle: "Rappels", emoji: "⏰", teinte: "prune" },
  { href: "/admin/liens", libelle: "Liens", emoji: "🔑", teinte: "brume" },
];

export function teinteDe(cle: keyof typeof TEINTES): Teinte {
  return TEINTES[cle];
}
