-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Añade soporte para portadas personalizadas en playlists.
-- Las imágenes se guardan en el bucket "avatars" ya existente,
-- bajo la carpeta playlists/<playlist_id>.<ext>

alter table playlists add column if not exists image_url text;
