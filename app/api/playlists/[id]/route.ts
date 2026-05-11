import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, string | null> = {};
  if (typeof body.nombre === 'string' && body.nombre.trim()) update.nombre = body.nombre.trim();
  if (typeof body.accent === 'string') update.accent = body.accent;
  if (typeof body.bg === 'string') update.bg = body.bg;
  if (body.image_url === null || typeof body.image_url === 'string') update.image_url = body.image_url;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('playlists')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  const { data: pl } = await supabase
    .from('playlists')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (pl?.image_url) {
    const marker = '/avatars/';
    const idx = pl.image_url.indexOf(marker);
    if (idx !== -1) {
      const path = pl.image_url.slice(idx + marker.length).split('?')[0];
      await supabase.storage.from('avatars').remove([path]);
    }
  }

  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
