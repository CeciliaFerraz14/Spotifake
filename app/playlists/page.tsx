"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PLAYLISTS, Playlist } from "./playlistsData";

const css = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes avatar-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(28,240,148,0.5), 0 0 30px 6px rgba(28,240,148,0.15); }
    50%       { box-shadow: 0 0 0 8px rgba(28,240,148,0), 0 0 30px 6px rgba(28,240,148,0.25); }
  }
  @keyframes float-item {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-11px); }
  }
  @keyframes spark-out {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,0px))) scale(0); opacity: 0; }
  }
  @keyframes glow-accent-pulse {
    0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
    50%       { box-shadow: 0 10px 35px var(--glow-color, rgba(28,240,148,0.45)), 0 0 0 1px var(--glow-border, rgba(28,240,148,0.3)); }
  }
  @keyframes speed-streak {
    0%        { left: -90%; opacity: 0; }
    8%        { opacity: 1; }
    44%       { opacity: 1; }
    52%, 100% { left: 130%; opacity: 0; }
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin-vinyl-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .pl-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    transition: background 0.25s, transform 0.25s, border-color 0.25s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
  }
  .pl-card:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(28,240,148,0.25);
    transform: translateY(-4px);
  }
  .pl-card.wave-card::after {
    content: '';
    position: absolute;
    top: -10%; left: -90%;
    width: 55%; height: 120%;
    background: linear-gradient(
      105deg,
      transparent 15%,
      rgba(28,240,148,0.07) 38%,
      rgba(163,255,71,0.22) 50%,
      rgba(94,234,212,0.10) 62%,
      transparent 85%
    );
    transform: skewX(-15deg);
    pointer-events: none;
    z-index: 5;
    animation: speed-streak 3s ease-in-out var(--streak-delay, 0s) infinite;
  }
  .glow-pulse-card {
    animation: glow-accent-pulse ease-in-out infinite;
  }

  .play-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(28,240,148,0.45);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    flex-shrink: 0;
    opacity: 0;
  }
  .pl-card:hover .play-btn { opacity: 1; }
  .play-btn:hover {
    transform: scale(1.12);
    box-shadow: 0 6px 22px rgba(28,240,148,0.65);
  }

  .section-title {
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
    font-weight: 900; font-size: 1.1rem;
    color: white; letter-spacing: -0.2px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-title::after {
    content: "";
    flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(28,240,148,0.25), transparent);
  }

  .create-btn {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    border: none; border-radius: 50px;
    padding: 10px 22px; cursor: pointer;
    color: #0a0f1a; font-weight: 800; font-size: 0.88rem;
    font-family: var(--font-nunito), sans-serif;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 20px rgba(28,240,148,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .create-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px rgba(28,240,148,0.6);
  }

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,4,12,0.82);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: backdrop-in 0.25s ease both;
  }
  .modal-box {
    background: linear-gradient(145deg, #0d1a12, #0a0f1a);
    border: 1px solid rgba(28,240,148,0.2);
    border-radius: 20px;
    padding: 32px 28px;
    width: 100%; max-width: 400px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
    animation: modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .modal-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 12px 16px;
    color: white; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .modal-input:focus {
    border-color: rgba(28,240,148,0.5);
  }
  .color-dot {
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .color-dot:hover { transform: scale(1.15); }
  .color-dot.selected { border-color: white; transform: scale(1.15); }

  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 4px 2px 16px;
  }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 20px;
    text-align: center;
    gap: 16px;
  }
`;

const COLOR_OPTIONS = [
  { accent: "#1CF094", bg: "linear-gradient(145deg,#001a00,#003a0a)" },
  { accent: "#6e2fff", bg: "linear-gradient(145deg,#0d0020,#1a0040)" },
  { accent: "#00d4ff", bg: "linear-gradient(145deg,#001520,#002a3a)" },
  { accent: "#ff6ef7", bg: "linear-gradient(145deg,#1a0020,#35003a)" },
  { accent: "#ff9a00", bg: "linear-gradient(145deg,#1a0800,#3a1800)" },
];


type SparkItem = { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number };

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#0a0f1a">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function Vinyl({ accent, size = 60 }: { accent: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle, ${accent} 0%, ${accent} 17%, #141414 18%, #141414 25%, #222 28%, #141414 32%, #222 38%, #141414 44%, #222 52%, #141414 60%, #1e1e1e 100%)`,
      animation: "spin-vinyl-slow 8s linear infinite",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: size * 0.15, height: size * 0.15,
        borderRadius: "50%", background: "#080808",
      }} />
    </div>
  );
}

