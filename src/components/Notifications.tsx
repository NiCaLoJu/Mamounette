"use client";

import { useEffect, useState } from "react";

/** Convertit la clé VAPID en tableau d'octets, comme l'exige l'API Push. */
function versOctets(base64: string): Uint8Array<ArrayBuffer> {
  const complet = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const brut = atob(complet);
  const octets = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

type Etat = "chargement" | "a-installer" | "a-autoriser" | "prete" | "impossible";

/**
 * Sur iPhone, les notifications web n'existent que si l'app est installée sur
 * l'écran d'accueil. Ce bloc guide l'installation puis demande l'autorisation —
 * c'est ce qu'on fera avec elle le jour de la découverte.
 */
export default function Notifications() {
  const [etat, setEtat] = useState<Etat>("chargement");

  useEffect(() => {
    const installee =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Safari iOS expose l'information autrement.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEtat(installee ? "impossible" : "a-installer");
      return;
    }

    if (!installee) {
      setEtat("a-installer");
      return;
    }

    setEtat(Notification.permission === "granted" ? "prete" : "a-autoriser");
  }, []);

  async function autoriser() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const enregistrement = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const abonnement = await enregistrement.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: versOctets(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
    });

    await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(abonnement.toJSON()),
    });

    setEtat("prete");
  }

  if (etat === "chargement" || etat === "prete" || etat === "impossible") return null;

  if (etat === "a-installer") {
    return (
      <aside className="border-bordure mb-5 rounded-3xl border border-dashed p-4 text-sm">
        <p className="mb-1 font-medium">Mets-moi sur ton écran d&apos;accueil 💛</p>
        <p className="text-encre-douce">
          Appuie sur le bouton <strong>Partager</strong> en bas de Safari, puis sur{" "}
          <strong>Sur l&apos;écran d&apos;accueil</strong>. Tu me retrouveras comme une vraie
          application — et je pourrai te prévenir quand il y a quelque chose.
        </p>
      </aside>
    );
  }

  return (
    <aside className="bg-rose-clair mb-5 rounded-3xl p-4 text-sm">
      <p className="mb-2 font-medium">Veux-tu être prévenue ?</p>
      <p className="text-encre-douce mb-3">
        Une seule fois par jour au maximum, jamais plus. Promis.
      </p>
      <button
        onClick={autoriser}
        className="bg-rose w-full rounded-full py-2.5 text-white transition active:scale-[0.98]"
      >
        Oui, préviens-moi
      </button>
    </aside>
  );
}
