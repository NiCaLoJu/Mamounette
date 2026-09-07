/** Une couleur d'auteur, éclaircie pour servir de fond. */
export function avecAlpha(hex: string, alpha: number): string {
  const propre = hex.replace("#", "");
  const r = parseInt(propre.slice(0, 2), 16);
  const v = parseInt(propre.slice(2, 4), 16);
  const b = parseInt(propre.slice(4, 6), 16);
  return `rgba(${r}, ${v}, ${b}, ${alpha})`;
}

/** Bonjour, bel après-midi ou bonsoir, selon l'heure à Paris. */
export function salutation(): string {
  const heure = Number(
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );

  if (heure < 12) return "Bonjour";
  if (heure < 18) return "Bel après-midi";
  return "Bonsoir";
}
