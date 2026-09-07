import { createClient } from "@supabase/supabase-js";

/**
 * Client serveur avec la service role key.
 * RLS étant activée sans policy, c'est le seul chemin d'accès aux données —
 * il ne doit donc jamais être importé depuis un composant client.
 */
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase n'est pas configuré : renseigner NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** URL signée pour un fichier du bucket privé. */
export async function urlSignee(chemin: string | null, secondes = 3600) {
  if (!chemin) return null;
  const { data } = await db().storage.from("media").createSignedUrl(chemin, secondes);
  return data?.signedUrl ?? null;
}
