"use client";

const albums = [
  {
    desc: "K.K. Slider en la playa, Welcome Horizons",
    texto: "The Jesus And Mary Chain - Psychocandy (1985)",
    emoji: "🏖️",
    bg: "linear-gradient(135deg, #74b9d3 0%, #2980b9 100%)",
    accent: "#a8d8ea",
  },
  {
    desc: "K.K. Rockabilly con otra figura en estilo rockabilly",
    texto: "The Jesus And Mary Chain - Psychocandy (1985)",
    emoji: "🎸",
    bg: "linear-gradient(135deg, #e17055 0%, #c0392b 100%)",
    accent: "#f0a89a",
  },
  {
    desc: "K.K. Reggae, portada de álbum con K.K. Slider y otro músico",
    texto: "The House of Love - The House of Love (1990)",
    emoji: "🌿",
    bg: "linear-gradient(135deg, #f9ca24 0%, #6ab04c 100%)",
    accent: "#d4f0a0",
  },
];

export default function DiscosPage() {
  return (
    <div className="nook-bg min-h-screen py-16 px-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Título */}
        <h2
          className="text-4xl font-black text-[#2d5a40] text-left"
          style={{ fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif", letterSpacing: "-0.5px" }}
        >
          Grandes discos de Pop/Rock Alternativo
        </h2>

        {/* Cards */}
        <div className="flex flex-row gap-8 items-start">
          {albums.map((album, i) => (
            <div
              key={i}
              className="album-card flex-1 bg-white rounded-2xl p-4 flex flex-col gap-4"
            >
              {/* Imagen placeholder */}
              <div
                className="album-img-wrap w-full"
                style={{ aspectRatio: "1 / 1", background: album.bg }}
              >
                {/* Capa de brillo (glow) gestionada por CSS ::after */}
                {/* Contenido placeholder */}
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-5"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <span style={{ fontSize: "4rem", lineHeight: 1 }}>{album.emoji}</span>
                  <p
                    className="text-center text-white font-semibold leading-snug"
                    style={{
                      fontSize: "0.72rem",
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      maxWidth: "180px",
                    }}
                  >
                    {album.desc}
                  </p>
                </div>
              </div>

              {/* Texto del álbum */}
              <p
                className="font-bold text-gray-800 text-sm leading-snug"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                {album.texto}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
