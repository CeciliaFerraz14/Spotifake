import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/canciones?artista_id=UUID   — canciones de un artista
// GET /api/canciones?top=N             — top N por reproducciones (con nombre artista)
// GET /api/canciones?limit=N           — N canciones (con nombre artista)
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const artista_id = searchParams.get('artista_id');
  const top        = searchParams.get('top');
  const limit      = searchParams.get('limit');

  if (artista_id) {
    // 1. Álbumes del artista
    const { data: albums, error: eAlbums } = await supabase
      .from('albums')
      .select('id_album')
      .eq('id_artista_fk', artista_id);

    if (eAlbums) return NextResponse.json({ error: eAlbums.message }, { status: 500 });
    if (!albums?.length) return NextResponse.json([]);

    const albumIds = albums.map((a: any) => a.id_album);

    // 2. Canciones de esos álbumes
    const { data, error } = await supabase
      .from('canciones')
      .select('id_cancion, titulo, duracion, num_reproducciones')
      .in('id_album_fk', albumIds)
      .order('num_reproducciones', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json((data ?? []).map((c: any) => ({
      id: c.id_cancion,
      titulo: c.titulo,
      duracion: c.duracion,
      num_reproducciones: c.num_reproducciones,
    })));
  }

  // Canciones con nombre del artista (top o mix)
  let cancionesQuery = supabase
    .from('canciones')
    .select('id_cancion, titulo, duracion, num_reproducciones, id_album_fk');

  if (top) {
    cancionesQuery = cancionesQuery.order('num_reproducciones', { ascending: false }).limit(Number(top));
  } else {
    cancionesQuery = cancionesQuery.order('id_cancion', { ascending: true }).limit(Number(limit) || 10);
  }

  const { data: canciones, error: eCanciones } = await cancionesQuery;
  if (eCanciones) return NextResponse.json({ error: eCanciones.message }, { status: 500 });
  if (!canciones?.length) return NextResponse.json([]);

  // Álbumes de esas canciones
  const albumIds = [...new Set(canciones.map((c: any) => c.id_album_fk))];
  const { data: albums } = await supabase
    .from('albums')
    .select('id_album, id_artista_fk')
    .in('id_album', albumIds);

  // Artistas de esos álbumes
  const artistaIds = [...new Set((albums ?? []).map((a: any) => a.id_artista_fk))];
  const { data: artistas } = await supabase
    .from('artistas')
    .select('id, nombre')
    .in('id', artistaIds);

  const albumMap = Object.fromEntries((albums ?? []).map((a: any) => [a.id_album, a.id_artista_fk]));
  const artistaMap = Object.fromEntries((artistas ?? []).map((a: any) => [a.id, a.nombre]));

  return NextResponse.json(canciones.map((c: any) => ({
    id: c.id_cancion,
    titulo: c.titulo,
    duracion: c.duracion,
    num_reproducciones: c.num_reproducciones,
    artista: artistaMap[albumMap[c.id_album_fk]] ?? '',
  })));
}
