import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { aujourdhui, ecartJours } from "@/lib/dates";
import { notifierEnfants, notifierMaman, traiterRappels } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const CAPSULES_MINIMUM = 3; // en dessous, on complète depuis la réserve

/**
 * La tâche planifiée, appelée toutes les 15 minutes par Supabase (pg_cron).
 * Elle fait quatre choses : publier le jour J, remplir un jour vide depuis la
 * réserve, prévenir maman le matin, et rappeler aux garçons de déposer.
 */
export async function GET(requete: Request) {
  const secret = process.env.CRON_SECRET;
  const fourni = new URL(requete.url).searchParams.get("secret");
  const entete = requete.headers.get("authorization");

  if (!secret || (fourni !== secret && entete !== `Bearer ${secret}`)) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const journal: string[] = [];
  const jour = aujourdhui();

  const { data: reglages } = await db().from("reglages").select("*").maybeSingle();

  const { data: rdvJour } = await db()
    .from("rendezvous")
    .select("*")
    .eq("date", jour)
    .maybeSingle();

  // 1. Le jour J : on publie ce qui était programmé.
  if (rdvJour) {
    const { data: publiees } = await db()
      .from("capsules")
      .update({ etat: "publiee", publiee_le: new Date().toISOString() })
      .eq("rendezvous_id", rdvJour.id)
      .eq("etat", "programmee")
      .select("id");

    if (publiees?.length) journal.push(`${publiees.length} capsule(s) publiée(s)`);

    // 2. Le filet : si la journée est maigre, on pioche dans la réserve.
    const { count: dispo } = await db()
      .from("capsules")
      .select("id", { count: "exact", head: true })
      .eq("rendezvous_id", rdvJour.id)
      .eq("etat", "publiee");

    const manque = CAPSULES_MINIMUM - (dispo ?? 0);
    if (manque > 0) {
      const { data: reserve } = await db()
        .from("capsules")
        .select("id")
        .eq("destination", "reserve")
        .neq("etat", "brouillon")
        .is("piochee_le", null)
        .limit(manque);

      for (const c of reserve ?? []) {
        await db()
          .from("capsules")
          .update({
            rendezvous_id: rdvJour.id,
            destination: "rendezvous",
            etat: "publiee",
            publiee_le: new Date().toISOString(),
          })
          .eq("id", c.id as string);
      }

      if (reserve?.length) journal.push(`${reserve.length} capsule(s) tirée(s) de la réserve`);
    }

    // 3. Le mot du matin, une seule fois, à l'heure choisie.
    const heureParis = Number(
      new Intl.DateTimeFormat("fr-FR", {
        timeZone: reglages?.fuseau ?? "Europe/Paris",
        hour: "2-digit",
        hour12: false,
      }).format(new Date()),
    );

    if (heureParis >= (reglages?.heure_notif_jour_j ?? 9)) {
      await notifierMaman(
        "Il y a quelque chose pour toi 💌",
        "Tes garçons ont préparé la journée.",
      );
      journal.push("notification du jour J envoyée (ou déjà envoyée)");
    }
  }

  // 4. Le rappel aux garçons : trois jours avant, si rien n'est prêt.
  const { data: prochains } = await db()
    .from("rendezvous")
    .select("*")
    .gte("date", jour)
    .order("date", { ascending: true })
    .limit(3);

  for (const rdv of prochains ?? []) {
    if (ecartJours(jour, rdv.date as string) !== 3) continue;

    const { count } = await db()
      .from("capsules")
      .select("id", { count: "exact", head: true })
      .eq("rendezvous_id", rdv.id);

    if ((count ?? 0) < CAPSULES_MINIMUM) {
      await notifierEnfants(
        "⏳ Dans 3 jours",
        `Il n'y a que ${count ?? 0} capsule(s) de prêtes. C'est le moment.`,
      );
      journal.push("rappel envoyé aux garçons");
    }
  }

  // 5. Les rappels programmés à la main.
  const envoyes = await traiterRappels();
  if (envoyes) journal.push(`${envoyes} rappel(s) programmé(s) envoyé(s)`);

  return NextResponse.json({ jour, journal });
}
