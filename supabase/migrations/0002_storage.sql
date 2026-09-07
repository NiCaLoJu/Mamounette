-- Bucket privé pour les photos, vocaux et micro-vidéos.
-- L'app génère des URLs signées côté serveur ; rien n'est accessible publiquement.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  52428800, -- 50 Mo
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do nothing;
