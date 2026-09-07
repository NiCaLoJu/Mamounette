// Service worker minimal : il ne sert qu'aux notifications.
// Pas de mise en cache — l'app doit toujours montrer le contenu le plus frais.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (evenement) => evenement.waitUntil(self.clients.claim()));

self.addEventListener("push", (evenement) => {
  let charge = { titre: "Mamounette", corps: "", url: "/" };

  try {
    charge = { ...charge, ...evenement.data.json() };
  } catch {
    charge.corps = evenement.data ? evenement.data.text() : "";
  }

  evenement.waitUntil(
    self.registration.showNotification(charge.titre, {
      body: charge.corps,
      icon: "/icone-192.png",
      badge: "/icone-192.png",
      data: { url: charge.url },
    }),
  );
});

self.addEventListener("notificationclick", (evenement) => {
  evenement.notification.close();
  const cible = evenement.notification.data?.url || "/";

  evenement.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenetres) => {
      for (const fenetre of fenetres) {
        if (fenetre.url.includes(cible) && "focus" in fenetre) return fenetre.focus();
      }
      return self.clients.openWindow(cible);
    }),
  );
});
