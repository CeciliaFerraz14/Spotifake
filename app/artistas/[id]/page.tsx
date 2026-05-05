"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

// Base de datos ficticia de artistas
const artistas: Record<string, { nombre: string; genero: string; canciones: string[] }> = {
  radiohead:                    { nombre: "Radiohead",                   genero: "Rock alternativo", canciones: ["Paranoid Android", "Creep", "Karma Police", "In Rainbows"] },
  nirvana:                      { nombre: "Nirvana",                     genero: "Grunge",           canciones: ["Come as You Are", "Smells Like Teen Spirit", "Heart-Shaped Box"] },
  "arctic-monkeys":             { nombre: "Arctic Monkeys",              genero: "Indie rock",       canciones: ["R U Mine?", "Do I Wanna Know?", "505", "AM"] },
  "the-strokes":                { nombre: "The Strokes",                 genero: "Garage rock",      canciones: ["Last Nite", "Reptilia", "Someday", "Is This It"] },
  "the-weeknd":                 { nombre: "The Weeknd",                  genero: "R&B / Pop",        canciones: ["Blinding Lights", "Starboy", "Save Your Tears"] },
  "miley-cyrus":                { nombre: "Miley Cyrus",                 genero: "Pop",              canciones: ["Flowers", "Wrecking Ball", "Nothing Breaks Like a Heart"] },
  "harry-styles":               { nombre: "Harry Styles",                genero: "Pop / Rock",       canciones: ["As It Was", "Watermelon Sugar", "Adore You"] },
  "taylor-swift":               { nombre: "Taylor Swift",                genero: "Pop / Country",    canciones: ["Anti-Hero", "Shake It Off", "Blank Space"] },
  "sam-smith":                  { nombre: "Sam Smith",                   genero: "Soul / Pop",       canciones: ["Unholy", "Stay With Me", "Writing's on the Wall"] },
  "the-synthwave-collective":   { nombre: "The Synthwave Collective",    genero: "Synthwave",        canciones: ["REGU", "Neon Grid", "After Dark"] },
  "clara-montoya":              { nombre: "Clara Montoya",               genero: "Indie pop",        canciones: ["Lluvia de Abril", "Sal y Mar", "Verano Eterno"] },
  "broken-orbit":               { nombre: "Broken Orbit",               genero: "Electronic",       canciones: ["Midnight Echo", "Signal Lost", "Orbit"] },
  "synthwave-era":              { nombre: "Synthwave Era",               genero: "Synthwave",        canciones: ["Neon Pulse", "Drive Forever", "Retro Wave"] },
};

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const artista = artistas[id];

  useEffect(() => {
    // Si el ID no existe en nuestra base de datos, volvemos atrás
    if (!artista) router.replace("/inicio");
  }, []);

  if (!artista) return null;

  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", padding: "0 20px" }}>

      {/* Cabecera del artista */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "20px",
      }}>
        <h1 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "2rem", margin: "0 0 8px" }}>
          {artista.nombre}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", margin: 0 }}>
          {artista.genero}
        </p>
      </div>

      {/* Lista de canciones */}
      <h2 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "1rem", marginBottom: "12px" }}>
        Canciones populares
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {artista.canciones.map((cancion, i) => (
          <div
            key={cancion}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "14px 18px",
            }}
          >
            {/* Número de posición */}
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", width: "20px" }}>
              {i + 1}
            </span>
            {/* Nombre de la canción */}
            <span style={{ color: "white", fontFamily: "var(--font-nunito)", fontWeight: 600 }}>
              {cancion}
            </span>
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        style={{
          marginTop: "32px",
          background: "none",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          color: "rgba(255,255,255,0.6)",
          padding: "10px 20px",
          cursor: "pointer",
          fontFamily: "var(--font-nunito)",
        }}
      >
        Volver
      </button>
    </div>
  );
}
