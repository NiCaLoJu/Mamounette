"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Safari sur iPhone n'enregistre qu'en audio/mp4 ; Chrome et Firefox préfèrent
 * webm. On demande donc au navigateur ce qu'il sait faire, dans cet ordre.
 */
function formatDisponible(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  const candidats = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"];
  return candidats.find((type) => MediaRecorder.isTypeSupported(type));
}

/** L'enregistreur de notes vocales — le geste doit rester le plus simple de l'app. */
export default function EnregistreurVocal({
  onEnregistre,
}: {
  onEnregistre: (fichier: File, duree: number) => void;
}) {
  const [enregistre, setEnregistre] = useState(false);
  const [apercu, setApercu] = useState<string | null>(null);
  const [secondes, setSecondes] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const morceaux = useRef<Blob[]>([]);
  const chrono = useRef<ReturnType<typeof setInterval> | null>(null);
  // Le compteur est aussi tenu ici : la fermeture de `onstop` ne verrait
  // jamais la valeur à jour de l'état React.
  const duree = useRef(0);

  useEffect(() => {
    return () => {
      if (chrono.current) clearInterval(chrono.current);
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  async function demarrer() {
    setErreur(null);

    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      const format = formatDisponible();
      const mr = new MediaRecorder(flux, format ? { mimeType: format } : undefined);

      morceaux.current = [];
      duree.current = 0;

      mr.ondataavailable = (evenement) => {
        if (evenement.data.size > 0) morceaux.current.push(evenement.data);
      };

      mr.onstop = () => {
        // Le type réel vient de l'enregistreur, jamais d'une supposition.
        const type = mr.mimeType || format || "audio/mp4";
        const blob = new Blob(morceaux.current, { type });
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";

        setApercu(URL.createObjectURL(blob));
        onEnregistre(new File([blob], `vocal.${extension}`, { type }), duree.current);
        flux.getTracks().forEach((piste) => piste.stop());
      };

      mr.start();
      recorder.current = mr;
      setEnregistre(true);
      setSecondes(0);

      chrono.current = setInterval(() => {
        duree.current += 1;
        setSecondes(duree.current);
      }, 1000);
    } catch (e) {
      const nom = (e as Error).name;
      setErreur(
        nom === "NotAllowedError"
          ? "Le micro est bloqué. Autorise-le dans les réglages de Safari pour ce site."
          : "Impossible d'accéder au micro sur cet appareil.",
      );
    }
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

      {erreur && <p className="text-rose text-sm">{erreur}</p>}
      {apercu && <audio controls src={apercu} className="w-full" />}
    </div>
  );
}
