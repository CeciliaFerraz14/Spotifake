"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";
import type { Track } from "@/app/context/PlayerContext";

const css = `
  @keyframes shimmer-dash {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes avatar-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(28,240,148,0.5), 0 0 30px 6px rgba(28,240,148,0.15); }
    50%       { box-shadow: 0 0 0 8px rgba(28,240,148,0), 0 0 30px 6px rgba(28,240,148,0.25); }
  }
  @keyframes spin-vinyl-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes eq-wave {
    0%, 100% { transform: scaleY(0.2); opacity: 0.5; }
    50%       { transform: scaleY(1);   opacity: 1; }
  }

  .dash-card {
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
  .dash-card:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(28,240,148,0.25);
    transform: translateY(-4px);
  }

  .play-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(28,240,148,0.45);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    flex-shrink: 0;
    opacity: 0;
  }
  .dash-card:hover .play-btn { opacity: 1; }
  .play-btn:hover {
    transform: scale(1.12);
    box-shadow: 0 6px 22px rgba(28,240,148,0.65);
  }

  .scroll-row {
    display: flex; gap: 14px;
    overflow-x: auto; padding-bottom: 6px;
    scrollbar-width: none;
  }
  .scroll-row::-webkit-scrollbar { display: none; }

  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 4px 2px 16px;
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

  .tag-pill {
    font-size: 0.6rem; font-weight: 800; letter-spacing: 1px;
    text-transform: uppercase; padding: 3px 8px; border-radius: 50px;
    font-family: var(--font-nunito), sans-serif;
  }

  .hit-row {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 16px; border-radius: 12px;
    transition: background 0.2s; cursor: pointer;
  }
  .hit-row:hover { background: rgba(255,255,255,0.06); }
  .hit-row:hover .play-btn { opacity: 1; }

  @keyframes mix-hover-float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-6px) scale(1.025); }
  }
  @keyframes mix-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes mix-glow-breathe {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 1;    transform: scale(1.08); }
  }
  @keyframes dot-expand {
    0%, 100% { transform: scaleX(1); }
    50%       { transform: scaleX(1.3); }
  }

  @keyframes float-item {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-11px); }
  }
  @keyframes speed-streak {
    0%        { left: -90%; opacity: 0; }
    8%        { opacity: 1; }
    44%       { opacity: 1; }
    52%, 100% { left: 130%; opacity: 0; }
  }
  @keyframes glow-accent-pulse {
    0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
    50%       { box-shadow: 0 10px 35px var(--glow-color, rgba(28,240,148,0.45)), 0 0 0 1px var(--glow-border, rgba(28,240,148,0.3)); }
  }

  @keyframes spark-out {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,0px))) scale(0); opacity: 0; }
  }

  .spark-host { position: relative; }
  .wave-card { position: relative; overflow: hidden; }
  .wave-card::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 100%; height: 100%;
    transform: translate(-50%,-50%) scale(0.3);
    border-radius: inherit;
    background: radial-gradient(ellipse at center, var(--glow-color, rgba(28,240,148,0.45)) 0%, transparent 70%);
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .wave-card:hover::before {
    transform: translate(-50%,-50%) scale(1.5);
    opacity: 1;
  }
  .wave-card::after {
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
`;

/* ── datos mock ── */
const LIBRARY: (Track & { icon: string })[] = [
  { title: "OK Computer",      artist: "Radiohead",        accent: "#6e2fff", icon: "💿", duration: 256 },
  { title: "Nevermind",        artist: "Nirvana",           accent: "#ff3c3c", icon: "🎸", duration: 198 },
  { title: "In Rainbows",      artist: "Radiohead",         accent: "#1CF094", icon: "🌈", duration: 222 },
  { title: "Is This It",       artist: "The Strokes",       accent: "#ff9a00", icon: "🎶", duration: 194 },
  { title: "AM",               artist: "Arctic Monkeys",    accent: "#00d4ff", icon: "🎵", duration: 212 },
  { title: "Tranquility Base", artist: "Arctic Monkeys",    accent: "#ff6ef7", icon: "🚀", duration: 241 },
];

const PLAYLISTS = [
  { name: "DARK MATTER",  songs: 41, accent: "#1CF094", bg: "linear-gradient(145deg,#001a00,#003a0a)" },
  { name: "NIGHT DRIVE",  songs: 32, accent: "#6e2fff", bg: "linear-gradient(145deg,#0d0020,#1a0040)" },
  { name: "CHILL WAVE",   songs: 28, accent: "#00d4ff", bg: "linear-gradient(145deg,#001520,#002a3a)" },
  { name: "EUPHORIA",     songs: 55, accent: "#ff6ef7", bg: "linear-gradient(145deg,#1a0020,#35003a)" },
  { name: "SOLAR FLARE",  songs: 36, accent: "#ff9a00", bg: "linear-gradient(145deg,#1a0800,#3a1800)" },
];

