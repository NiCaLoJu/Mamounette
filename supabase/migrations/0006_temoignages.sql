-- Le triple témoignage devient collaboratif : l'un lance la question avec sa
-- version, les deux autres sont prévenus et complètent à leur tour.
-- La capsule reste au brouillon tant que les trois voix n'y sont pas.

create table temoignages (
  id          uuid primary key default gen_random_uuid(),
  capsule_id  uuid not null references capsules (id) on delete cascade,
  auteur_id   uuid not null references membres (id) on delete cascade,
  texte       text not null,
  cree_le     timestamptz not null default now(),
  unique (capsule_id, auteur_id)
);

create index temoignages_capsule_idx on temoignages (capsule_id);

alter table temoignages enable row level security;

-- Qui doit répondre pour qu'un témoignage soit complet. Namou peut participer
-- quand il le souhaite, mais on ne l'attend pas.
alter table membres add column attendu_temoignages boolean not null default true;

update membres set attendu_temoignages = false where role = 'maman' or prenom = 'Namou';