function Avatar({ name, photo, size = 52 }: { name: string; photo?: string | null; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (photo) {
    return (
      <img src={photo} alt={name} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover",
        animation: "avatar-pulse 3s ease-in-out infinite",
        border: "2px solid rgba(28,240,148,0.5)",
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #1CF094, #5eead4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-nunito), sans-serif",
      fontWeight: 900, fontSize: size * 0.35,
      color: "#0a0f1a",
      animation: "avatar-pulse 3s ease-in-out infinite",
      flexShrink: 0,
    }}>
      {initials || "?"}
    </div>
  );
}

export default function PlaylistsPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]           = useState<any>(null);
  const [cargando, setCargando]   = useState(true);
  const [mounted, setMounted]     = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLISTS);
  const [sparkMap, setSparkMap]   = useState<Record<string, SparkItem[]>>({});

  // Modal estado
  const [modalOpen, setModalOpen]       = useState(false);
  const [nuevoNombre, setNuevoNombre]   = useState("");
  const [colorIdx, setColorIdx]         = useState(0);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/usuario"); return; }
      setUser(u);
      setCargando(false);
    })();
  }, []);

  const spawnSparks = (key: string, e: React.MouseEvent<HTMLDivElement>, accent: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const count = 10;
    const items: SparkItem[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const dist  = 28 + Math.random() * 24;
      return { id: Date.now() + i, x: cx, y: cy, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, color: accent, size: 2.5 + Math.random() * 3 };
    });
    setSparkMap(prev => ({ ...prev, [key]: items }));
    setTimeout(() => setSparkMap(prev => { const n = { ...prev }; delete n[key]; return n; }), 700);
  };

  const crearPlaylist = () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    const color = COLOR_OPTIONS[colorIdx];
    setPlaylists(prev => [
      ...prev,
      { id: Date.now(), nombre, canciones: 0, accent: color.accent, bg: color.bg, tracks: [] },
    ]);
    setNuevoNombre("");
    setColorIdx(0);
    setModalOpen(false);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setNuevoNombre("");
    setColorIdx(0);
  };

  if (cargando) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
        Cargando...
      </div>
    );
  }

  const nombre    = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuario";
  const firstName = nombre.split(" ")[0];
  const photo     = user?.user_metadata?.avatar_url ?? null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #060910 60%, #000 100%)",
    }}>
      <style>{css}</style>

      {/* Estrellas de fondo */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          width: i % 6 === 0 ? "2px" : "1px", height: i % 6 === 0 ? "2px" : "1px",
          borderRadius: "50%", background: "white",
          opacity: 0.08 + ((i * 37) % 40) / 100,
          top: `${(i * 37 + 13) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 120px", position: "relative", zIndex: 1 }}>

        {/* ── Cabecera de usuario ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "40px", flexWrap: "wrap", gap: "16px",
          animation: mounted ? "fade-in-up 0.6s ease both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Avatar name={nombre} photo={photo} size={56} />
            <div>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.78rem",
                fontFamily: "var(--font-nunito), sans-serif", margin: "0 0 2px",
                letterSpacing: "0.5px",
              }}>
                Mis playlists
              </p>
              <h1 style={{
                margin: 0,
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                fontWeight: 900, fontSize: "1.6rem",
                background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.75) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1.1,
              }}>
                {firstName || "—"}
              </h1>
              {user?.email && (
                <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", margin: "3px 0 0", fontFamily: "Arial, sans-serif" }}>
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Botón crear playlist */}
          <button className="create-btn" onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0f1a" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5"  y1="12" x2="19" y2="12" />
            </svg>
            Nueva playlist
          </button>
        </div>

        {/* ── Sección título ── */}
        <section style={{ animation: mounted ? "fade-in-up 0.6s ease 0.1s both" : "none" }}>
          <h2 className="section-title">
            Colección
            <span style={{
              background: "rgba(28,240,148,0.15)",
              border: "1px solid rgba(28,240,148,0.3)",
              color: "#1CF094",
              fontSize: "0.62rem", fontWeight: 800,
              letterSpacing: "1px", textTransform: "uppercase",
              padding: "3px 10px", borderRadius: "50px",
              fontFamily: "var(--font-nunito), sans-serif",
            }}>
              {playlists.length} playlists
            </span>
          </h2>

          {/* Estado vacío */}
          {playlists.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "3.5rem", opacity: 0.3 }}>♫</div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito), sans-serif", fontSize: "1rem", margin: 0 }}>
                Aún no tienes playlists
              </p>
              <button className="create-btn" onClick={() => setModalOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0f1a" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5"  y1="12" x2="19" y2="12" />
                </svg>
                Crear mi primera playlist
              </button>
            </div>
          ) : (
            /* Grid de playlists */
            <div className="card-grid" style={{ marginTop: "16px" }}>
              {playlists.map((pl, i) => (
                <div
                  key={pl.id}
                  className="spark-host"
                  style={{
                    flex: "1 1 160px", minWidth: "150px", maxWidth: "220px",
                    position: "relative",
                    animation: `float-item ${3 + i * 0.12}s ease-in-out ${i * 0.5}s infinite`,
                  }}
                >
                  {/* Sparks */}
                  {(sparkMap[`pl-${i}`] ?? []).map(s => (
                    <div key={s.id} style={{
                      position: "absolute", left: s.x, top: s.y,
                      width: s.size, height: s.size, borderRadius: "50%",
                      background: s.color,
                      boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${s.size * 4}px ${s.color}88`,
                      pointerEvents: "none", zIndex: 30,
                      animation: "spark-out 0.65s ease-out forwards",
                      ["--dx" as string]: `${s.dx}px`,
                      ["--dy" as string]: `${s.dy}px`,
                    } as React.CSSProperties} />
                  ))}

                  <div
                    className="pl-card wave-card glow-pulse-card"
                    style={{
                      padding: 0,
                      ["--glow-color" as string]: `${pl.accent}55`,
                      ["--glow-border" as string]: `${pl.accent}33`,
                      ["--streak-delay" as string]: `${i * 0.5}s`,
                      animationDuration: `${2.6 + i * 0.2}s`,
                      animationDelay: `${i * 0.5}s`,
                    } as React.CSSProperties}
                    onMouseEnter={e => spawnSparks(`pl-${i}`, e, pl.accent)}
                    onClick={() => router.push(`/playlists/${pl.id}`)}
                  >
                    {/* Portada */}
                    <div style={{
                      height: "110px",
                      background: pl.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", overflow: "hidden",
                    }}>
                      <Vinyl accent={pl.accent} size={64} />
                      {/* Overlay de gradiente */}
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(circle at 30% 30%, ${pl.accent}22, transparent 70%)`,
                        pointerEvents: "none",
                      }} />
                      <div style={{ position: "absolute", bottom: "8px", right: "10px", zIndex: 2 }}>
                        <button
                          className="play-btn"
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/playlists/${pl.id}`);
                          }}
                        >
                          <PlayIcon />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{
                        fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900,
                        fontSize: "0.85rem", color: "white", letterSpacing: "0.3px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {pl.nombre}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", marginTop: "3px" }}>
                        {pl.canciones === 0 ? "Sin canciones" : `${pl.canciones} canciones`}
                      </div>
                      {/* Barra de acento */}
                      <div style={{
                        marginTop: "10px", height: "2px", borderRadius: "2px",
                        background: `linear-gradient(90deg, ${pl.accent}, transparent)`,
                        opacity: 0.5,
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Modal: Crear playlist ── */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={cerrarModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {/* Título del modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{
                margin: 0, fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 900, fontSize: "1.2rem", color: "white",
              }}>
                Nueva playlist
              </h2>
              <button
                onClick={cerrarModal}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%", width: "32px", height: "32px",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              >
                ×
              </button>
            </div>

            {/* Campo nombre */}
            <label style={{
              display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem",
              fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "0.5px",
              textTransform: "uppercase", marginBottom: "8px",
            }}>
              Nombre
            </label>
            <input
              className="modal-input"
              type="text"
              placeholder="Nombre de tu playlist…"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") crearPlaylist(); }}
              autoFocus
              maxLength={40}
            />

            {/* Selector de color */}
            <label style={{
              display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem",
              fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "0.5px",
              textTransform: "uppercase", margin: "20px 0 10px",
            }}>
              Color
            </label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {COLOR_OPTIONS.map((c, i) => (
                <button
                  key={i}
                  className={`color-dot${colorIdx === i ? " selected" : ""}`}
                  style={{ background: c.accent }}
                  onClick={() => setColorIdx(i)}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
              {/* Preview */}
              <div style={{
                marginLeft: "auto",
                width: "48px", height: "48px", borderRadius: "12px",
                background: COLOR_OPTIONS[colorIdx].bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${COLOR_OPTIONS[colorIdx].accent}44`,
                fontSize: "1.4rem",
              }}>
                ♫
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
              <button
                onClick={cerrarModal}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.88rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                Cancelar
              </button>
              <button
                onClick={crearPlaylist}
                disabled={!nuevoNombre.trim()}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  background: nuevoNombre.trim()
                    ? "linear-gradient(135deg, #1CF094, #5eead4)"
                    : "rgba(255,255,255,0.08)",
                  border: "none", cursor: nuevoNombre.trim() ? "pointer" : "not-allowed",
                  color: nuevoNombre.trim() ? "#0a0f1a" : "rgba(255,255,255,0.25)",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "0.88rem",
                  transition: "all 0.2s",
                  boxShadow: nuevoNombre.trim() ? "0 4px 18px rgba(28,240,148,0.4)" : "none",
                }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