const RELEASES = [
  { title: "REGU",          artist: "The Synthwave Collective", img: "/images/Portada_1.jpg", tag: "NUEVO",        tagColor: "#1CF094" },
  { title: "Lluvia de Abril",artist: "Clara Montoya",           img: null, accent: "#6e2fff", tag: "HOY",          tagColor: "#a3ff47" },
  { title: "Midnight Echo", artist: "Broken Orbit",             img: null, accent: "#ff6ef7", tag: "ESTA SEMANA",  tagColor: "#5eead4" },
  { title: "Neon Pulse",    artist: "Synthwave Era",            img: null, accent: "#00d4ff", tag: "NUEVO",        tagColor: "#1CF094" },
];

const MIX: (Track & { durationLabel: string })[] = [
  { title: "Paranoid Android", artist: "Radiohead",       duration: 383, durationLabel: "6:23", accent: "#1CF094" },
  { title: "Last Nite",        artist: "The Strokes",      duration: 194, durationLabel: "3:14", accent: "#ff9a00" },
  { title: "R U Mine?",        artist: "Arctic Monkeys",   duration: 202, durationLabel: "3:22", accent: "#00d4ff" },
  { title: "Come as You Are",  artist: "Nirvana",          duration: 218, durationLabel: "3:38", accent: "#ff3c3c" },
  { title: "Creep",            artist: "Radiohead",         duration: 238, durationLabel: "3:58", accent: "#6e2fff" },
];

const HITS: (Track & { pos: number; durationLabel: string; trend: string })[] = [
  { pos: 1, title: "Blinding Lights", artist: "The Weeknd",    duration: 200, durationLabel: "3:20", trend: "up",   accent: "#ff6ef7" },
  { pos: 2, title: "Flowers",         artist: "Miley Cyrus",   duration: 201, durationLabel: "3:21", trend: "flat", accent: "#ff9a00" },
  { pos: 3, title: "As It Was",       artist: "Harry Styles",  duration: 157, durationLabel: "2:37", trend: "down", accent: "#00d4ff" },
  { pos: 4, title: "Anti-Hero",       artist: "Taylor Swift",  duration: 201, durationLabel: "3:21", trend: "up",   accent: "#1CF094" },
  { pos: 5, title: "Unholy",          artist: "Sam Smith",     duration: 156, durationLabel: "2:36", trend: "up",   accent: "#5eead4" },
];

const EQ = Array.from({ length: 14 }, (_, i) => ({
  dur: `${(0.4 + (i % 5) * 0.1).toFixed(1)}s`,
  del: `${(i * 0.06).toFixed(2)}s`,
  h:   6 + (i % 6) * 5,
}));

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up")   return <span style={{ color: "#1CF094", fontSize: "0.7rem" }}>▲</span>;
  if (trend === "down") return <span style={{ color: "#ff4d4d", fontSize: "0.7rem" }}>▼</span>;
  return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>—</span>;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0f1a">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  );
}

