import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { membreCourant } from "@/lib/auth";

/** Enregistre l'appareil qui vient d'accepter les notifications. */
export async function POST(requete: Request) {
  const membre = await membreCourant();
  if (!membre) return NextResponse.json({ erreur: "Non identifié" }, { status: 401 });

  const abonnement = await requete.json();
  if (!abonnement?.endpoint || !abonnement?.keys) {
    return NextResponse.json({ erreur: "Abonnement invalide" }, { status: 400 });
  }

  const { error } = await db().from("abonnements_push").upsert(
    {
      membre_id: membre.id,
      endpoint: abonnement.endpoint,
      p256dh: abonnement.keys.p256dh,
      auth: abonnement.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Retire l'appareil (elle a coupé les notifications). */
export async function DELETE(requete: Request) {
  const membre = await membreCourant();
  if (!membre) return NextResponse.json({ erreur: "Non identifié" }, { status: 401 });

  const { endpoint } = await requete.json();
  await db().from("abonnements_push").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
