"use client";
import Link from "next/link";
import { usePlayer } from "../context/PlayerContext";
import { useState, useEffect, useRef } from "react";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const playerCss = `
  @keyframes shimmer-player {
    0%   { background-position: 0% center; }
    100% { background-position: 300% center; }
  }
  @keyframes spin-vinyl-p {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes slide-up-player {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes heartbeat {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.5); }
    50%  { transform: scale(1); }
    75%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  .heart-like-btn { animation: heartbeat 0.45s ease; }

  .player-root {
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 2000;
    background: rgba(5, 8, 18, 0.92);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    animation: slide-up-player 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .player-grad-top {
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #1CF094 25%, #5eead4 50%, #a3ff47 75%, transparent 100%);
    background-size: 300% auto;
    animation: shimmer-player 4s linear infinite;
  }

  .player-ctrl-btn {
    background: none; border: none; cursor: pointer; padding: 6px;
    color: rgba(255,255,255,0.5);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: color 0.2s, background 0.2s, transform 0.15s;
  }
  .player-ctrl-btn:hover {
    color: white;
    background: rgba(255,255,255,0.07);
    transform: scale(1.1);
  }

  .player-play-btn {
    width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    background-size: 200% auto;
    animation: shimmer-player 3s linear infinite;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 16px rgba(28,240,148,0.5);
    transition: transform 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .player-play-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 5px 24px rgba(28,240,148,0.7);
  }

  .progress-track {
    flex: 1; height: 4px; border-radius: 4px;
    background: rgba(255,255,255,0.1);
    cursor: pointer; position: relative;
    transition: height 0.2s;
  }
  .progress-track:hover { height: 6px; }
  .progress-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, #1CF094, #5eead4);
    pointer-events: none;
    transition: width 0.9s linear;
  }
  .progress-thumb {
    position: absolute; top: 50%; right: -6px;
    transform: translateY(-50%);
    width: 12px; height: 12px; border-radius: 50%;
    background: white; opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .progress-track:hover .progress-thumb { opacity: 1; }

  .vol-track {
    width: 80px; height: 4px; border-radius: 4px;
    background: rgba(255,255,255,0.1); cursor: pointer;
    position: relative;
  }
  .vol-fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, #1CF094, #5eead4);
    pointer-events: none;
  }
`;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Vinyl({ accent, playing }: { accent: string; playing: boolean }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle, ${accent} 0%, ${accent} 17%, #141414 18%, #141414 26%,
        #222 29%, #141414 33%, #222 39%, #141414 46%,
        #222 54%, #141414 62%, #1e1e1e 100%)`,
      animation: playing ? "spin-vinyl-p 4s linear infinite" : "none",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 8, height: 8, borderRadius: "50%", background: "#080808",
      }} />
    </div>
  );
}

type Playlist = { id: string; nombre: string; accent: string; bg: string };

const ACCENTS = ["#1CF094","#6e2fff","#ff6ef7","#00d4ff","#ff9a00","#a3ff47","#ff3c3c"];

