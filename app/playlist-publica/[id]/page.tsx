"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";
import { PLAYLISTS_PUBLICAS } from "../playlistsPublicasData";

const css = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin-vinyl-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes eq-bar {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1); }
  }

  .track-row {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .track-row:hover { background: rgba(255,255,255,0.07); }
  .track-row.active { background: rgba(28,240,148,0.08); }

  .back-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px; padding: 8px 18px;
    color: rgba(255,255,255,0.7); cursor: pointer;
    font-family: var(--font-nunito), sans-serif;
    font-weight: 700; font-size: 0.82rem;
    transition: background 0.18s, color 0.18s;
  }
  .back-btn:hover { background: rgba(255,255,255,0.11); color: white; }

  .play-all-btn {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    border: none; border-radius: 50px;
    padding: 11px 28px; cursor: pointer;
    color: #0a0f1a; font-weight: 800; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    box-shadow: 0 4px 20px rgba(28,240,148,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .play-all-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px rgba(28,240,148,0.6);
  }

  .shuffle-btn {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50px; padding: 11px 24px; cursor: pointer;
    color: rgba(255,255,255,0.8); font-weight: 700; font-size: 0.88rem;
    font-family: var(--font-nunito), sans-serif;
    transition: background 0.18s, color 0.18s;
  }
  .shuffle-btn:hover { background: rgba(255,255,255,0.11); color: white; }

  .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .eq-bar { width: 3px; border-radius: 2px; transform-origin: bottom; }
`;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Vinyl({ accent, size = 120, spinning }: { accent: string; size?: number; spinning?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle, ${accent} 0%, ${accent} 17%, #141414 18%, #141414 25%,
        #222 28%, #141414 32%, #222 38%, #141414 44%, #222 52%, #141414 60%, #1e1e1e 100%)`,
      animation: spinning ? "spin-vinyl-slow 6s linear infinite" : "none",
      position: "relative",
      boxShadow: `0 8px 40px ${accent}44`,
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: size * 0.14, height: size * 0.14,
        borderRadius: "50%", background: "#080808",
      }} />
    </div>
  );
}

function EqBars({ accent }: { accent: string }) {
  return (
    <div className="eq-bars">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="eq-bar" style={{
          height: "100%", background: accent,
          animation: `eq-bar ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function PlaylistPublicaPage() {
  const router   = useRouter();
  const params   = useParams();
  const supabase = createClient();
  const { playTrack, track: currentTrack, playing } = usePlayer();

  const [cargando, setCargando] = useState(true);
  const [mounted,  setMounted]  = useState(false);

  const id = Number(params.id);
  const playlist = PLAYLISTS_PUBLICAS.find(p => p.id === id);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/usuario"); return; }
      setCargando(false);
    })();
  }, []);

  if (cargando) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
        Cargando...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
        Playlist no encontrada.{" "}
        <span style={{ color: "#1CF094", cursor: "pointer" }} onClick={() => router.back()}>Volver</span>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration ?? 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #060910 60%, #000 100%)",
    }}>
      <style>{css}</style>

      {/* Estrellas */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          width: i % 6 === 0 ? "2px" : "1px", height: i % 6 === 0 ? "2px" : "1px",
          borderRadius: "50%", background: "white",
          opacity: 0.07 + ((i * 37) % 40) / 100,
          top: `${(i * 37 + 13) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 140px", position: "relative", zIndex: 1 }}>

        {/* Botón volver */}
        <div style={{ marginBottom: "32px", animation: mounted ? "fade-in-up 0.5s ease both" : "none" }}>
          <button className="back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Inicio
          </button>
        </div>

        {/* Cabecera */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: "32px",
          marginBottom: "40px", flexWrap: "wrap",
          animation: mounted ? "fade-in-up 0.5s ease 0.05s both" : "none",
        }}>
          {/* Portada */}
          <div style={{
            width: 180, height: 180, borderRadius: "20px",
            overflow: "hidden", flexShrink: 0,
            boxShadow: `0 16px 60px ${playlist.accent}33`,
            border: `1px solid ${playlist.accent}22`,
          }}>
            <img src={playlist.img} alt={playlist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: "0.75rem",
              fontFamily: "var(--font-nunito), sans-serif",
              letterSpacing: "1px", textTransform: "uppercase",
              margin: "0 0 8px",
            }}>
              Playlist · {playlist.curator}
            </p>
            <h1 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
              fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              background: `linear-gradient(90deg, #fff 0%, ${playlist.accent} 120%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              lineHeight: 1.1,
            }}>
              {playlist.name}
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.35)", fontSize: "0.82rem",
              fontFamily: "Arial, sans-serif", margin: "0 0 24px",
            }}>
              {playlist.tracks.length} {playlist.tracks.length === 1 ? "canción" : "canciones"} · {fmt(totalDuration)}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="play-all-btn"
                onClick={() => playlist.tracks.length > 0 && playTrack(playlist.tracks[0], playlist.tracks)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0f1a">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Reproducir todo
              </button>
              <button className="shuffle-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                  <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
                Aleatorio
              </button>
            </div>
          </div>
        </div>

        {/* Cabecera de la tabla */}
        <div style={{
          display: "grid", gridTemplateColumns: "32px 1fr auto",
          gap: "16px", padding: "0 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "8px",
          animation: mounted ? "fade-in-up 0.5s ease 0.1s both" : "none",
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>#</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" }}>Título</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        {/* Lista de canciones */}
        <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.15s both" : "none" }}>
          {playlist.tracks.map((t, i) => {
            const isActive = currentTrack?.title === t.title && currentTrack?.artist === t.artist;
            return (
              <div
                key={i}
                className={`track-row${isActive ? " active" : ""}`}
                onClick={() => playTrack(t, playlist.tracks)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isActive && playing
                    ? <EqBars accent={playlist.accent} />
                    : <span style={{
                        color: isActive ? playlist.accent : "rgba(255,255,255,0.3)",
                        fontSize: "0.8rem", fontFamily: "Arial, sans-serif",
                        fontWeight: isActive ? 700 : 400,
                      }}>
                        {i + 1}
                      </span>
                  }
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{
                    color: isActive ? playlist.accent : "white",
                    fontWeight: 700, fontSize: "0.88rem",
                    fontFamily: "var(--font-nunito), sans-serif",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    transition: "color 0.15s",
                  }}>
                    {t.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                    {t.artist}
                  </div>
                </div>

                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>
                  {fmt(t.duration ?? 0)}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
