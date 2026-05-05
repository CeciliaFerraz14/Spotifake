"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";
import type { Track } from "@/app/context/PlayerContext";

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
    grid-template-columns: 32px 1fr auto auto;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .track-row:hover { background: rgba(255,255,255,0.07); }
  .track-row.active { background: rgba(255,80,120,0.08); }
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
    background: linear-gradient(135deg, #ff5078, #ff80a0);
    border: none; border-radius: 50px;
    padding: 11px 28px; cursor: pointer;
    color: white; font-weight: 800; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    box-shadow: 0 4px 20px rgba(255,80,120,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .play-all-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px rgba(255,80,120,0.6);
  }
  .unlike-btn {
    background: none; border: none; cursor: pointer;
    color: #ff5078; font-size: 1rem;
    opacity: 0.7; transition: opacity 0.15s, transform 0.15s;
    padding: 4px; line-height: 1;
  }
  .unlike-btn:hover { opacity: 1; transform: scale(1.2); }
  .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .eq-bar { width: 3px; border-radius: 2px; transform-origin: bottom; }
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
      {[1, 2, 3].map((_, i) => (
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
  const { playTrack, track: currentTrack, playing } = usePlayer();

  const [songs, setSongs]   = useState<LikedSong[]>([]);
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #060910 60%, #000 100%)" }}>
      <style>{css}</style>

      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: "fixed", borderRadius: "50%", background: "white",
          width: i % 6 === 0 ? "2px" : "1px", height: i % 6 === 0 ? "2px" : "1px",
          opacity: 0.07 + ((i * 37) % 40) / 100,
          top: `${(i * 37 + 13) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 140px", position: "relative", zIndex: 1 }}>

        <div style={{ marginBottom: "32px", animation: mounted ? "fade-in-up 0.5s ease both" : "none" }}>
          <button className="back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Mis playlists
          </button>
        </div>

        {/* Cabecera */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: "32px",
          marginBottom: "40px", flexWrap: "wrap",
          animation: mounted ? "fade-in-up 0.5s ease 0.05s both" : "none",
        }}>
          <div style={{
            width: 180, height: 180, borderRadius: "20px",
            background: "linear-gradient(145deg,#1a001a,#3a0030)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 16px 60px rgba(255,80,120,0.3)",
            border: "1px solid rgba(255,80,120,0.2)",
            fontSize: "5rem", filter: "drop-shadow(0 0 20px rgba(255,80,120,0.7))",
          }}>
            ♥
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px" }}>
              Playlist
            </p>
            <h1 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
              fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              background: "linear-gradient(90deg, #fff 0%, #ff5078 120%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              lineHeight: 1.1,
            }}>
              Me gusta
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "Arial, sans-serif", margin: "0 0 24px" }}>
              {songs.length} {songs.length === 1 ? "canción" : "canciones"}
            </p>
            {songs.length > 0 && (
              <button className="play-all-btn" onClick={() => playTrack(asTracks()[0], asTracks())}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Reproducir todo
              </button>
            )}
          </div>
        </div>

        {/* Cabecera tabla */}
        <div style={{
          display: "grid", gridTemplateColumns: "32px 1fr auto auto",
          gap: "16px", padding: "0 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px",
          animation: mounted ? "fade-in-up 0.5s ease 0.1s both" : "none",
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>#</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" }}>Título</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span />
        </div>

        {songs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito), sans-serif" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px", opacity: 0.4 }}>♥</div>
            Aún no has guardado ninguna canción.<br />
            <span style={{ fontSize: "0.85rem" }}>Pulsa el corazón en una canción para añadirla aquí.</span>
          </div>
        ) : (
          <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.15s both" : "none" }}>
            {songs.map((s, i) => {
              const track: Track = { title: s.titulo, artist: s.artista, accent: s.accent, duration: s.duracion };
              const isActive = currentTrack?.title === s.titulo && currentTrack?.artist === s.artista;
              return (
                <div key={s.id} className={`track-row${isActive ? " active" : ""}`} onClick={() => playTrack(track, asTracks())}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isActive && playing
                      ? <EqBars />
                      : <span style={{ color: isActive ? "#ff5078" : "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontFamily: "Arial, sans-serif" }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: isActive ? "#ff5078" : "white", fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-nunito), sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.titulo}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                      {s.artista}
                    </div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>
                    {s.duracion ? fmt(s.duracion) : "—"}
                  </span>
                  <button className="unlike-btn" onClick={e => unlike(s, e)} title="Quitar de Me gusta">♥</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
