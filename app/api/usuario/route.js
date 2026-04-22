import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// POST /api/usuario — crear un usuario
// Body: { nombre: "...", contraseña: "..." }
export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('usuarios')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mensaje: "Usuario creado", usuario: data[0] });
}

/*PARA PROBARLO: ir al navegador y en la consola:

fetch("http://localhost:3000/api/usuario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nombre: "Ceci", contraseña: "1234" })
})
.then(res => res.json())
.then(data => console.log(data))
*/


// GET /api/usuario          — devuelve todos los usuarios
// GET /api/usuario?nombre=X — devuelve el usuario con ese nombre
export async function GET(request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const nombreBuscado = url.searchParams.get("nombre");

  if (nombreBuscado) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre', nombreBuscado)
      .single();

    if (error) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ENTRAR EN LA URL:
// http://localhost:3000/api/usuario
// http://localhost:3000/api/usuario?nombre=Ceci
