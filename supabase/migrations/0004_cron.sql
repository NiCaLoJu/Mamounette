-- La tâche planifiée : c'est Supabase qui tient l'horloge, pas Vercel.
-- (L'offre gratuite de Vercel ne déclenche qu'une fois par jour ; ici on veut
-- une précision au quart d'heure pour les rappels programmés.)
--
-- Avant d'exécuter ce script, remplacer :
--   VOTRE_DOMAINE   par l'URL de l'app en production
--   VOTRE_SECRET    par la valeur de CRON_SECRET

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'mamounette-taches',
  '*/15 * * * *',
  $$
  select net.http_get(
    url := 'https://VOTRE_DOMAINE/api/taches',
    headers := '{"Authorization": "Bearer VOTRE_SECRET"}'::jsonb
  );
  $$
);

-- Pour vérifier :   select * from cron.job;
-- Pour l'historique: select * from cron.job_run_details order by start_time desc limit 10;
-- Pour retirer :    select cron.unschedule('mamounette-taches');
