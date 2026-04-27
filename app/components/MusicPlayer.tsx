"use client";
import { usePlayer } from "../context/PlayerContext";
import { useState, useRef } from "react";

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

export default function MusicPlayer() {
  const { track, playing, progress, elapsed, volume, toggle, next, prev, seek, setVolume } = usePlayer();
  const [muted, setMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volRef      = useRef<HTMLDivElement>(null);

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
                    {track.artist}
                  </div>
                </div>
                <button className="player-ctrl-btn" style={{ marginLeft: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
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
    </>
  );
}
