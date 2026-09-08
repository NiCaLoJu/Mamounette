-- Un projet peut porter une date, ou un intervalle pour un week-end ou une
-- semaine. C'est ce qui permet le compte à rebours de son côté.

alter table projets add column debut date;
alter table projets add column fin   date;

alter table projets add constraint projet_intervalle_coherent
  check (fin is null or debut is null or fin >= debut);

create index projets_debut_idx on projets (debut);
