"use client";

import { useRef, useState } from "react";

/**
 * L'enregistreur de notes vocales. Entendre vos voix vaut mieux qu'un texte,
 * donc il fallait que ce soit le geste le plus simple de l'app.
 */
export default function EnregistreurVocal({
  onEnregistre,
}: {
  onEnregistre: (fichier: File, duree: number) => void;
}) {
  const [enregistre, setEnregistre] = useState(false);
  const [apercu, setApercu] = useState<string | null>(null);
  const [secondes, setSecondes] = useState(0);

  const recorder = useRef<MediaRecorder | null>(null);
  const morceaux = useRef<Blob[]>([]);
  const chrono = useRef<ReturnType<typeof setInterval> | null>(null);

  async function demarrer() {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(flux);
    morceaux.current = [];

    mr.ondataavailable = (evenement) => morceaux.current.push(evenement.data);
    mr.onstop = () => {
      const blob = new Blob(morceaux.current, { type: "audio/webm" });
      const fichier = new File([blob], "vocal.webm", { type: "audio/webm" });
      setApercu(URL.createObjectURL(blob));
      onEnregistre(fichier, secondes);
      flux.getTracks().forEach((piste) => piste.stop());
    };

    mr.start();
    recorder.current = mr;
    setEnregistre(true);
    setSecondes(0);
    chrono.current = setInterval(() => setSecondes((s) => s + 1), 1000);
  }

  function arreter() {
    recorder.current?.stop();
    setEnregistre(false);
    if (chrono.current) clearInterval(chrono.current);
  }

  return (
    <div className="border-bordure flex flex-col gap-3 rounded-2xl border bg-white p-4">
      <button
        type="button"
        onClick={enregistre ? arreter : demarrer}
        className={`rounded-full px-4 py-3 text-sm text-white transition active:scale-[0.98] ${
          enregistre ? "bg-encre" : "bg-rose"
        }`}
      >
        {enregistre ? `⏹ Arrêter (${secondes}s)` : "🎙️ Enregistrer un vocal"}
      </button>

      {apercu && <audio controls src={apercu} className="w-full" />}
    </div>
  );
}