export default function MusicPlayer() {
  const { track, playing, progress, elapsed, volume, toggle, next, prev, seek, setVolume } = usePlayer();
  const [muted, setMuted] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [heartAnim, setHeartAnim] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/likes').then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data)) {
        setLikedSet(new Set(data.map(s => `${s.titulo}|${s.artista}`)));
      }
    });
  }, []);

  const openAddModal = () => {
    setCreatingNew(false);
    setNewName("");
    fetch('/api/playlists').then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data)) setPlaylists(data);
    });
    setAddModal(true);
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!track) return;
    const res = await fetch(`/api/playlists/${playlistId}/canciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: track.title, artista: track.artist, accent: track.accent, duracion: track.duration }),
    });
    setAddModal(false);
    const pl = playlists.find(p => p.id === playlistId);
    if (res.status === 409) setFeedback('Ya está en esa playlist');
    else if (res.ok) setFeedback(`Añadida a ${pl?.nombre ?? 'playlist'}`);
    else setFeedback('Error al añadir');
    setTimeout(() => setFeedback(null), 2500);
  };

  const createAndAdd = async () => {
    if (!track || !newName.trim()) return;
    setCreating(true);
    const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newName.trim(), accent, bg: `linear-gradient(135deg,${accent}22,transparent)` }),
    });
    if (res.ok) {
      const pl = await res.json();
      await addToPlaylist(pl.id);
    } else {
      setFeedback('Error al crear playlist');
      setTimeout(() => setFeedback(null), 2500);
    }
    setCreating(false);
    setAddModal(false);
  };

  const toggleLike = async () => {
    if (!track) return;
    const key = `${track.title}|${track.artist}`;
    const liked = likedSet.has(key);
    setHeartAnim(false);
    setTimeout(() => setHeartAnim(true), 10);
    setTimeout(() => setHeartAnim(false), 500);
    if (liked) {
      await fetch('/api/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: track.title, artista: track.artist }),
      });
      setLikedSet(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: track.title, artista: track.artist, accent: track.accent, duracion: track.duration }),
      });
      setLikedSet(prev => new Set(prev).add(key));
    }
  };

  const accent   = track?.accent   ?? "#1CF094";
  const duration = track?.duration ?? 210;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current!.getBoundingClientRect();
    const pct  = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, pct)));
  };

  const handleVolClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = volRef.current!.getBoundingClientRect();
    const pct  = ((e.clientX - rect.left) / rect.width) * 100;
    setVolume(Math.round(Math.max(0, Math.min(100, pct))));
    setMuted(false);
  };

  const displayVol = muted ? 0 : volume;

  return (
    <>
      <style>{playerCss}</style>
      <div className="player-root">
        <div className="player-grad-top" />

        <div style={{
          maxWidth: "1400px", margin: "0 auto",
          padding: "0 20px",
          height: "72px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "16px",
        }}>

          {/* Izquierda: info del track */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <Vinyl accent={accent} playing={playing} />
            {track ? (
              <>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    color: "white", fontWeight: 700, fontSize: "0.85rem",
                    fontFamily: "var(--font-nunito), sans-serif",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {track.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>
                    <Link href={`/artistas/${toSlug(track.artist)}`} className="artist-link">{track.artist}</Link>
                  </div>
                </div>
                <button
                  className={`player-ctrl-btn${heartAnim ? " heart-like-btn" : ""}`}
                  style={{ marginLeft: "4px", color: track && likedSet.has(`${track.title}|${track.artist}`) ? "#ff5078" : undefined }}
                  onClick={toggleLike}
                  title={track && likedSet.has(`${track.title}|${track.artist}`) ? "Quitar de Me gusta" : "Añadir a Me gusta"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={track && likedSet.has(`${track.title}|${track.artist}`) ? "#ff5078" : "none"}
                    stroke={track && likedSet.has(`${track.title}|${track.artist}`) ? "#ff5078" : "currentColor"}
                    strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button
                  className="player-ctrl-btn"
                  onClick={openAddModal}
                  title="Añadir a playlist"
                  style={{ fontSize: "1.1rem", lineHeight: 1, fontWeight: 700 }}
                >
                  +
                </button>
              </>
            ) : (
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "rgba(255,255,255,0.25)", fontWeight: 600, fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                  Selecciona una canción
                </div>
                <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}>
                  SpotiFake Player
                </div>
              </div>
            )}
          </div>

          {/* Centro: controles + barra */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "320px", maxWidth: "480px" }}>
            {/* Botones */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Shuffle */}
              <button className="player-ctrl-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                  <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                </svg>
              </button>
              {/* Anterior */}
              <button className="player-ctrl-btn" onClick={prev}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
                </svg>
              </button>
              {/* Play/Pause */}
              <button
                className="player-play-btn"
                onClick={toggle}
                disabled={!track}
                style={{ opacity: track ? 1 : 0.4, cursor: track ? "pointer" : "default" }}
              >
                {playing
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0f1a"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0f1a"><polygon points="5,3 19,12 5,21"/></svg>
                }
              </button>
              {/* Siguiente */}
              <button className="player-ctrl-btn" onClick={next}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
                </svg>
              </button>
              {/* Repeat */}
              <button className="player-ctrl-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </button>
            </div>

            {/* Barra de progreso */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontFamily: "Arial, sans-serif", minWidth: "30px", textAlign: "right" }}>
                {fmt(elapsed)}
              </span>
              <div className="progress-track" ref={progressRef} onClick={handleProgressClick}>
                <div className="progress-fill" style={{ width: `${progress}%` }}>
                  <div className="progress-thumb" />
                </div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontFamily: "Arial, sans-serif", minWidth: "30px" }}>
                {fmt(duration)}
              </span>
            </div>
          </div>

          {/* Derecha: volumen */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
            {/* Icono volumen */}
            <button className="player-ctrl-btn" onClick={() => setMuted(m => !m)}>
              {displayVol === 0
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : displayVol < 50
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              }
            </button>
            {/* Slider de volumen */}
            <div className="vol-track" ref={volRef} onClick={handleVolClick}>
              <div className="vol-fill" style={{ width: `${displayVol}%` }} />
            </div>
          </div>

        </div>
      </div>
      {/* Modal añadir a playlist */}
      {addModal && track && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 3000,
            background: "rgba(0,4,12,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setAddModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg,#0d1a12,#0a0f1a)",
              border: "1px solid rgba(28,240,148,0.2)",
              borderRadius: "20px", padding: "28px 24px",
              width: "100%", maxWidth: "340px",
              boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: "1rem" }}>
              Añadir a playlist
            </h3>
            <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {track.title} · {track.artist}
            </p>

            {/* Playlists existentes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
              {playlists.length === 0 && !creatingNew && (
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif", textAlign: "center", padding: "8px 0" }}>
                  No tienes playlists aún
                </p>
              )}
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "10px 14px",
                    cursor: "pointer", width: "100%", textAlign: "left",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.borderColor = `${pl.accent}55`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: pl.accent, fontSize: "0.85rem" }}>♫</span>
                  </div>
                  <span style={{ color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>
                    {pl.nombre}
                  </span>
                </button>
              ))}
            </div>

            {/* Crear nueva playlist */}
            {creatingNew ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createAndAdd(); if (e.key === "Escape") setCreatingNew(false); }}
                  placeholder="Nombre de la playlist…"
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(28,240,148,0.3)",
                    borderRadius: "10px", padding: "10px 14px", color: "white",
                    fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", outline: "none", width: "100%",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={createAndAdd}
                    disabled={!newName.trim() || creating}
                    style={{
                      flex: 1, background: "linear-gradient(135deg,#1CF094,#5eead4)",
                      border: "none", borderRadius: "10px", padding: "10px",
                      color: "#0a0f1a", fontWeight: 800, fontFamily: "var(--font-nunito), sans-serif",
                      fontSize: "0.85rem", cursor: newName.trim() && !creating ? "pointer" : "default",
                      opacity: newName.trim() && !creating ? 1 : 0.5,
                    }}
                  >
                    {creating ? "Creando…" : "Crear y añadir"}
                  </button>
                  <button
                    onClick={() => setCreatingNew(false)}
                    style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px", padding: "10px 14px", color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreatingNew(true)}
                style={{
                  width: "100%", background: "rgba(28,240,148,0.08)",
                  border: "1px dashed rgba(28,240,148,0.35)",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#1CF094", fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(28,240,148,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(28,240,148,0.08)")}
              >
                + Nueva playlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {feedback && (
        <div style={{
          position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(28,240,148,0.15)", border: "1px solid rgba(28,240,148,0.35)",
          borderRadius: "50px", padding: "10px 22px",
          color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem",
          zIndex: 3001, backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap",
        }}>
          {feedback}
        </div>
      )}
    </>
  );
}
