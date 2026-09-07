import type { Message } from "@/lib/donnees";

/** La conversation, en bulles : les siennes à droite, les leurs à gauche. */
export default function FilMessages({
  messages,
  moi,
  vide,
}: {
  messages: (Message & { capsule?: { titre: string | null; teaser: string | null } | null })[];
  moi: string;
  vide?: string;
}) {
  if (messages.length === 0) {
    return <p className="text-encre-douce text-sm">{vide ?? "Rien encore."}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((message) => {
        const demoi = message.auteur_id === moi;

        return (
          <li key={message.id} className={`flex ${demoi ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] flex-col gap-1.5 rounded-3xl px-4 py-2.5 ${
                demoi ? "bg-rose text-white" : "border-bordure border bg-white"
              }`}
            >
              {!demoi && message.auteur && (
                <span
                  className="text-xs font-medium"
                  style={{ color: message.auteur.couleur }}
                >
                  {message.auteur.prenom}
                </span>
              )}

              {message.capsule && (
                <span className={`text-xs ${demoi ? "opacity-70" : "text-encre-douce"}`}>
                  à propos de « {message.capsule.titre ?? message.capsule.teaser ?? "une capsule"} »
                </span>
              )}

              {message.texte && (
                <span className="whitespace-pre-wrap text-sm">{message.texte}</span>
              )}

              {message.media_url && (
                <audio controls preload="metadata" src={message.media_url} className="w-full" />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
