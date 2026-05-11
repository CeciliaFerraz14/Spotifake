import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const BUCKET = 'avatars';

function extractPath(url: string) {
  const marker = `/avatars/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length).split('?')[0] : null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;

  const { data: pl, error: plErr } = await supabase
    .from('playlists')
    .select('id, image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (plErr || !pl) return NextResponse.json({ error: 'Playlist no encontrada' }, { status: 404 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Imagen demasiado grande (máx 5MB)' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 });

  const ext = file.type.split('/')[1] || 'jpg';
  const path = `playlists/${id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  if (pl.image_url) {
    const oldPath = extractPath(pl.image_url);
    if (oldPath && oldPath !== path) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const image_url = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updErr } = await supabase
    .from('playlists')
    .update({ image_url })
    .eq('id', id)
    .eq('user_id', user.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ image_url });
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
    const path = extractPath(pl.image_url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
  }

  const { error } = await supabase
    .from('playlists')
    .update({ image_url: null })
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
