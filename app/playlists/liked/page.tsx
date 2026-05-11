"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";
import type { Track } from "@/app/context/PlayerContext";

/* ── Estrellas densas vía láctea ── */
const STAR_COLORS = ["#ffffff","#ffffff","#ffffff","#ffffffdd","#1CF09466","#5eead455","#a3ff4744","#6e2fff55","#cc88ff66","#aaddff55","#ffffff88"];
const STARS = Array.from({ length: 320 }, (_, i) => ({
  top:   `${(i * 29 + 7)  % 100}%`,
  left:  `${(i * 43 + 13) % 100}%`,
  size:  i % 20 === 0 ? 3.5 : i % 8 === 0 ? 2.2 : i % 4 === 0 ? 1.4 : i % 2 === 0 ? 0.9 : 0.55,
  color: STAR_COLORS[i % STAR_COLORS.length],
  dur:   `${1.1 + (i % 7) * 0.45}s`,
  del:   `${(i * 0.11) % 6}s`,
  op:    0.4 + ((i * 37) % 55) / 100,
}));

const css = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes eq-bar {
    0%, 100% { transform: scaleY(0.25); }
    50%       { transform: scaleY(1); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.1; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.5); }
  }
  @keyframes milky-drift {
    0%   { transform: rotate(-18deg) scaleX(1);    opacity: 0.13; }
    50%  { transform: rotate(-18deg) scaleX(1.04); opacity: 0.18; }
    100% { transform: rotate(-18deg) scaleX(1);    opacity: 0.13; }
  }
  @keyframes nebula-drift {
    0%   { transform: translate(0,0) scale(1); }
    50%  { transform: translate(14px,-10px) scale(1.06); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes heartbeat {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.5); }
    50%  { transform: scale(1); }
    75%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes heart-glow {
    0%, 100% { filter: drop-shadow(0 0 6px #ff507888); }
    50%       { filter: drop-shadow(0 0 18px #ff5078cc); }
  }

  .back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,80,120,0.08);
    border: 1px solid rgba(255,80,120,0.22);
    border-radius: 50px; padding: 8px 20px;
    color: rgba(255,255,255,0.75); cursor: pointer;
    font-family: var(--font-nunito), sans-serif;
    font-weight: 700; font-size: 0.82rem;
    transition: background 0.18s, color 0.18s;
    backdrop-filter: blur(10px);
  }
  .back-btn:hover { background: rgba(255,80,120,0.16); color: #ff5078; }

  .play-all-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg, #ff5078 0%, #ff80a0 50%, #ff5078 100%);
    background-size: 200% auto;
    animation: shimmer-btn 3s linear infinite;
    border: none; border-radius: 50px;
    padding: 12px 30px; cursor: pointer;
    color: white; font-weight: 900; font-size: 0.92rem;
    font-family: var(--font-nunito), sans-serif;
    box-shadow: 0 4px 24px rgba(255,80,120,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .play-all-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 36px rgba(255,80,120,0.65);
  }

  .shuffle-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,80,120,0.08);
    border: 1px solid rgba(255,80,120,0.22);
    border-radius: 50px; padding: 12px 26px; cursor: pointer;
    color: rgba(255,255,255,0.85); font-weight: 700; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    backdrop-filter: blur(10px);
    transition: background 0.18s, color 0.18s, border-color 0.18s;
  }
  .shuffle-btn:hover { background: rgba(255,80,120,0.15); color: #ff5078; border-color: rgba(255,80,120,0.45); }
  .shuffle-btn.shuffle-on { background: rgba(255,80,120,0.18); color: #ff5078; border-color: rgba(255,80,120,0.5); box-shadow: 0 0 16px rgba(255,80,120,0.25); }

  /* Panel semitransparente rosa/rojo como el botón login pero en rosa */
  .glass-panel {
    background: rgba(255, 80, 120, 0.07);
    border: 1px solid rgba(255, 80, 120, 0.18);
    border-radius: 18px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,80,120,0.1);
  }

  .track-row {
    display: grid;
    grid-template-columns: 36px 1fr auto auto;
    align-items: center;
    gap: 14px;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .track-row:hover  { background: rgba(255,80,120,0.06); }
  .track-row.active { background: rgba(255,80,120,0.11); }

  .unlike-btn {
    background: none; border: none; cursor: pointer;
    color: #ff5078; display: flex; align-items: center;
    padding: 4px; transition: transform 0.15s;
    animation: heart-glow 2s ease-in-out infinite;
  }
  .unlike-btn:hover { transform: scale(1.25); }

  .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .eq-bar  { width: 3px; border-radius: 2px; transform-origin: bottom; }

  .tracks-scroll {
    overflow-y: auto; max-height: 440px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,80,120,0.2) transparent;
  }
  .tracks-scroll::-webkit-scrollbar { width: 3px; }
  .tracks-scroll::-webkit-scrollbar-thumb { background: rgba(255,80,120,0.25); border-radius: 2px; }

  .col-header {
    color: rgba(255,255,255,0.35);
    font-size: 0.68rem; font-family: Arial, sans-serif;
    letter-spacing: 0.8px; text-transform: uppercase;
    border-bottom: 1px solid rgba(255,80,120,0.12);
    padding-bottom: 10px; margin-bottom: 4px;
  }
`;

type LikedSong = { id: string; titulo: string; artista: string; accent?: string; duracion?: number };

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EqBars() {
  return (
    <div className="eq-bars">
      {[0,1,2].map(i => (
        <div key={i} className="eq-bar" style={{
          height: "100%", background: "#ff5078",
          animation: `eq-bar ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function LikedPage() {
  const router   = useRouter();
  const supabase = createClient();
  const { playTrack, track: currentTrack, playing, shuffle, toggleShuffle } = usePlayer();

  const [songs, setSongs]       = useState<LikedSong[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/usuario"); return; }
      const res = await fetch('/api/likes');
      if (res.ok) {
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      }
      setCargando(false);
    })();
  }, []);

  const unlike = async (song: LikedSong, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch('/api/likes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: song.titulo, artista: song.artista }),
    });
    setSongs(prev => prev.filter(s => s.id !== song.id));
  };

  const asTracks = (): Track[] => songs.map(s => ({
    title: s.titulo, artist: s.artista, accent: s.accent, duration: s.duracion,
  }));

  if (cargando) return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      {/* ── Fondo base: azul/morado profundo ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 40% 60%, #1a0a3a 0%, #0d0a2a 35%, #06080f 70%, #020305 100%)",
      }} />

      {/* Vía láctea diagonal — azul/morado/verde */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `linear-gradient(
          -22deg,
          transparent 10%,
          rgba(110,47,255,0.13) 25%,
          rgba(80,60,200,0.18) 38%,
          rgba(28,240,148,0.07) 50%,
          rgba(110,47,255,0.13) 62%,
          transparent 78%
        )`,
        animation: "milky-drift 16s ease-in-out infinite",
        filter: "blur(22px)",
      }} />

      {/* Nebulosas */}
      <div style={{ position: "fixed", top: "-5%",  left: "-5%",  width: "55vw", height: "55vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, #6e2fff22 0%, transparent 65%)", animation: "nebula-drift 20s ease-in-out infinite",          filter: "blur(55px)" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "60vw", height: "60vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, #3a10aa1a 0%, transparent 65%)", animation: "nebula-drift 26s ease-in-out 5s infinite reverse", filter: "blur(65px)" }} />
      <div style={{ position: "fixed", top: "35%",  left: "30%",  width: "40vw", height: "40vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, #1CF09410 0%, transparent 65%)", animation: "nebula-drift 18s ease-in-out 3s infinite",          filter: "blur(50px)" }} />
      <div style={{ position: "fixed", top: "10%",  right: "5%",  width: "35vw", height: "35vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, #4422cc18 0%, transparent 65%)", animation: "nebula-drift 22s ease-in-out 1s infinite reverse",  filter: "blur(45px)" }} />

      {/* ── Estrellas ── */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: "fixed", zIndex: 0, pointerEvents: "none",
          width: s.size, height: s.size, borderRadius: "50%",
          background: s.color,
          boxShadow: s.size > 1.5 ? `0 0 ${s.size * 3}px ${s.color}` : "none",
          top: s.top, left: s.left, opacity: s.op,
          animation: `twinkle ${s.dur} ${s.del} ease-in-out infinite`,
        }} />
      ))}

      {/* ── Contenido ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "32px 24px 140px" }}>

        {/* Botón volver */}
        <div style={{ marginBottom: "28px", animation: mounted ? "fade-in-up 0.45s ease both" : "none" }}>
          <button className="back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Mis playlists
          </button>
        </div>

        {/* ── Panel cabecera ── */}
        <div className="glass-panel" style={{
          padding: "32px", marginBottom: "16px",
          animation: mounted ? "fade-in-up 0.5s ease 0.05s both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "32px", flexWrap: "wrap" }}>

            {/* Portada */}
            <div style={{
              width: 200, height: 200, borderRadius: "16px", flexShrink: 0,
              background: "linear-gradient(145deg, #3a0020, #1a0010)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 16px 60px rgba(0,0,0,0.6), 0 0 50px rgba(255,80,120,0.25)",
              border: "1px solid rgba(255,80,120,0.2)",
            }}>
              <svg width="90" height="90" viewBox="0 0 24 24"
                fill="#ff5078"
                style={{ filter: "drop-shadow(0 0 20px #ff507899)" }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: "4px" }}>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.72rem",
                fontFamily: "var(--font-nunito), sans-serif",
                letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px",
              }}>
                Playlist
              </p>
              <h1 style={{
                margin: "0 0 10px",
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                background: "linear-gradient(90deg, #fff 0%, #ff5078 140%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1.1,
              }}>
                Me gusta
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
                fontFamily: "Arial, sans-serif", margin: "0 0 28px",
              }}>
                {songs.length} {songs.length === 1 ? "canción" : "canciones"}
              </p>

              {songs.length > 0 && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="play-all-btn" onClick={() => playTrack(asTracks()[0], asTracks())}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Reproducir todo
                  </button>
                  <button
                    className={`shuffle-btn${shuffle ? " shuffle-on" : ""}`}
                    onClick={() => {
                      toggleShuffle();
                      const tracks = asTracks();
                      const r = Math.floor(Math.random() * tracks.length);
                      playTrack(tracks[r], tracks);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                      <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                    </svg>
                    Aleatorio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Panel lista ── */}
        <div className="glass-panel" style={{ animation: mounted ? "fade-in-up 0.5s ease 0.12s both" : "none" }}>

          {/* Cabecera columnas */}
          <div className="col-header" style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr auto auto",
            gap: "14px", padding: "14px 20px 10px",
          }}>
            <span style={{ textAlign: "center" }}>#</span>
            <span>Título</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ alignSelf: "center" }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span />
          </div>

          {/* Filas */}
          <div className="tracks-scroll" style={{ padding: "4px 0 8px" }}>
            {songs.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "rgba(255,255,255,0.28)",
                fontFamily: "var(--font-nunito), sans-serif",
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,80,120,0.3)" style={{ marginBottom: "16px" }}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <div>Aún no has guardado ninguna canción.</div>
                <span style={{ fontSize: "0.85rem" }}>Pulsa el corazón en una canción para añadirla aquí.</span>
              </div>
            ) : songs.map((s, i) => {
              const track: Track = { title: s.titulo, artist: s.artista, accent: s.accent, duration: s.duracion };
              const isActive = currentTrack?.title === s.titulo && currentTrack?.artist === s.artista;
              return (
                <div key={s.id} className={`track-row${isActive ? " active" : ""}`} onClick={() => playTrack(track, asTracks())}>
                  {/* # / EQ */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isActive && playing
                      ? <EqBars />
                      : <span style={{ color: isActive ? "#ff5078" : "rgba(255,255,255,0.28)", fontSize: "0.8rem", fontFamily: "Arial, sans-serif", fontWeight: isActive ? 700 : 400 }}>{i + 1}</span>
                    }
                  </div>

                  {/* Título + Artista */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: isActive ? "#ff5078" : "white",
                      fontWeight: 700, fontSize: "0.88rem",
                      fontFamily: "var(--font-nunito), sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color 0.15s",
                    }}>
                      {s.titulo}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.74rem", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                      {s.artista}
                    </div>
                  </div>

                  {/* Duración */}
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>
                    {s.duracion ? fmt(s.duracion) : "—"}
                  </span>

                  {/* Quitar like */}
                  <button className="unlike-btn" onClick={e => unlike(s, e)} title="Quitar de Me gusta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5078" stroke="#ff5078" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
