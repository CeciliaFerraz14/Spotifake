import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/artista — añadir un artista
// Body: { nombre: "...", genero: "..." }
export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('artistas')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mensaje: "Artista añadido", artista: data[0] });
}

/*PARA PROBARLO: ir al navegador y en la consola:

fetch("http://localhost:3000/api/artista", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nombre: "Canelita", genero: "Pop" })
})
.then(res => res.json())
.then(data => console.log(data))
*/


function resolverImagen(supabase, artista) {
  if (!artista?.imagen) return artista;
  const { data } = supabase.storage.from('artistas').getPublicUrl(artista.imagen);
  console.log("imagen original:", artista.imagen, "→ URL pública:", data.publicUrl);
  return { ...artista, imagen: data.publicUrl };
}

// GET /api/artista          — devuelve todos los artistas
// GET /api/artista?nombre=X — devuelve el artista con ese nombre
export async function GET(request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const nombreBuscado = url.searchParams.get("nombre");

  if (nombreBuscado) {
    const { data, error } = await supabase
      .from('artistas')
      .select('*')
      .eq('nombre', nombreBuscado)
      .single();

    if (error) {
      return NextResponse.json({ error: "Artista no encontrado" }, { status: 404 });
    }
    return NextResponse.json(resolverImagen(supabase, data));
  }

  const { data, error } = await supabase
    .from('artistas')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data.map(a => resolverImagen(supabase, a)));
}

// ENTRAR EN LA URL:
// http://localhost:3000/api/artista
// http://localhost:3000/api/artista?nombre=Canelita