function Avatar({ name, photo, size = 52 }: { name: string; photo?: string | null; size?: number }) {
  const initials = name
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

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

function Vinyl({ accent, size = 56 }: { accent: string; size?: number }) {
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="section-title">{children}</h2>;
}

type SparkItem = { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number };

export default function InicioPage() {
  const { playTrack } = usePlayer();
  const [user, setUser]         = useState<{ name: string; email: string; photo?: string | null } | null>(null);
  const [greeting, setGreeting] = useState("Bienvenido");
  const [mounted, setMounted]   = useState(false);
  const [sparkMap, setSparkMap] = useState<Record<string, SparkItem[]>>({});
  const router = useRouter();

  const spawnSparks = (key: string, e: React.MouseEvent<HTMLDivElement>, accent: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const count = 10;
    const items: SparkItem[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.7;
      const dist = 28 + Math.random() * 24;
      return { id: Date.now() + i, x: cx, y: cy, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, color: accent, size: 2.5 + Math.random() * 3 };
    });
    setSparkMap(prev => ({ ...prev, [key]: items }));
    setTimeout(() => setSparkMap(prev => { const n = { ...prev }; delete n[key]; return n; }), 700);
  };

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    if (h < 12) setGreeting("Buenos días");
    else if (h < 20) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");

    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/"); return; }
      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email?.split("@")[0] ||
        "Usuario";
      const photo = u.user_metadata?.avatar_url ?? null;
      setUser({ name, email: u.email ?? "", photo });
    })();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "";

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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px 64px", position: "relative", zIndex: 1 }}>

        {/* ── Cabecera de usuario ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "40px", flexWrap: "wrap", gap: "16px",
          animation: mounted ? "fade-in-up 0.6s ease both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Avatar name={user?.name ?? "U"} photo={user?.photo} size={56} />
            <div>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.78rem",
                fontFamily: "var(--font-nunito), sans-serif", margin: "0 0 2px",
                letterSpacing: "0.5px",
              }}>
                {greeting}
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

          {/* EQ decorativo + stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "2.5px", height: "32px" }}>
              {EQ.map((b, i) => (
                <div key={i} style={{
                  width: "3px", height: `${b.h}px`, borderRadius: "2px",
                  background: "linear-gradient(to top, #1CF094, #a3ff47)",
                  transformOrigin: "bottom",
                  animation: `eq-wave ${b.dur} ${b.del} ease-in-out infinite`,
                }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { label: "Guardadas", val: "128" },
                { label: "Playlists", val: "12" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "8px 16px", textAlign: "center",
                }}>
                  <div style={{ color: "#1CF094", fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-nunito), sans-serif" }}>{s.val}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontFamily: "Arial, sans-serif", letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mi Biblioteca ── */}
        <section style={{ marginBottom: "44px", animation: mounted ? "fade-in-up 0.6s ease 0.1s both" : "none" }}>
          <SectionTitle>Mi Biblioteca</SectionTitle>
          <div className="card-grid" style={{ marginTop: "16px" }}>
            {LIBRARY.map((item, i) => (
              <div key={i} className="spark-host" style={{
                flex: "1 1 140px", minWidth: "130px", maxWidth: "200px",
                animation: `float-item ${2.8 + i * 0.15}s ease-in-out ${i * 0.42}s infinite`,
              }}>
                {(sparkMap[`lib-${i}`] ?? []).map(s => (
                  <div key={s.id} style={{
                    position: 'absolute', left: s.x, top: s.y,
                    width: s.size, height: s.size, borderRadius: '50%',
                    background: s.color,
                    boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${s.size * 4}px ${s.color}88`,
                    pointerEvents: 'none', zIndex: 30,
                    animation: 'spark-out 0.65s ease-out forwards',
                    ['--dx' as string]: `${s.dx}px`,
                    ['--dy' as string]: `${s.dy}px`,
                  } as React.CSSProperties} />
                ))}
                <div
                  className="dash-card wave-card glow-pulse-card"
                  style={{
                    padding: "16px 14px",
                    ['--glow-color' as string]: `${item.accent}66`,
                    ['--glow-border' as string]: `${item.accent}44`,
                    ['--streak-delay' as string]: `${i * 0.42}s`,
                    animationDuration: `${2.4 + i * 0.2}s`,
                    animationDelay: `${i * 0.42}s`,
                  } as React.CSSProperties}
                  onClick={() => playTrack(item, LIBRARY)}
                  onMouseEnter={(e) => spawnSparks(`lib-${i}`, e, item.accent ?? "#1CF094")}
                >
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "12px", marginBottom: "12px",
                    background: `radial-gradient(circle at 35% 35%, ${item.accent}55 0%, ${item.accent}22 60%, transparent 100%)`,
                    border: `1px solid ${item.accent}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.8rem",
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "white", marginBottom: "3px", lineHeight: 1.2 }}>
                    {item.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>
                    {item.artist}
                  </div>
                  <button className="play-btn" style={{ marginTop: "10px" }}><PlayIcon /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Playlists más escuchadas ── */}
        <section style={{ marginBottom: "44px", animation: mounted ? "fade-in-up 0.6s ease 0.18s both" : "none" }}>
          <SectionTitle>Playlists más escuchadas</SectionTitle>
          <div className="card-grid" style={{ marginTop: "16px" }}>
            {PLAYLISTS.map((pl, i) => (
              <div key={i} className="spark-host" style={{
                flex: "1 1 160px", minWidth: "150px", maxWidth: "220px",
                animation: `float-item ${3 + i * 0.12}s ease-in-out ${i * 0.5}s infinite`,
              }}>
                {(sparkMap[`pl-${i}`] ?? []).map(s => (
                  <div key={s.id} style={{
                    position: 'absolute', left: s.x, top: s.y,
                    width: s.size, height: s.size, borderRadius: '50%',
                    background: s.color,
                    boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${s.size * 4}px ${s.color}88`,
                    pointerEvents: 'none', zIndex: 30,
                    animation: 'spark-out 0.65s ease-out forwards',
                    ['--dx' as string]: `${s.dx}px`,
                    ['--dy' as string]: `${s.dy}px`,
                  } as React.CSSProperties} />
                ))}
                <div
                  className="dash-card wave-card glow-pulse-card"
                  style={{
                    padding: 0,
                    ['--glow-color' as string]: `${pl.accent}55`,
                    ['--glow-border' as string]: `${pl.accent}33`,
                    ['--streak-delay' as string]: `${i * 0.5}s`,
                    animationDuration: `${2.6 + i * 0.2}s`,
                    animationDelay: `${i * 0.5}s`,
                  } as React.CSSProperties}
                  onMouseEnter={(e) => spawnSparks(`pl-${i}`, e, pl.accent)}
                >
                  <div style={{
                    height: "100px", background: pl.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <Vinyl accent={pl.accent} size={64} />
                    <div style={{
                      position: "absolute", bottom: "8px", right: "10px",
                    }}>
                      <button className="play-btn"><PlayIcon /></button>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{
                      fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900,
                      fontSize: "0.8rem", color: "white", letterSpacing: "0.5px",
                    }}>{pl.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", marginTop: "3px" }}>
                      {pl.songs} canciones
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mix semanal + Hits del momento ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px",
          marginBottom: "44px",
          animation: mounted ? "fade-in-up 0.6s ease 0.26s both" : "none",
        }}>

          {/* Mix semanal */}
          <section>
            <SectionTitle>Mix semanal</SectionTitle>
            <div style={{
              marginTop: "16px",
              background: "linear-gradient(145deg, rgba(28,240,148,0.07) 0%, rgba(94,234,212,0.04) 100%)",
              border: "1px solid rgba(28,240,148,0.12)",
              borderRadius: "18px", overflow: "hidden",
            }}>
              {/* Banner del mix */}
              <div style={{
                padding: "18px 20px",
                background: "linear-gradient(90deg, rgba(28,240,148,0.12), rgba(163,255,71,0.06))",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #1CF094, #5eead4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", flexShrink: 0,
                }}>🎲</div>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", fontFamily: "var(--font-nunito), sans-serif" }}>Tu mix de la semana</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>Basado en tus gustos</div>
                </div>
              </div>
              {/* Lista de canciones */}
              {MIX.map((track, i) => (
                <div key={i} className="hit-row" onClick={() => playTrack(track, MIX)}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                    background: `hsl(${(i * 60 + 140) % 360}, 70%, 25%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", color: "rgba(255,255,255,0.7)",
                    fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-nunito), sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {track.title}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}>{track.artist}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{track.durationLabel}</div>
                  <button className="play-btn" style={{ width: "30px", height: "30px" }}><PlayIcon /></button>
                </div>
              ))}
            </div>
          </section>

          {/* Hits del momento */}
          <section>
            <SectionTitle>Hits del momento</SectionTitle>
            <div style={{
              marginTop: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "18px", overflow: "hidden",
            }}>
              <div style={{
                padding: "18px 20px",
                background: "linear-gradient(90deg, rgba(255,100,80,0.08), rgba(255,80,120,0.04))",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff6ef7, #ff3c3c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", flexShrink: 0,
                }}>🔥</div>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", fontFamily: "var(--font-nunito), sans-serif" }}>Top canciones globales</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>Actualizado hoy</div>
                </div>
              </div>
              {HITS.map((h, i) => (
                <div key={i} className="hit-row" onClick={() => playTrack(h, HITS)}>
                  <div style={{
                    width: "22px", textAlign: "center", flexShrink: 0,
                    color: i === 0 ? "#1CF094" : "rgba(255,255,255,0.35)",
                    fontWeight: 800, fontSize: "0.82rem",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}>
                    {h.pos}
                  </div>
                  <TrendIcon trend={h.trend} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-nunito), sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {h.title}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}>{h.artist}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{h.durationLabel}</div>
                  <button className="play-btn" style={{ width: "30px", height: "30px" }}><PlayIcon /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Nuevos lanzamientos ── */}
        <section style={{ animation: mounted ? "fade-in-up 0.6s ease 0.34s both" : "none" }}>
          <SectionTitle>Nuevos lanzamientos</SectionTitle>
          <div className="scroll-row" style={{ marginTop: "16px" }}>
            {RELEASES.map((r, i) => (
              <div key={i} className="dash-card" style={{ minWidth: "170px", overflow: "hidden", padding: 0 }}>
                {/* Portada */}
                <div style={{
                  height: "120px", position: "relative", overflow: "hidden",
                  background: r.img ? undefined : `radial-gradient(circle at 40% 40%, ${r.accent}55, ${r.accent}11)`,
                }}>
                  {r.img
                    ? <img src={r.img} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>🎵</div>
                  }
                  <span className="tag-pill" style={{
                    position: "absolute", top: "8px", left: "8px",
                    background: `${r.tagColor}22`,
                    border: `1px solid ${r.tagColor}55`,
                    color: r.tagColor,
                  }}>
                    {r.tag}
                  </span>
                  <button className="play-btn" style={{ position: "absolute", bottom: "8px", right: "8px" }}>
                    <PlayIcon />
                  </button>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}>{r.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
