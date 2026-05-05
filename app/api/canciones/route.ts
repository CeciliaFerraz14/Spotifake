import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/canciones?artista_id=UUID
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const artista_id = searchParams.get('artista_id');

  if (!artista_id) {
    return NextResponse.json({ error: 'Falta artista_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('canciones')
    .select('id_cancion, titulo, duracion, num_reproducciones, albums!inner(id_artista_fk)')
    .eq('albums.id_artista_fk', artista_id)
    .order('id_cancion', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((c: any) => ({
    id: c.id_cancion,
    titulo: c.titulo,
    duracion: c.duracion,
    num_reproducciones: c.num_reproducciones,
  }));

  return NextResponse.json(result);
}
