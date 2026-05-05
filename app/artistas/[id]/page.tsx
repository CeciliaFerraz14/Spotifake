"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

type Artista = { nombre: string; genero: string };

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artista")
      .then(r => r.json())
      .then((data: Artista[]) => {
        if (!Array.isArray(data)) { router.replace("/inicio"); return; }
        const found = data.find(a => toSlug(a.nombre) === id) ?? null;
        if (!found) { router.replace("/inicio"); return; }
        setArtista(found);
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
