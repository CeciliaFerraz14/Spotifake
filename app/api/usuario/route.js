import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json(); // lee los datos

  return NextResponse.json({ mensaje: "ok, Usuario creado" }); //respuesta
}
// PARA PROBARLO, ir al navegador y en la consola poner:
/*fetch("http://localhost:3000/api/usuario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nombre: "Ceci", contraseña: "1234" })
})
.then(res => res.json())
.then(data => console.log(data))*/




export async function GET(request) {
  
  const url = new URL(request.url);
  const nombreBuscado = url.searchParams.get("nombre"); //busca nombre

  //simulacion de bbdd
  const usuariosBBDD = [
    { id: 1, nombre: "Ceci", contraseña: "1234" },
    { id: 2, nombre: "Jess", contraseña: "5678" },
    { id: 3, nombre: "Isa", contraseña: "9012" }
  ];
if (nombreBuscado) {
    const usuarioEncontrado = usuariosBBDD.find(u => u.nombre === nombreBuscado);
    
    if (usuarioEncontrado) {
      return NextResponse.json(usuarioEncontrado);
    } else {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
  }

  return NextResponse.json(usuariosBBDD);
}

// PARA PROBARLO: ENTRAR EN LA URL:
// http://localhost:3000/api/usuario
// http://localhost:3000/api/usuario?nombre=Ceci