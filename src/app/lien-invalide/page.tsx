export default function LienInvalide() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-4xl">🔑</p>
      <h1 className="titre text-2xl">Ce lien ne fonctionne pas</h1>
      <p className="text-encre-douce text-sm">
        Il a peut-être été recopié en partie. Demande à Nicolas de te le renvoyer.
      </p>
    </main>
  );
}
