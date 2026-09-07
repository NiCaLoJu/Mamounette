-- Les cinq personnes. Les tokens sont des liens secrets à usage permanent :
-- chacun ouvre son lien une fois, l'app s'en souvient ensuite.
-- Après avoir exécuté ce script, récupérer les tokens avec :
--   select prenom, token from membres;

insert into membres (prenom, role, couleur, token) values
  ('Maman',    'maman',  '#c96f8b', encode(gen_random_bytes(24), 'hex')),
  ('Nicolas',  'enfant', '#4f7cac', encode(gen_random_bytes(24), 'hex')),
  ('Foufou',   'enfant', '#57a773', encode(gen_random_bytes(24), 'hex')),
  ('Loulou',   'enfant', '#e0894a', encode(gen_random_bytes(24), 'hex')),
  ('Namou',    'enfant', '#8b7bb8', encode(gen_random_bytes(24), 'hex'))
on conflict do nothing;
