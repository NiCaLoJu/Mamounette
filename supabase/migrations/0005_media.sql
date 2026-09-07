-- Les formats que produisent réellement les téléphones.
-- Safari sur iPhone enregistre en audio/mp4 (jamais en webm) et livre parfois
-- les photos en HEIC ; les vidéos arrivent en QuickTime.

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/webm', 'audio/ogg', 'audio/wav',
  'video/mp4', 'video/webm', 'video/quicktime'
]
where id = 'media';
