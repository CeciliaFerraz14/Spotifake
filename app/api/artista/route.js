import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json(); // lee los datos

  return NextResponse.json({ mensaje: "ok, Artista añadido" }); //respuesta
}


/*PARA PROBARLO: ir al navegador y en la consola:

fetch("http://localhost:3000/api/artista", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nombre: "Canelita", genero:"Pop" })
})
.then(res => res.json())
.then(data => console.log(data))
*/





export async function GET(request) {
  
  const url = new URL(request.url);
  const nombreBuscado = url.searchParams.get("nombre"); //busca nombre

  //simulacion de bbdd
  const artistasBBDD = [
    { id: 1, nombre: "Canelita", genero: "Pop" },
    { id: 2, nombre: "Totakeke", genero: "Poul" },
    { id: 3, nombre: "Tom Nook", genero: "Country" }
  ];
if (nombreBuscado) {
    const artistaEncontrado = artistasBBDD.find(u => u.nombre === nombreBuscado);
    
    if (artistaEncontrado) {
      return NextResponse.json(artistaEncontrado);
    } else {
      return NextResponse.json({ error: "Artista no encontrado" }, { status: 404 });
    }
  }

  return NextResponse.json(artistasBBDD);
}

//ENTRAR EN LA URL:
// http://localhost:3000/api/artista
// http://localhost:3000/api/artista?nombre=Canelita

//
