-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Si ya ejecutaste antes y dio error, este script limpia y recrea todo desde cero

drop table if exists playlist_canciones cascade;
drop table if exists liked_songs cascade;
drop table if exists playlists cascade;

-- Playlists del usuario
create table playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  nombre text not null,
  accent text not null default '#1CF094',
  bg text not null default 'linear-gradient(145deg,#001a00,#003a0a)',
  created_at timestamptz default now()
);
alter table playlists enable row level security;
create policy "playlists_select" on playlists for select using (auth.uid() = user_id);
create policy "playlists_insert" on playlists for insert with check (auth.uid() = user_id);
create policy "playlists_update" on playlists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "playlists_delete" on playlists for delete using (auth.uid() = user_id);

-- Canciones dentro de las playlists
create table playlist_canciones (
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
create policy "playlist_canciones_select" on playlist_canciones for select
  using (exists (select 1 from playlists p where p.id = playlist_canciones.playlist_id and p.user_id = auth.uid()));
create policy "playlist_canciones_insert" on playlist_canciones for insert
  with check (exists (select 1 from playlists p where p.id = playlist_canciones.playlist_id and p.user_id = auth.uid()));
create policy "playlist_canciones_delete" on playlist_canciones for delete
  using (exists (select 1 from playlists p where p.id = playlist_canciones.playlist_id and p.user_id = auth.uid()));

-- Canciones que me gustan
create table liked_songs (
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
create policy "liked_songs_select" on liked_songs for select using (auth.uid() = user_id);
create policy "liked_songs_insert" on liked_songs for insert with check (auth.uid() = user_id);
create policy "liked_songs_delete" on liked_songs for delete using (auth.uid() = user_id);
