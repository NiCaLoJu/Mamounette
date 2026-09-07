-- Mamounette — schéma initial
-- Toutes les lectures/écritures passent par le serveur Next.js avec la service role key.
-- RLS est activée sans aucune policy : la clé anon ne peut donc rien lire ni écrire.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Les personnes
-- ---------------------------------------------------------------------------
create type role_membre as enum ('maman', 'enfant');

create table membres (
  id          uuid primary key default gen_random_uuid(),
  prenom      text not null,
  role        role_membre not null,
  couleur     text not null default '#8b7bb8',
  token       text not null unique,          -- lien secret personnel
  actif       boolean not null default true,
  cree_le     timestamptz not null default now()
);

create index membres_token_idx on membres (token);

-- ---------------------------------------------------------------------------
-- Les rendez-vous : de simples dates, rien d'autre.
-- ---------------------------------------------------------------------------
create table rendezvous (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  referent_id uuid references membres (id) on delete set null,
  cree_le     timestamptz not null default now()
);

create index rendezvous_date_idx on rendezvous (date);

-- ---------------------------------------------------------------------------
-- Le feuilleton
-- ---------------------------------------------------------------------------
create table series (
  id        uuid primary key default gen_random_uuid(),
  titre     text not null,
  resume    text,
  cree_le   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Les capsules : l'objet central. Tout le reste n'est qu'un affichage.
-- ---------------------------------------------------------------------------
create type type_capsule as enum (
  'anecdote',    -- texte
  'photo',       -- image + commentaire
  'vocal',       -- note audio
  'video',       -- micro-vidéo hébergée
  'lien',        -- YouTube, musique, podcast
  'quiz',        -- question à choix
  'temoignage',  -- même question, trois réponses anonymes
  'episode'      -- épisode de feuilleton
);

create type destination_capsule as enum (
  'rendezvous',  -- programmée pour une date précise
  'reserve',     -- au pot commun, sert de filet et alimente la pioche
  'direct'       -- publiée immédiatement
);

create type etat_capsule as enum ('brouillon', 'programmee', 'publiee');

create table capsules (
  id            uuid primary key default gen_random_uuid(),
  type          type_capsule not null,
  auteur_id     uuid not null references membres (id) on delete cascade,
  titre         text,
  teaser        text,                        -- l'étiquette sur la case fermée
  corps         text,
  media_chemin  text,                        -- chemin dans le bucket privé
  media_duree   integer,                     -- secondes, pour vocal/vidéo
  lien_url      text,
  payload       jsonb not null default '{}'::jsonb,  -- quiz, témoignages…
  destination   destination_capsule not null default 'reserve',
  rendezvous_id uuid references rendezvous (id) on delete set null,
  serie_id      uuid references series (id) on delete set null,
  episode_num   integer,
  etat          etat_capsule not null default 'brouillon',
  publiee_le    timestamptz,
  ouverte_le    timestamptz,                 -- quand elle l'a ouverte
  piochee_le    timestamptz,                 -- sortie de la réserve par la pioche
  cree_le       timestamptz not null default now(),

  constraint capsule_rendezvous_coherent
    check (destination <> 'rendezvous' or rendezvous_id is not null)
);

create index capsules_rendezvous_idx on capsules (rendezvous_id);
create index capsules_reserve_idx on capsules (destination, piochee_le);
create index capsules_serie_idx on capsules (serie_id, episode_num);

-- ---------------------------------------------------------------------------
-- Ses réactions
-- ---------------------------------------------------------------------------
create table reactions (
  id          uuid primary key default gen_random_uuid(),
  capsule_id  uuid not null references capsules (id) on delete cascade,
  emoji       text,
  media_chemin text,                          -- un vocal en retour
  cree_le     timestamptz not null default now()
);

create index reactions_capsule_idx on reactions (capsule_id);

-- ---------------------------------------------------------------------------
-- Les « Bons pour… »
-- ---------------------------------------------------------------------------
create type etat_bon as enum ('disponible', 'reclame', 'honore');

create table bons (
  id          uuid primary key default gen_random_uuid(),
  auteur_id   uuid not null references membres (id) on delete cascade,
  titre       text not null,
  description text,
  etat        etat_bon not null default 'disponible',
  reclame_le  timestamptz,
  honore_le   timestamptz,
  cree_le     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- La boîte à projets
-- ---------------------------------------------------------------------------
create table projets (
  id            uuid primary key default gen_random_uuid(),
  auteur_id     uuid not null references membres (id) on delete cascade,
  titre         text not null,
  description   text,
  media_chemin  text,
  envie         boolean not null default false,   -- elle a coché « oh oui »
  cree_le       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table abonnements_push (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid not null references membres (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  cree_le     timestamptz not null default now()
);

create index abonnements_membre_idx on abonnements_push (membre_id);

create table rappels (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid references membres (id) on delete cascade,  -- null = tous les enfants
  titre       text not null,
  corps       text,
  url         text default '/',
  envoyer_le  timestamptz not null,
  envoye_le   timestamptz,
  cree_par    uuid references membres (id) on delete set null,
  cree_le     timestamptz not null default now()
);

create index rappels_a_envoyer_idx on rappels (envoyer_le) where envoye_le is null;

create table notifications_log (
  id          uuid primary key default gen_random_uuid(),
  membre_id   uuid references membres (id) on delete set null,
  titre       text not null,
  succes      boolean not null default true,
  detail      text,
  envoye_le   timestamptz not null default now()
);

create index notifications_log_membre_jour_idx on notifications_log (membre_id, envoye_le desc);

-- ---------------------------------------------------------------------------
-- Réglages globaux (une seule ligne)
-- ---------------------------------------------------------------------------
create table reglages (
  id                      boolean primary key default true check (id),
  notifications_actives   boolean not null default true,
  max_notifs_par_jour     integer not null default 1,
  heure_notif_jour_j      integer not null default 9,   -- heure locale
  fuseau                  text not null default 'Europe/Paris'
);

insert into reglages (id) values (true);

-- ---------------------------------------------------------------------------
-- Verrouillage : personne n'accède aux données sans la service role key.
-- ---------------------------------------------------------------------------
alter table membres            enable row level security;
alter table rendezvous         enable row level security;
alter table series             enable row level security;
alter table capsules           enable row level security;
alter table reactions          enable row level security;
alter table bons               enable row level security;
alter table projets            enable row level security;
alter table abonnements_push   enable row level security;
alter table rappels            enable row level security;
alter table notifications_log  enable row level security;
alter table reglages           enable row level security;
