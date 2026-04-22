"use client";
import { useState } from "react";

export default function Page() {
  const discos = [
    { titulo: "OK Computer", subtitulo: "Radiohead · 1997", icono: "💿" },
    { titulo: "Nevermind", subtitulo: "Nirvana · 1991", icono: "🎸" },
    { titulo: "Is This It", subtitulo: "The Strokes · 2001", icono: "🎶" },
    { titulo: "In Rainbows", subtitulo: "Radiohead · 2007", icono: "🌈" },
    { titulo: "Tranquility Base", subtitulo: "Arctic Monkeys · 2018", icono: "🚀" },
    { titulo: "White Blood Cells", subtitulo: "The White Stripes · 2001", icono: "🎵" },
  ];

  const novedades = [
    { titulo: "REGU", artista: "The Synthwave Collective", duracion: "3:42", imagen: "/images/Portada_1.jpg" },
    { titulo: "Lluvia de Abril", artista: "Clara Montoya", duracion: "4:15", imagen: null },
    { titulo: "Midnight Echo", artista: "Broken Orbit", duracion: "3:58", imagen: null },
  ];

  const artistas = [
    {
      nombre: "Radiohead",
      imagen: "/images/artistas/radiohead.jpg",
      descripcion: "Banda británica de rock alternativo formada en Oxford en 1985. Conocidos por su sonido experimental y letras introspectivas, son uno de los grupos más influyentes de los 90 y 2000.",
    },
    {
      nombre: "Arctic Monkeys",
      imagen: "/images/artistas/arctic-monkeys.jpg",
      descripcion: "Cuarteto de Sheffield formado en 2002. Su mezcla de indie rock, post-punk y letras ácidas los convirtió en uno de los grupos más importantes del rock británico moderno.",
    },
    {
      nombre: "Nirvana",
      imagen: "/images/artistas/nirvana.jpg",
      descripcion: "Trío de Seattle que popularizó el grunge a nivel mundial. Con Kurt Cobain al frente, revolucionaron el rock de los 90 con álbumes como Nevermind y In Utero.",
    },
    {
      nombre: "The Strokes",
      imagen: "/images/artistas/the-strokes.jpg",
      descripcion: "Banda neoyorquina que lideró el renacimiento del garage rock a principios de los 2000. Su debut Is This It es considerado uno de los mejores álbumes del siglo XXI.",
    },
  ];

  const [actual, setActual] = useState(0);

  const anterior = () => setActual((prev) => (prev - 1 + artistas.length) % artistas.length);
  const siguiente = () => setActual((prev) => (prev + 1) % artistas.length);

  const artista = artistas[actual];

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundImage: "url('/images/fondo.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
    <main className="flex flex-col items-center px-10 py-10 gap-10 max-w-6xl mx-auto w-full">

      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <img src="/images/logo.png" alt="Logo" width={260} height={260} />
        <h1 className="text-4xl font-bold text-gray-900">Bienvenidos a SpotiFake</h1>
        <p className="text-gray-500 max-w-md text-base">
          Una plataforma de música independiente para artistas emergentes.
        </p>
      </div>

      {/* Novedades */}
      <section className="w-full max-w-full flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-[#7d5a50] pl-3">
         Radar de Novedades
        </h2>
        <div className="flex flex-col gap-4">
          {novedades.map((cancion, i) => (
            <div
              key={i}
              className="flex flex-row items-center gap-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#c2e18f] shrink-0 shadow-sm">
                {cancion.imagen
                  ? <img src={cancion.imagen} alt={cancion.titulo} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                }
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="font-semibold text-gray-900 text-sm">{cancion.titulo}</span>
                <span className="text-gray-500 text-xs">{cancion.artista}</span>
                <span className="text-gray-400 text-xs">{cancion.duracion}</span>
              </div>
              <button className="bg-[#CDE99D] text-gray-900 text-xs font-semibold px-4 py-2 rounded-full hover:brightness-95 transition shrink-0">
                Escuchar ahora
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Discos Pop/Rock */}
      <section className="w-full max-w-full flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-[#7d5a50] pl-3">
          Grandes discos de Pop/Rock alternativo
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {discos.map((disco, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-[#c2e18f] flex items-center justify-center text-3xl shadow-sm">
                {disco.icono}
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="font-semibold text-gray-900 text-sm">{disco.titulo}</span>
                <span className="text-gray-500 text-xs">{disco.subtitulo}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrusel de artistas */}
      <section className="w-full max-w-full flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-[#7d5a50] pl-3">
          Conoce artistas
        </h2>
        <div className="relative flex items-center bg-white/60 backdrop-blur-sm border border-gray-200 rounded-3xl overflow-hidden min-h-[360px]">

          {/* Flecha izquierda */}
          <button
            onClick={anterior}
            className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-100 transition text-xl"
          >
            ←
          </button>

          {/* Contenido */}
          <div className="flex flex-row items-center gap-10 px-24 py-12 w-full">
            <div className="flex flex-col gap-4 flex-1">
              <h3 className="text-3xl font-bold text-gray-900">{artista.nombre}</h3>
              <p className="text-gray-600 text-base leading-relaxed">{artista.descripcion}</p>
              <div className="flex gap-3 mt-2">
                <button className="bg-black text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-gray-800 transition">
                  Guardar
                </button>
                <button className="text-sm font-medium px-5 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
                  Abrir PlayList
                </button>
              </div>
            </div>
            <img
              src={artista.imagen}
              alt={artista.nombre}
              className="w-64 h-64 object-cover rounded-2xl shrink-0 bg-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/256x256/85f4a8/333?text=" + encodeURIComponent(artista.nombre); }}
            />
          </div>

          {/* Flecha derecha */}
          <button
            onClick={siguiente}
            className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-100 transition text-xl"
          >
            →
          </button>
        </div>

        {/* Indicadores */}
        <div className="flex justify-center gap-3">
          {artistas.map((_, i) => (
            <button
              key={i}
              onClick={() => setActual(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === actual ? "bg-[#c2e18f] scale-125" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="w-full bg-[#c2e18f] rounded-3xl px-10 py-12 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-white pl-3">
          Reviews
        </h2>
        <div className="flex flex-row gap-6">
          {[
            {
              texto: "Una plataforma increíble para descubrir música nueva. Me ha presentado artistas que nunca hubiera encontrado de otra forma.",
              nombre: "Laura Gómez",
              descripcion: "Melómana & crítica musical",
              avatar: "🎧",
            },
            {
              texto: "La sección de Pop/Rock alternativo es un tesoro. Cada semana encuentro algo que me vuela la cabeza. Totalmente recomendable.",
              nombre: "Marcos Díaz",
              descripcion: "DJ y productor independiente",
              avatar: "🎚️",
            },
            {
              texto: "Fácil de usar, bonita y con muy buen gusto musical. Llevo meses usándola y sigo descubriendo cosas nuevas cada día.",
              nombre: "Sofía Ramos",
              descripcion: "Estudiante de musicología",
              avatar: "🎼",
            },
          ].map((review, i) => (
            <div key={i} className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm flex flex-col justify-between p-6 gap-6">
              <p className="text-gray-800 font-semibold text-sm leading-relaxed">
                &ldquo;{review.texto}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#c2e18f] flex items-center justify-center text-xl shrink-0">
                  {review.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">{review.nombre}</span>
                  <span className="text-gray-500 text-xs">{review.descripcion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
    </div>
  );
}
