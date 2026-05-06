"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

function fmtDuracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Artista = { nombre: string; genero: string; id_artista?: string; id?: string; imagen?: string };
type Cancion = { id: string; titulo: string; duracion: number; num_reproducciones: number };

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artista")
      .then(r => r.json())
      .then((data: Artista[]) => {
        if (!Array.isArray(data)) { router.replace("/inicio"); return; }
        const found = data.find(a => toSlug(a.nombre) === id) ?? null;
        if (!found) { router.replace("/inicio"); return; }
        setArtista(found);

        const artistaId = found.id_artista ?? found.id;
        if (artistaId) {
          fetch(`/api/canciones?artista_id=${artistaId}`)
            .then(r => r.json())
            .then(c => { if (Array.isArray(c)) setCanciones(c); });
        }
      })
      .catch(() => router.replace("/inicio"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "80px", fontFamily: "var(--font-nunito)" }}>
      Cargando…
    </div>
  );

  if (!artista) return null;

  return (
    <div style={{ maxWidth: "640px", margin: "60px auto", padding: "0 20px" }}>

      {/* Cabecera del artista */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
      }}>
        {artista.imagen && (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artistas/${artista.imagen}`}
            alt={artista.nombre}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.12)",
            }}
          />
        )}
        <div>
          <h1 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "2rem", margin: "0 0 8px" }}>
            {artista.nombre}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", margin: 0 }}>
            {artista.genero}
          </p>
        </div>
      </div>

      {/* Lista de canciones */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "24px 28px",
        marginBottom: "20px",
      }}>
        <h2 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "1.1rem", margin: "0 0 16px", opacity: 0.7 }}>
          Canciones
        </h2>

        {canciones.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito)", margin: 0 }}>
            Sin canciones disponibles
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {canciones.map((c, i) => (
              <div key={c.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 8px",
                borderRadius: "10px",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-nunito)", width: "20px", textAlign: "right", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ color: "white", fontFamily: "var(--font-nunito)", flex: 1 }}>
                  {c.titulo}
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-nunito)", fontSize: "0.8rem" }}>
                  {(c.num_reproducciones / 1000).toFixed(0)}k
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito)", fontSize: "0.85rem", width: "36px", textAlign: "right" }}>
                  {fmtDuracion(c.duracion)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        style={{
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
