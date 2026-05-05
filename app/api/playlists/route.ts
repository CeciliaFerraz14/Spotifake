import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data, error } = await supabase
    .from('playlists')
    .select('id, nombre, accent, bg, created_at, playlist_canciones(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((pl: any) => ({
    id: pl.id,
    nombre: pl.nombre,
    accent: pl.accent,
    bg: pl.bg,
    created_at: pl.created_at,
    canciones: pl.playlist_canciones?.[0]?.count ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { nombre, accent, bg } = await request.json();

  const { data, error } = await supabase
    .from('playlists')
    .insert([{ user_id: user.id, nombre, accent, bg }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, canciones: 0 });
}
