"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";
import { PLAYLISTS_PUBLICAS } from "../playlistsPublicasData";

const css = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50%       { opacity: 1;    transform: scale(1.4); }
  }
  @keyframes nebula-drift {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(18px, -12px) scale(1.06); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
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
    padding: 11px 18px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .track-row:hover  { background: rgba(255,255,255,0.07); }
  .track-row.active { background: rgba(28,240,148,0.09); }

  .back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 50px; padding: 8px 20px;
    color: rgba(255,255,255,0.75); cursor: pointer;
    font-family: var(--font-nunito), sans-serif;
    font-weight: 700; font-size: 0.82rem;
    transition: background 0.18s, color 0.18s;
    backdrop-filter: blur(8px);
  }
  .back-btn:hover { background: rgba(255,255,255,0.13); color: white; }

  .play-all-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg, #1CF094 0%, #5eead4 50%, #a3ff47 100%);
    background-size: 200% auto;
    animation: shimmer-btn 3s linear infinite;
    border: none; border-radius: 50px;
    padding: 12px 30px; cursor: pointer;
    color: #061210; font-weight: 900; font-size: 0.92rem;
    font-family: var(--font-nunito), sans-serif;
    box-shadow: 0 4px 24px rgba(28,240,148,0.45);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .play-all-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 36px rgba(28,240,148,0.65);
  }

  .shuffle-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 50px; padding: 12px 26px; cursor: pointer;
    color: rgba(255,255,255,0.85); font-weight: 700; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    backdrop-filter: blur(8px);
    transition: background 0.18s, color 0.18s;
  }
  .shuffle-btn:hover { background: rgba(255,255,255,0.13); color: white; }

  .glass-panel {
    background: rgba(28, 240, 148, 0.07);
    border: 1px solid rgba(94, 234, 212, 0.28);
    border-radius: 22px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(94,234,212,0.15);
  }

  .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .eq-bar  { width: 3px; border-radius: 2px; transform-origin: bottom; }

  .tracks-scroll {
    overflow-y: auto; max-height: 420px;
    scrollbar-width: thin;
    scrollbar-color: rgba(28,240,148,0.25) transparent;
  }
  .tracks-scroll::-webkit-scrollbar { width: 3px; }
  .tracks-scroll::-webkit-scrollbar-track { background: transparent; }
  .tracks-scroll::-webkit-scrollbar-thumb { background: rgba(28,240,148,0.3); border-radius: 2px; }
