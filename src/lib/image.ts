/**
 * Redimensionne et recompresse une photo dans le navigateur.
 * Une photo d'iPhone fait 4 Mo ; après passage ici, environ 300 Ko —
 * ce qui économise le stockage gratuit et accélère l'affichage chez elle.
 */
export async function compresser(fichier: File, cote = 1600, qualite = 0.82): Promise<File> {
  if (!fichier.type.startsWith("image/")) return fichier;

  try {
    return await recompresser(fichier, cote, qualite);
  } catch {
    // Un format que ce navigateur ne sait pas décoder (HEIC ailleurs que sur
    // iPhone, par exemple). On envoie l'original plutôt que de tout bloquer.
    return fichier;
  }
}

async function recompresser(fichier: File, cote: number, qualite: number): Promise<File> {
  const bitmap = await createImageBitmap(fichier);
  const echelle = Math.min(1, cote / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const toile = document.createElement("canvas");
  toile.width = largeur;
  toile.height = hauteur;

  const contexte = toile.getContext("2d");
  if (!contexte) return fichier;
  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);

  const blob = await new Promise<Blob | null>((resoudre) =>
    toile.toBlob(resoudre, "image/jpeg", qualite),
  );

  if (!blob) return fichier;
  return new File([blob], fichier.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}
