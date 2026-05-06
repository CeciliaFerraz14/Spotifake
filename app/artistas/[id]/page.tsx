"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

function fmtDuracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Artista = { nombre: string; genero: string; descripcion?: string; id?: string; imagen?: string };
type Cancion  = { id: string; titulo: string; duracion: number; num_reproducciones: number };
type Album    = { id: string; titulo: string; año: string; canciones: number; caratula?: string };

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [artista,   setArtista]   = useState<Artista | null>(null);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albums,    setAlbums]    = useState<Album[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/artista")
      .then(r => r.json())
      .then((data: Artista[]) => {
        if (!Array.isArray(data)) { router.replace("/inicio"); return; }
        const found = data.find(a => toSlug(a.nombre) === id) ?? null;
        if (!found) { router.replace("/inicio"); return; }
        setArtista(found);

        const artistaId = found.id;
        if (!artistaId) return;

        Promise.all([
          fetch(`/api/canciones?artista_id=${artistaId}`).then(r => r.json()),
          fetch(`/api/albums?artista_id=${artistaId}`).then(r => r.json()),
        ]).then(([c, a]) => {
          if (Array.isArray(c)) setCanciones(c);
          if (Array.isArray(a)) {
            console.log("Albums del artista:", a.map((x: any) => ({ titulo: x.titulo, caratula: x.caratula })));
            setAlbums(a);
          }
        });
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
    <div style={{ maxWidth: "700px", margin: "60px auto", padding: "0 20px" }}>

      {/* Cabecera */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "28px",
      }}>
        {artista.imagen && (
          <img
            src={artista.imagen}
            alt={artista.nombre}
            style={{
              width: "110px", height: "110px",
              borderRadius: "50%", objectFit: "cover",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.12)",
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "var(--font-nunito)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {artista.genero}
          </p>
          <h1 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "2rem", margin: "0 0 12px" }}>
            {artista.nombre}
          </h1>
          {artista.descripcion && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-nunito)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0, textAlign: "justify" }}>
              {artista.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Álbumes */}
      {albums.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "1.1rem", margin: "0 0 16px", opacity: 0.7 }}>
            Álbumes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {albums.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "10px 12px", borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {a.caratula ? (
                  <img src={a.caratula} alt={a.titulo} style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>♫</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontFamily: "var(--font-nunito)", fontWeight: 700, fontSize: "0.9rem" }}>
                    {a.titulo}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-nunito)", fontSize: "0.75rem", marginTop: "2px" }}>
                    {a.año ? new Date(a.año).getFullYear() : ""}
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito)", fontSize: "0.78rem" }}>
                  {a.canciones} {a.canciones === 1 ? "canción" : "canciones"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canciones */}
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
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 8px", borderRadius: "10px", transition: "background 0.15s",
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
