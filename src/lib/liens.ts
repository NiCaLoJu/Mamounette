/** L'identifiant d'une vidéo YouTube, quelle que soit la forme du lien. */
export function idYoutube(url: string): string | null {
  const motifs = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const motif of motifs) {
    const trouve = url.match(motif);
    if (trouve) return trouve[1];
  }
  return null;
}

/** « open.spotify.com » — pour afficher la provenance d'un lien. */
export function domaine(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
