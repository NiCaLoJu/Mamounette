# Mamounette

Une application privée pour maman : ses garçons y déposent des souvenirs, des
photos, des vocaux et des bêtises ; elle les découvre le jour de chaque
rendez-vous, une case à la fois.

Deux espaces, une seule application :

- **Côté maman** — la journée du jour en cases à ouvrir, le fil de discussion,
  la pioche, ses petits bonheurs, ses bons pour…, la boîte à projets. Elle peut
  répondre sous chaque capsule ou écrire quand elle veut, au clavier ou à la
  voix.
- **Côté admin** (Nicolas, Foufou, Loulou, et Namou s'il le souhaite) — déposer
  des capsules, les relire et les corriger, tenir le calendrier, garnir la
  réserve, programmer des rappels.

Il n'est question de rien d'autre que d'eux. Aucun suivi de symptômes, aucune
mention du traitement : les dates ne servent qu'à savoir quel jour ouvrir une
journée, et elles n'apparaissent jamais de son côté.

## Les idées qui structurent le code

- **La capsule.** Anecdote, photo, vocal, micro-vidéo, lien, quiz, triple
  témoignage, épisode de feuilleton : un seul objet en base, huit affichages.
  Ajouter un type ne casse rien.
- **Le triple témoignage se joue à trois.** L'un lance la question avec sa
  version, les deux autres sont prévenus, et la capsule reste au brouillon tant
  qu'il manque une voix. L'application mélange ensuite les réponses et tient
  elle-même la solution : personne n'a à écrire « qui est qui ».
- **La réserve.** Des capsules sans date, déposées d'avance. Elles alimentent la
  pioche et **complètent automatiquement une journée trop maigre** — c'est le
  filet du projet : le vrai risque n'est pas technique, c'est qu'un jour arrive
  sans que personne n'ait rien déposé.
- **Les rubriques vides n'existent pas.** Chez elle, un onglet n'apparaît que
  lorsqu'il a quelque chose à montrer. Une icône qui n'ouvre sur rien est une
  petite déception, et elles seront nombreuses au démarrage.
- **Le seul compte à rebours de l'application va vers quelque chose d'agréable.**
  Un projet peut porter une date ou un intervalle — un week-end, une semaine —
  et son approche s'affiche chez elle. Rien d'autre n'est jamais décompté.
- **Le plafond de notifications.** Une par jour pour elle, au maximum. Une
  application qui devient bruyante est une application qu'on désinstalle. Seule
  exception : la réponse d'un de ses fils à un message qu'elle vient d'écrire
  passe toujours — le plafond bride l'automatique, pas la conversation.

## Installation

### 1. Supabase

Créer un projet (région Europe), puis exécuter dans l'éditeur SQL, dans l'ordre :

| Fichier | Ce qu'il fait |
|---|---|
| `supabase/migrations/0001_init.sql` | les tables |
| `supabase/migrations/0002_storage.sql` | le bucket privé des médias |
| `supabase/migrations/0003_seed.sql` | les cinq personnes et leurs liens secrets |
| `supabase/migrations/0004_cron.sql` | la tâche planifiée (après le déploiement) |
| `supabase/migrations/0005_media.sql` | les formats de fichiers que produisent les téléphones |
| `supabase/migrations/0006_temoignages.sql` | le triple témoignage collaboratif |
| `supabase/migrations/0007_messages.sql` | la conversation dans les deux sens |
| `supabase/migrations/0008_projets_dates.sql` | les dates de projets et leur compte à rebours |

Récupérer ensuite les liens d'accès :

```sql
select prenom, token from membres;
```

### 2. Les variables d'environnement

Copier `.env.example` vers `.env.local` et le remplir.

Les clés de notification se génèrent avec :

```bash
npx web-push generate-vapid-keys
```

`CRON_SECRET` est une chaîne au hasard, partagée avec le script `0004_cron.sql`.

### 3. En local

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000/entree/<token>` avec le token de son choix :
l'appareil s'en souvient ensuite. Les enfants peuvent voir l'application telle
que maman la voit via « Voir comme maman ».

### 4. En production

Déployer sur Vercel (offre Hobby), reporter les mêmes variables
d'environnement, puis exécuter `0004_cron.sql` avec le domaine réel.

## Une couleur par rubrique

Chaque rubrique de l'admin a sa teinte pastel, définie une seule fois dans
`src/lib/sections.ts` : le menu, l'en-tête de la page et ses encadrés la
partagent. On sait où on est avant d'avoir lu le titre, et le tableau de bord
signale par la couleur ce qui appelle une action — corail quand une journée
manque de contenu, menthe quand un témoignage attend une voix, ciel quand elle
a écrit.

Son application à elle garde sa palette douce et unique : la couleur sert à
s'orienter dans un outil, pas dans un cadeau.

## L'iPhone comme terrain principal

Tout est pensé pour un pouce, sur un écran de téléphone.

- Les champs de saisie font 16 px : en dessous, Safari zoome au premier clic et
  ne redescend jamais. Le zoom à deux doigts, lui, reste possible — elle doit
  pouvoir agrandir une photo.
- Rien de tapable en dessous de 44 px, et le texte courant est à 16 px.
- Côté admin, trois raccourcis sur le tableau de bord ouvrent le formulaire
  déjà réglé sur le bon type — déposer une photo tient en deux gestes. Le
  bouton d'envoi reste collé sous le pouce plutôt qu'en bas d'un long
  formulaire.

## Points de vigilance

**L'iPhone.** Les notifications web n'existent sur iOS que si l'application est
installée sur l'écran d'accueil, depuis Safari, et à partir d'iOS 16.4. Le bloc
d'installation guide le geste ; le reste de l'application fonctionne sans.

**Les fichiers ne passent pas par Vercel.** Une fonction serverless refuse les
corps de requête au-delà de 4,5 Mo — soit à peu près n'importe quelle vidéo. Le
navigateur reçoit donc une autorisation d'écriture signée et parle directement
au stockage Supabase. Plafond : 45 Mo par fichier, et les photos sont
recompressées avant l'envoi.

**Les formats d'Apple.** Safari n'enregistre les vocaux qu'en `audio/mp4`, les
photos peuvent arriver en HEIC et les vidéos en QuickTime. Le type réel du
fichier est lu à la source, jamais deviné à partir de son nom.

**La mise en veille de Supabase.** L'offre gratuite met un projet en pause après
sept jours sans activité. La tâche planifiée toutes les quinze minutes suffit à
le garder éveillé.

**L'accès.** Aucun compte, aucun mot de passe : un lien secret par personne,
mémorisé dans un cookie. RLS est activée sans aucune policy, donc rien n'est
lisible sans la clé de service — qui ne quitte jamais le serveur.

## Structure

```
src/
  app/
    (maman)/          son application : aujourd'hui, pioche, chemin, bons, projets
    admin/            le tableau de bord des garçons
    admin/capsules/   la bibliothèque : relire, corriger, déplacer, supprimer
    admin/temoignages/ les triples témoignages à compléter à trois
    admin/fil/        la conversation avec elle
    api/taches/       la tâche planifiée (publication, filet, rappels)
    api/push/         l'enregistrement des appareils
    entree/[token]/   le lien secret
  components/         cases d'avent, formulaire de dépôt, enregistreur vocal…
  lib/                base de données, requêtes, actions, notifications
supabase/migrations/  le schéma
```

## Ce qui reste à faire

- Le feuilleton : les épisodes existent en base, l'écran dédié reste à écrire.
- L'export en album à la fin du traitement.
- Un mode brouillon partagé, pour préparer une capsule à plusieurs.
