-- Elle doit pouvoir répondre, et pas seulement recevoir : un mot sous une
-- capsule, un vocal en retour, ou un message envoyé sans raison.
-- La même table porte les deux sens de la conversation.

create table messages (
  id            uuid primary key default gen_random_uuid(),
  capsule_id    uuid references capsules (id) on delete cascade,  -- null = message libre
  auteur_id     uuid not null references membres (id) on delete cascade,
  texte         text,
  media_chemin  text,                                             -- un vocal en retour
  media_duree   integer,
  lu_le         timestamptz,
  cree_le       timestamptz not null default now(),

  constraint message_non_vide check (texte is not null or media_chemin is not null)
);

create index messages_capsule_idx on messages (capsule_id, cree_le);
create index messages_fil_idx on messages (cree_le desc);
create index messages_non_lus_idx on messages (auteur_id) where lu_le is null;

alter table messages enable row level security;