`;

const STAR_COLORS = [
  "#ffffff", "#ffffff", "#ffffff",
  "#1CF094", "#5eead4", "#a3ff47",
  "#00d4ff", "#6e2fff", "#ff6ef7",
  "#ff9a00", "#ffeeaa", "#aaddff",
  "#cc88ff", "#88ffcc",
];

const STARS = Array.from({ length: 220 }, (_, i) => ({
  top:     `${(i * 31 + 11) % 100}%`,
  left:    `${(i * 47 +  3) % 100}%`,
  size:    i % 15 === 0 ? 4.5 : i % 7 === 0 ? 3.0 : i % 4 === 0 ? 2.0 : i % 2 === 0 ? 1.4 : 0.9,
  color:   STAR_COLORS[i % STAR_COLORS.length],
  opacity: 0.55 + ((i * 41) % 45) / 100,
  dur:     `${1.2 + (i % 6) * 0.5}s`,
  del:     `${(i * 0.13) % 5}s`,
}));

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EqBars({ accent }: { accent: string }) {
  return (
    <div className="eq-bars">
      {[0, 1, 2].map(i => (
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
  const { playTrack, track: currentTrack, playing, shuffle, toggleShuffle } = usePlayer();

  const [cargando, setCargando] = useState(true);
  const [mounted,  setMounted]  = useState(false);

  const id       = Number(params.id);
  const playlist = PLAYLISTS_PUBLICAS.find(p => p.id === id);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/usuario"); return; }
      setCargando(false);
    })();
  }, []);

  if (cargando) return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
      Cargando...
    </div>
  );

  if (!playlist) return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
      Playlist no encontrada.{" "}
      <span style={{ color: "#1CF094", cursor: "pointer" }} onClick={() => router.back()}>Volver</span>
    </div>
  );

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration ?? 0), 0);
  const accent = playlist.accent;

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      {/* ── Fondo galaxia ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 20% 30%, ${accent}18 0%, transparent 55%),
          radial-gradient(ellipse at 80% 70%, #6e2fff18 0%, transparent 55%),
          radial-gradient(ellipse at 50% 10%, #00d4ff0d 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, #0a0f2a 0%, #03040f 70%, #000 100%)
        `,
      }} />

      {/* Nebulosas */}
      <div style={{
        position: "fixed", top: "10%", left: "5%", width: "45vw", height: "45vw",
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(circle, ${accent}0f 0%, transparent 70%)`,
        animation: "nebula-drift 18s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "fixed", bottom: "5%", right: "5%", width: "50vw", height: "50vw",
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle, #6e2fff0f 0%, transparent 70%)",
        animation: "nebula-drift 24s ease-in-out 4s infinite reverse",
        filter: "blur(50px)",
      }} />

      {/* Estrellas de colores */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: "fixed", zIndex: 0, pointerEvents: "none",
          width: s.size, height: s.size, borderRadius: "50%",
          background: s.color,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          top: s.top, left: s.left, opacity: s.opacity,
          animation: `twinkle ${s.dur} ${s.del} ease-in-out infinite`,
        }} />
      ))}

      {/* ── Contenido ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto", padding: "36px 24px 140px" }}>

        {/* Botón volver */}
        <div style={{ marginBottom: "28px", animation: mounted ? "fade-in-up 0.5s ease both" : "none" }}>
          <button className="back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Inicio
          </button>
        </div>

        {/* ── Panel superior: portada + info + botones ── */}
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            marginBottom: "20px",
            borderColor: `${accent}22`,
            animation: mounted ? "fade-in-up 0.55s ease 0.05s both" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>

            {/* Portada */}
            <div style={{
              width: 160, height: 160, borderRadius: "18px",
              overflow: "hidden", flexShrink: 0,
              boxShadow: `0 0 60px ${accent}33, 0 12px 40px rgba(0,0,0,0.6)`,
              border: `1px solid ${accent}33`,
            }}>
              <img src={playlist.img} alt={playlist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Info + botones */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: "rgba(255,255,255,0.45)", fontSize: "0.72rem",
                fontFamily: "var(--font-nunito), sans-serif",
                letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 8px",
              }}>
                Playlist · {playlist.curator}
              </p>
              <h1 style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                fontWeight: 900, fontSize: "clamp(1.7rem, 5vw, 2.6rem)",
                background: `linear-gradient(90deg, #fff 0%, ${accent} 130%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1.1,
              }}>
                {playlist.name}
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.35)", fontSize: "0.8rem",
                fontFamily: "Arial, sans-serif", margin: "0 0 26px",
              }}>
                {playlist.tracks.length} {playlist.tracks.length === 1 ? "canción" : "canciones"} · {fmt(totalDuration)}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="play-all-btn"
                  onClick={() => playlist.tracks.length > 0 && playTrack(playlist.tracks[0], playlist.tracks)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#061210">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Reproducir todo
                </button>
                <button
                  className="shuffle-btn"
                  onClick={() => {
                    toggleShuffle();
                    if (playlist.tracks.length > 0) {
                      const r = Math.floor(Math.random() * playlist.tracks.length);
                      playTrack(playlist.tracks[r], playlist.tracks);
                    }
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: shuffle ? "rgba(28,240,148,0.18)" : "rgba(255,255,255,0.07)",
                    border: shuffle ? "1px solid rgba(28,240,148,0.5)" : "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "50px", padding: "12px 26px", cursor: "pointer",
                    color: shuffle ? "#1CF094" : "rgba(255,255,255,0.85)",
                    fontWeight: 700, fontSize: "0.9rem",
                    fontFamily: "var(--font-nunito), sans-serif",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                    boxShadow: shuffle ? "0 0 16px rgba(28,240,148,0.3)" : "none",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                  </svg>
                  Aleatorio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel inferior: lista de canciones ── */}
        <div
          className="glass-panel"
          style={{
            borderColor: `${accent}18`,
            animation: mounted ? "fade-in-up 0.55s ease 0.12s both" : "none",
          }}
        >
          {/* Cabecera tabla */}
          <div style={{
            display: "grid", gridTemplateColumns: "32px 1fr auto",
            gap: "16px", padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>#</span>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", letterSpacing: "0.8px", textTransform: "uppercase" }}>Título</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          {/* Filas */}
          <div className="tracks-scroll" style={{ padding: "6px 0" }}>
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
                      ? <EqBars accent={accent} />
                      : <span style={{
                          color: isActive ? accent : "rgba(255,255,255,0.3)",
                          fontSize: "0.8rem", fontFamily: "Arial, sans-serif",
                          fontWeight: isActive ? 700 : 400,
                        }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: isActive ? accent : "white",
                      fontWeight: 700, fontSize: "0.88rem",
                      fontFamily: "var(--font-nunito), sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color 0.15s",
                    }}>{t.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.74rem", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                      {t.artist}
                    </div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>
                    {fmt(t.duration ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
