# Mamounette

Une application privée pour maman : ses garçons y déposent des souvenirs, des
photos, des vocaux et des bêtises ; elle les découvre le jour de chaque
rendez-vous, une case à la fois.

Deux espaces, une seule application :

- **Côté maman** — la journée du jour en cases à ouvrir, la pioche, le chemin
  parcouru, ses bons pour…, la boîte à projets.
- **Côté admin** (Nicolas, Foufou, Loulou, et Namou s'il le souhaite) — déposer
  des capsules, tenir le calendrier, garnir la réserve, programmer des rappels.

Il n'est question de rien d'autre que d'eux. Aucun suivi de symptômes, aucune
mention du traitement : les dates ne servent qu'à savoir quel jour ouvrir une
journée, et elles n'apparaissent jamais de son côté.

## Les idées qui structurent le code

- **La capsule.** Anecdote, photo, vocal, micro-vidéo, lien, quiz, triple
  témoignage, épisode de feuilleton : un seul objet en base, huit affichages.
  Ajouter un type ne casse rien.
- **La réserve.** Des capsules sans date, déposées d'avance. Elles alimentent la
  pioche et **complètent automatiquement une journée trop maigre** — c'est le
  filet du projet : le vrai risque n'est pas technique, c'est qu'un jour arrive
  sans que personne n'ait rien déposé.
- **Le plafond de notifications.** Une par jour pour elle, au maximum. Une
  application qui devient bruyante est une application qu'on désinstalle.

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
