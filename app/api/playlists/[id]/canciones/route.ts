import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase
    .from('playlist_canciones')
    .select('*')
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Rellenar audio_url faltante desde la tabla canciones
  const missing = (data ?? []).filter(c => !c.audio_url).map(c => c.titulo);
  if (missing.length > 0) {
    const { data: cancionesData } = await supabase
      .from('canciones')
      .select('titulo, audio_url')
      .in('titulo', missing);
    const urlMap = Object.fromEntries((cancionesData ?? []).map(c => [c.titulo, c.audio_url]));
    const filled = (data ?? []).map(c => ({ ...c, audio_url: c.audio_url ?? urlMap[c.titulo] ?? null }));
    return NextResponse.json(filled);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  // Verificar que la playlist pertenece al usuario
  const { data: pl } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!pl) return NextResponse.json({ error: 'Playlist no encontrada' }, { status: 404 });

  const { titulo, artista, accent, duracion, audio_url } = await request.json();

  // Evitar duplicados
  const { data: existing } = await supabase
    .from('playlist_canciones')
    .select('id')
    .eq('playlist_id', id)
    .eq('titulo', titulo)
    .eq('artista', artista)
    .maybeSingle();
  if (existing) return NextResponse.json({ error: 'La canción ya está en la playlist' }, { status: 409 });

  // Posición al final
  const { data: last } = await supabase
    .from('playlist_canciones')
    .select('position')
    .eq('playlist_id', id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('playlist_canciones')
    .insert([{ playlist_id: id, titulo, artista, accent, duracion, audio_url, position }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { cancion_id } = await request.json();

  const { error } = await supabase
    .from('playlist_canciones')
    .delete()
    .eq('id', cancion_id)
    .eq('playlist_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
