import webpush from "web-push";
import { db } from "./supabase";
import { aujourdhui } from "./dates";

let configure = false;

function preparer(): boolean {
  if (configure) return true;

  const publique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privee = process.env.VAPID_PRIVATE_KEY;
  if (!publique || !privee) return false;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contact@example.com",
    publique,
    privee,
  );
  configure = true;
  return true;
}

type Options = { url?: string; destinataire?: string; sauf?: string };

/** Envoie à tous les appareils d'un membre. Un abonnement mort est supprimé. */
async function envoyerA(membreId: string, titre: string, corps: string, url = "/") {
  if (!preparer()) return;

  const { data: abonnements } = await db()
    .from("abonnements_push")
    .select("*")
    .eq("membre_id", membreId);

  if (!abonnements?.length) return;

  const charge = JSON.stringify({ titre, corps, url });

  await Promise.all(
    abonnements.map(async (a) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: a.endpoint as string,
            keys: { p256dh: a.p256dh as string, auth: a.auth as string },
          },
          charge,
        );
        await db().from("notifications_log").insert({ membre_id: membreId, titre, succes: true });
      } catch (erreur: unknown) {
        const statut = (erreur as { statusCode?: number }).statusCode;

        // 404/410 : l'appareil a désinstallé l'app ou révoqué l'autorisation.
        if (statut === 404 || statut === 410) {
          await db().from("abonnements_push").delete().eq("id", a.id as string);
        }

        await db().from("notifications_log").insert({
          membre_id: membreId,
          titre,
          succes: false,
          detail: String(erreur),
        });
      }
    }),
  );
}

/**
 * Vers maman, avec les garde-fous : interrupteur global et plafond quotidien.
 * Le pire scénario pour ce projet, c'est une app qui devient bruyante.
 */
export async function notifierMaman(
  titre: string,
  corps: string,
  url = "/",
  options: { plafond?: boolean } = {},
) {
  const { data: reglages } = await db().from("reglages").select("*").maybeSingle();
  if (!reglages?.notifications_actives) return;

  const { data: maman } = await db()
    .from("membres")
    .select("id")
    .eq("role", "maman")
    .maybeSingle();

  if (!maman) return;

  // Le plafond bride les envois automatiques. Une réponse d'un de ses fils à
  // un message qu'elle vient d'écrire passe toujours.
  if (options.plafond !== false) {
    const { count } = await db()
      .from("notifications_log")
      .select("id", { count: "exact", head: true })
      .eq("membre_id", maman.id)
      .eq("succes", true)
      .gte("envoye_le", `${aujourdhui()}T00:00:00`);

    if ((count ?? 0) >= (reglages.max_notifs_par_jour as number)) return;
  }

  await envoyerA(maman.id as string, titre, corps, url);
}

/** Vers les garçons — ou un seul d'entre eux. Pas de plafond ici. */
export async function notifierEnfants(titre: string, corps: string, options: Options = {}) {
  if (options.destinataire) {
    await envoyerA(options.destinataire, titre, corps, options.url ?? "/admin");
    return;
  }

  const { data: enfants } = await db().from("membres").select("id").eq("role", "enfant");

  await Promise.all(
    (enfants ?? [])
      .filter((e) => e.id !== options.sauf)
      .map((e) => envoyerA(e.id as string, titre, corps, options.url ?? "/admin")),
  );
}

/** Les rappels programmés dont l'heure est passée. Appelé par la tâche planifiée. */
export async function traiterRappels() {
  const { data: rappels } = await db()
    .from("rappels")
    .select("*")
    .is("envoye_le", null)
    .lte("envoyer_le", new Date().toISOString())
    .limit(20);

  for (const rappel of rappels ?? []) {
    if (rappel.membre_id) {
      await envoyerA(
        rappel.membre_id as string,
        rappel.titre as string,
        (rappel.corps as string) ?? "",
        (rappel.url as string) ?? "/",
      );
    } else {
      await notifierEnfants(rappel.titre as string, (rappel.corps as string) ?? "");
    }

    await db()
      .from("rappels")
      .update({ envoye_le: new Date().toISOString() })
      .eq("id", rappel.id as string);
  }

  return (rappels ?? []).length;
}
