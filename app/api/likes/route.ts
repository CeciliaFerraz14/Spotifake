import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { titulo, artista, accent, duracion, audio_url } = await request.json();

  const { data, error } = await supabase
    .from('liked_songs')
    .upsert([{ user_id: user.id, titulo, artista, accent, duracion, audio_url }], {
      onConflict: 'user_id,titulo,artista',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { titulo, artista } = await request.json();

  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', user.id)
    .eq('titulo', titulo)
    .eq('artista', artista);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
