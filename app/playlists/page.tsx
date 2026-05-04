"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Datos de ejemplo (como si vinieran de una base de datos)
const playlists = [
  { id: 1, nombre: "Mis favoritas", canciones: 12, color: "#1CF094" },
  { id: 2, nombre: "Para estudiar", canciones: 8,  color: "#5eead4" },
  { id: 3, nombre: "Gym",           canciones: 20, color: "#a78bfa" },
  { id: 4, nombre: "Viajes",        canciones: 15, color: "#f472b6" },
];

export default function PlaylistsPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]       = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Comprueba si hay sesión; si no, redirige al login
  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/usuario"); return; }
      setUser(u);
      setCargando(false);
    })();
  }, []);

  if (cargando) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "60px auto", padding: "0 20px" }}>

      {/* Título */}
      <h1 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "2rem", marginBottom: "8px" }}>
        Mis playlists
      </h1>
      <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "32px", fontSize: "0.9rem" }}>
        Bienvenida, {user.user_metadata?.full_name || user.email}
      </p>

      {/* Lista de playlists */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "16px 20px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            {/* Icono de color */}
            <div style={{
              width: "48px", height: "48px", borderRadius: "10px",
              background: pl.color, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
            }}>
              🎵
            </div>

            {/* Nombre y número de canciones */}
            <div>
              <p style={{ color: "white", fontWeight: 700, margin: 0, fontFamily: "var(--font-nunito)" }}>
                {pl.nombre}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: 0 }}>
                {pl.canciones} canciones
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
