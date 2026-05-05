-- Ejecutar en el SQL Editor de Supabase Dashboard

-- Playlists del usuario
create table if not exists playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  accent text not null default '#1CF094',
  bg text not null default 'linear-gradient(145deg,#001a00,#003a0a)',
  created_at timestamptz default now()
);
alter table playlists enable row level security;
create policy "Users manage own playlists" on playlists
  for all using (auth.uid() = user_id);

-- Canciones dentro de las playlists
create table if not exists playlist_canciones (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references playlists(id) on delete cascade not null,
  titulo text not null,
  artista text not null,
  accent text,
  duracion integer,
  position integer default 0,
  created_at timestamptz default now()
);
alter table playlist_canciones enable row level security;
create policy "Users manage songs in own playlists" on playlist_canciones
  for all using (
    exists (select 1 from playlists where id = playlist_id and user_id = auth.uid())
  );

-- Canciones que me gustan
create table if not exists liked_songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  artista text not null,
  accent text,
  duracion integer,
  created_at timestamptz default now(),
  unique(user_id, titulo, artista)
);
alter table liked_songs enable row level security;
create policy "Users manage own liked songs" on liked_songs
  for all using (auth.uid() = user_id);
