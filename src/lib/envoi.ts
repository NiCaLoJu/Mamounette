import { createClient } from "@supabase/supabase-js";
import { preparerEnvoi } from "./actions";

/** Supabase refuse les envois simples au-delà de 50 Mo. On s'arrête avant. */
export const TAILLE_MAX = 45 * 1024 * 1024;

/**
 * L'extension déduite du type réel du fichier, pas de son nom : sur iPhone,
 * un enregistrement s'appelle « blob » et une photo peut arriver en HEIC.
 */
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/aac": "aac",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

function extensionDe(fichier: File): string {
  const type = fichier.type.split(";")[0].trim().toLowerCase();
  if (EXTENSIONS[type]) return EXTENSIONS[type];

  const depuisLeNom = fichier.name.includes(".")
    ? fichier.name.split(".").pop()?.toLowerCase()
    : null;

  return depuisLeNom && depuisLeNom.length <= 5 ? depuisLeNom : "bin";
}

/**
 * Envoie un fichier du navigateur vers Supabase, sans passer par Vercel.
 * Renvoie le chemin à enregistrer dans la capsule.
 */
export async function envoyerFichier(fichier: File, prefixe: string): Promise<string> {
  if (fichier.size === 0) throw new Error("Ce fichier est vide.");

  if (fichier.size > TAILLE_MAX) {
    const mo = Math.round(fichier.size / 1024 / 1024);
    throw new Error(
      `Ce fichier fait ${mo} Mo, c'est trop lourd (45 Mo maximum). ` +
        `Pour une vidéo, quinze secondes suffisent largement.`,
    );
  }

  const { chemin, token } = await preparerEnvoi(prefixe, extensionDe(fichier));

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await client.storage
    .from("media")
    .uploadToSignedUrl(chemin, token, fichier, { contentType: fichier.type });

  if (error) throw new Error(`L'envoi a échoué : ${error.message}`);
  return chemin;
}
