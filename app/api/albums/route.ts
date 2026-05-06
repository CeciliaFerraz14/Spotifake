import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/albums              — todos los álbumes
// GET /api/albums?artista_id=  — álbumes de un artista concreto
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const artista_id = searchParams.get('artista_id');

  let query = supabase
    .from('albums')
    .select('id_album, titulo, año, canciones, id_artista_fk')
    .order('año', { ascending: false });

  if (artista_id) query = query.eq('id_artista_fk', artista_id);

  const { data: albums, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!albums?.length) return NextResponse.json([]);

  // Artistas de esos álbumes
  const artistaIds = [...new Set(albums.map((a: any) => a.id_artista_fk))];
  const { data: artistas } = await supabase
    .from('artistas')
    .select('id, nombre, genero')
    .in('id', artistaIds);

  const artistaMap = Object.fromEntries((artistas ?? []).map((a: any) => [a.id, a]));

  return NextResponse.json(albums.map((a: any) => ({
    id: a.id_album,
    titulo: a.titulo,
    año: a.año,
    canciones: a.canciones,
    artista: artistaMap[a.id_artista_fk]?.nombre ?? '',
    artista_id: a.id_artista_fk,
    genero: artistaMap[a.id_artista_fk]?.genero ?? '',
  })));
}
