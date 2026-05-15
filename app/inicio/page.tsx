"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePlayer } from "@/app/context/PlayerContext";
import type { Track } from "@/app/context/PlayerContext";

// "Arctic Monkeys" → "arctic-monkeys", "Mónica" → "monica"
const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

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
    overflow-x: auto; padding-bottom: 6px; padding-top: 8px;
    scrollbar-width: none;
  }
  .scroll-row::-webkit-scrollbar { display: none; }
  .scroll-row .dash-card:hover { transform: none; }

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

  .mix-hits-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
  }

  .panel-scroll {
    overflow-y: auto; max-height: 240px;
    scrollbar-width: thin; scrollbar-color: rgba(28,240,148,0.25) transparent;
  }
  .panel-scroll::-webkit-scrollbar { width: 3px; }
  .panel-scroll::-webkit-scrollbar-track { background: transparent; }
  .panel-scroll::-webkit-scrollbar-thumb { background: rgba(28,240,148,0.3); border-radius: 2px; }
  .hits-scroll { scrollbar-color: rgba(255,110,247,0.25) transparent; }
  .hits-scroll::-webkit-scrollbar-thumb { background: rgba(255,110,247,0.3); }

  @keyframes nota-fall {
    0%   { transform: translateY(-30px) rotate(-12deg); opacity: 0; }
    18%  { opacity: 0.95; }
    82%  { opacity: 0.95; }
    100% { transform: translateY(48px) rotate(14deg); opacity: 0; }
  }
  .nota-rain {
    position: relative; width: 110px; height: 38px;
    overflow: hidden; flex-shrink: 0;
  }
  .nota {
    position: absolute; top: 0; left: var(--left, 10%);
    font-size: var(--size, 0.85rem); color: var(--color, #1CF094);
    animation: nota-fall var(--dur, 1.2s) var(--del, 0s) linear infinite;
    user-select: none; pointer-events: none; line-height: 1;
  }

  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; padding: 12px 16px;
    color: white; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: rgba(28,240,148,0.5); }
  .color-dot {
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s; flex-shrink: 0;
  }
  .color-dot:hover { transform: scale(1.15); }
  .color-dot.selected { border-color: white; transform: scale(1.15); }

  @keyframes backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .panel-backdrop {
    position: fixed; inset: 0; z-index: 299;
    background: rgba(0,4,12,0.8);
    backdrop-filter: blur(7px);
    animation: backdrop-in 0.3s ease both;
  }
  .panel-overlay {
    position: fixed; z-index: 300;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07);
    transition:
      top    0.48s cubic-bezier(0.4,0,0.2,1),
      left   0.48s cubic-bezier(0.4,0,0.2,1),
      width  0.48s cubic-bezier(0.4,0,0.2,1),
      height 0.48s cubic-bezier(0.4,0,0.2,1),
      border-radius 0.48s ease,
      opacity 0.3s ease;
  }
  .hover-card {
    border-radius: 18px;
    transition: border-color 0.25s, box-shadow 0.25s;
    cursor: pointer;
  }
  .hover-card:hover {
    box-shadow: 0 0 0 1px rgba(28,240,148,0.28), 0 8px 32px rgba(0,0,0,0.4);
  }

  @keyframes album-glow {
    0%, 100% { box-shadow: 0 0 12px 2px var(--ac, #1CF094), 0 0 32px 6px var(--ac2, #1CF09444); }
    50%       { box-shadow: 0 0 24px 6px var(--ac, #1CF094), 0 0 60px 16px var(--ac2, #1CF09444); }
  }
  .album-card {
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.9s cubic-bezier(0.34,1.1,0.64,1),
                opacity 0.9s cubic-bezier(0.4,0,0.2,1),
                border-color 0.9s ease,
                box-shadow 0.9s ease;
    border: 2px solid transparent;
    background: rgba(255,255,255,0.04);
    position: relative;
    flex-shrink: 0;
  }
  .album-card.active {
    border-color: var(--ac, #1CF094);
    animation: album-glow 2s ease-in-out infinite;
  }
`;

const ACCENTS = ["#1CF094","#6e2fff","#ff6ef7","#00d4ff","#ff9a00","#a3ff47","#ff3c3c"];

const COLOR_OPTIONS = [
  { accent: "#1CF094", bg: "linear-gradient(145deg,#001a00,#003a0a)" },
  { accent: "#6e2fff", bg: "linear-gradient(145deg,#0d0020,#1a0040)" },
  { accent: "#00d4ff", bg: "linear-gradient(145deg,#001520,#002a3a)" },
  { accent: "#ff6ef7", bg: "linear-gradient(145deg,#1a0020,#35003a)" },
  { accent: "#ff9a00", bg: "linear-gradient(145deg,#1a0800,#3a1800)" },
];

const EQ = Array.from({ length: 14 }, (_, i) => ({
  dur: `${(0.4 + (i % 5) * 0.1).toFixed(1)}s`,
  del: `${(i * 0.06).toFixed(2)}s`,
  h:   6 + (i % 6) * 5,
}));

const NOTE_CHARS = ['♩','♪','♫','♬'];
const MIX_NOTES = Array.from({ length: 10 }, (_, i) => ({
  char: NOTE_CHARS[i % 4],
  color: ['#1CF094','#a3ff47','#5eead4','#00ffcc','#88ffd4','#1CF094','#a3ff47','#5eead4','#00ffcc','#88ffd4'][i],
  left: `${4 + i * 9.5}%`,
  dur: `${1.0 + (i % 4) * 0.22}s`,
  del: `${(i * 0.19).toFixed(2)}s`,
  size: `${0.72 + (i % 3) * 0.13}rem`,
}));
const HITS_NOTES = Array.from({ length: 10 }, (_, i) => ({
  char: NOTE_CHARS[i % 4],
  color: ['#ff6ef7','#ff3c3c','#ff9a00','#ff4488','#ffaacc','#ff6ef7','#ff3c3c','#ff9a00','#ff4488','#ffaacc'][i],
  left: `${4 + i * 9.5}%`,
  dur: `${1.0 + (i % 4) * 0.22}s`,
  del: `${(i * 0.19).toFixed(2)}s`,
  size: `${0.72 + (i % 3) * 0.13}rem`,
}));

function fmtDur(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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

type UserPlaylist = { id: string; nombre: string; accent: string; bg: string; canciones?: number; image_url?: string | null };
type Artista = { nombre: string; genero: string; id_artista?: string; id?: string; imagen?: string };
type CancionDB = { id: string; titulo: string; duracion: number; num_reproducciones: number; artista: string; audio_url?: string | null };
type AlbumDB   = { id: string; titulo: string; año: string; canciones: number; caratula?: string; artista: string; artista_id: string };

export default function InicioPage() {
  const { playTrack } = usePlayer();
  const [user, setUser]               = useState<{ name: string; email: string; photo?: string | null } | null>(null);
  const [greeting, setGreeting]       = useState("Bienvenido");
  const [mounted, setMounted]         = useState(false);
  const [sparkMap, setSparkMap]       = useState<Record<string, SparkItem[]>>({});
  const router = useRouter();

  const [likedSet, setLikedSet]         = useState<Set<string>>(new Set());
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [artistas, setArtistas]         = useState<Artista[]>([]);
  const [mixCanciones, setMixCanciones] = useState<CancionDB[]>([]);
  const [topCanciones, setTopCanciones] = useState<CancionDB[]>([]);
  const [albums, setAlbums]             = useState<AlbumDB[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [addModal, setAddModal]         = useState<Track | null>(null);
  const [addFeedback, setAddFeedback]   = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum]   = useState(-1);
  const [windowStart, setWindowStart]   = useState(0);
  const [createOpen, setCreateOpen]     = useState(false);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);
  const [nuevoNombre, setNuevoNombre]   = useState("");
  const [colorIdx, setColorIdx]         = useState(0);
  const CAROUSEL_VISIBLE = 5;

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

      const [likesRes, plRes, artistasRes, topRes, mixRes, albumsRes] = await Promise.all([
        fetch('/api/likes'),
        fetch('/api/playlists'),
        fetch('/api/artista'),
        fetch('/api/canciones?top=5'),
        fetch('/api/canciones?limit=5'),
        fetch('/api/albums'),
      ]);
      if (likesRes.ok) {
        const data = await likesRes.json();
        if (Array.isArray(data)) {
          setLikedSet(new Set(data.map((s: any) => `${s.titulo}|${s.artista}`)));
        }
      }
      if (plRes.ok) {
        const data = await plRes.json();
        if (Array.isArray(data)) setUserPlaylists(data);
      }
      if (artistasRes.ok) {
        const data = await artistasRes.json();
        if (Array.isArray(data)) setArtistas(data);
      }
      if (topRes.ok) {
        const data = await topRes.json();
        if (Array.isArray(data)) setTopCanciones(data);
      }
      if (mixRes.ok) {
        const data = await mixRes.json();
        if (Array.isArray(data)) setMixCanciones(data);
      }
      if (albumsRes.ok) {
        const data = await albumsRes.json();
        console.log("Albums recibidos:", data.map((a: any) => ({ titulo: a.titulo, caratula: a.caratula })));
        if (Array.isArray(data)) setAlbums(data);
      }
      setCargando(false);
    })();
  }, []);

  const toggleLike = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${track.title}|${track.artist}`;
    const liked = likedSet.has(key);
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

  const addToPlaylist = async (playlistId: string, track: Track) => {
    const res = await fetch(`/api/playlists/${playlistId}/canciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: track.title, artista: track.artist, accent: track.accent, duracion: track.duration }),
    });
    setAddModal(null);
    const pl = userPlaylists.find(p => p.id === playlistId);
    if (res.status === 409) {
      setAddFeedback('Ya está en esa playlist');
    } else if (res.ok) {
      setAddFeedback(`Añadida a ${pl?.nombre ?? 'playlist'}`);
    } else {
      setAddFeedback('Error al añadir');
    }
    setTimeout(() => setAddFeedback(null), 2500);
  };

  const abrirCrear = (track: Track) => {
    setAddModal(null);
    setPendingTrack(track);
    setNuevoNombre("");
    setColorIdx(0);
    setCreateOpen(true);
  };

  const cerrarCrear = () => {
    setCreateOpen(false);
    setPendingTrack(null);
    setNuevoNombre("");
    setColorIdx(0);
  };

  const crearYAñadir = async () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    const color = COLOR_OPTIONS[colorIdx];
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, accent: color.accent, bg: color.bg }),
    });
    if (!res.ok) { setAddFeedback('Error al crear la playlist'); setTimeout(() => setAddFeedback(null), 2500); cerrarCrear(); return; }
    const nueva = await res.json();
    setUserPlaylists(prev => [...prev, nueva]);
    if (pendingTrack) {
      await fetch(`/api/playlists/${nueva.id}/canciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: pendingTrack.title, artista: pendingTrack.artist, accent: pendingTrack.accent, duracion: pendingTrack.duration }),
      });
      setAddFeedback(`Añadida a ${nombre}`);
    } else {
      setAddFeedback(`Playlist "${nombre}" creada`);
    }
    setTimeout(() => setAddFeedback(null), 2500);
    cerrarCrear();
  };

  if (cargando) return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #060910 60%, #000 100%)",
    }}>
      <style>{css + `
        @keyframes sk-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          border-radius: 8px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 600px 100%;
          animation: sk-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

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

        {/* User header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div className="sk" style={{ width: 56, height: 56, borderRadius: "50%" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="sk" style={{ width: 80, height: 11 }} />
              <div className="sk" style={{ width: 160, height: 28, borderRadius: 10 }} />
              <div className="sk" style={{ width: 150, height: 11 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div className="sk" style={{ width: 44, height: 32, borderRadius: 6 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div className="sk" style={{ width: 84, height: 52, borderRadius: 12 }} />
              <div className="sk" style={{ width: 84, height: 52, borderRadius: 12 }} />
            </div>
          </div>
        </div>

        {/* Artistas */}
        <div style={{ marginBottom: "44px" }}>
          <div className="sk" style={{ width: 72, height: 18, borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sk" style={{ flex: "1 1 140px", minWidth: "130px", maxWidth: "200px", height: 148, borderRadius: 16 }} />
            ))}
          </div>
        </div>

        {/* Mis Playlists */}
        <div style={{ marginBottom: "44px" }}>
          <div className="sk" style={{ width: 110, height: 18, borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk" style={{ flex: "1 1 160px", minWidth: "150px", maxWidth: "220px", height: 175, borderRadius: 16 }} />
            ))}
          </div>
        </div>

        {/* Mix semanal + Hits del momento */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: "44px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="sk" style={{ width: 100, height: 18, borderRadius: 6 }} />
            <div className="sk" style={{ height: 310, borderRadius: 18 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="sk" style={{ width: 130, height: 18, borderRadius: 6 }} />
            <div className="sk" style={{ height: 310, borderRadius: 18 }} />
          </div>
        </div>

        {/* Nuevos lanzamientos */}
        <div>
          <div className="sk" style={{ width: 160, height: 18, borderRadius: 6, marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sk" style={{ flex: "1 1 0", height: 165, borderRadius: 16 }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  const firstName  = user?.name?.split(" ")[0] ?? "";
  const mixTracks: Track[] = mixCanciones.map((c, i) => ({ title: c.titulo, artist: c.artista, accent: ACCENTS[i % ACCENTS.length], duration: c.duracion, audioUrl: c.audio_url ?? undefined }));
  const topTracks: Track[] = topCanciones.map((c, i) => ({ title: c.titulo, artist: c.artista, accent: ACCENTS[i % ACCENTS.length], duration: c.duracion, audioUrl: c.audio_url ?? undefined }));

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
                { label: "Guardadas", val: String(likedSet.size) },
                { label: "Playlists", val: String(userPlaylists.length) },
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

        {/* ── Artistas ── */}
        <section style={{ marginBottom: "44px", animation: mounted ? "fade-in-up 0.6s ease 0.1s both" : "none" }}>
          <SectionTitle>Artistas</SectionTitle>
          <div className="card-grid" style={{ marginTop: "16px" }}>
            {artistas.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito), sans-serif", padding: "16px 0" }}>
                Cargando artistas…
              </p>
            ) : artistas.map((a, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <div key={i} className="spark-host" style={{
                  flex: "1 1 140px", minWidth: "130px", maxWidth: "200px",
                  animation: `float-item ${2.8 + i * 0.15}s ease-in-out ${i * 0.42}s infinite`,
                }}>
                  {(sparkMap[`art-${i}`] ?? []).map(s => (
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
                      ['--glow-color' as string]: `${accent}66`,
                      ['--glow-border' as string]: `${accent}44`,
                      ['--streak-delay' as string]: `${i * 0.42}s`,
                      animationDuration: `${2.4 + i * 0.2}s`,
                      animationDelay: `${i * 0.42}s`,
                    } as React.CSSProperties}
                    onClick={() => router.push(`/artistas/${toSlug(a.nombre)}`)}
                    onMouseEnter={(e) => spawnSparks(`art-${i}`, e, accent)}
                  >
                    {a.imagen ? (
                      <img
                        src={a.imagen}
                        alt={a.nombre}
                        style={{
                          width: "64px", height: "64px", borderRadius: "50%", marginBottom: "12px",
                          objectFit: "cover", flexShrink: 0,
                          border: `2px solid ${accent}66`,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "64px", height: "64px", borderRadius: "50%", marginBottom: "12px",
                        background: `radial-gradient(circle at 35% 35%, ${accent}55 0%, ${accent}22 60%, transparent 100%)`,
                        border: `2px solid ${accent}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.8rem", color: accent, flexShrink: 0,
                      }}>
                        ♫
                      </div>
                    )}
                    <div style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "white", marginBottom: "3px", lineHeight: 1.2 }}>
                      {a.nombre}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>
                      {a.genero}
                    </div>
                    <button className="play-btn" style={{ marginTop: "10px" }}><PlayIcon /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Mis Playlists ── */}
        <section style={{ marginBottom: "44px", animation: mounted ? "fade-in-up 0.6s ease 0.18s both" : "none" }}>
          <SectionTitle>Mis Playlists</SectionTitle>
          <div className="card-grid" style={{ marginTop: "16px" }}>
            {userPlaylists.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito), sans-serif", padding: "16px 0" }}>
                Aún no tienes playlists.{" "}
                <span style={{ color: "#1CF094", cursor: "pointer" }} onClick={() => router.push("/playlists")}>Crear una</span>
              </p>
            ) : userPlaylists.map((pl, i) => (
              <div key={pl.id} className="spark-host" style={{
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
                  onClick={() => router.push(`/playlists/${pl.id}`)}
                >
                  <div style={{
                    height: "100px", background: pl.bg || `linear-gradient(145deg,${pl.accent}22,transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                  }}>
                    {pl.image_url
                      ? <img src={pl.image_url} alt={pl.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                      : <Vinyl accent={pl.accent} size={64} />
                    }
                    <div style={{ position: "absolute", bottom: "8px", right: "10px", zIndex: 1 }}>
                      <button className="play-btn" onClick={e => e.stopPropagation()}><PlayIcon /></button>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{
                      fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900,
                      fontSize: "0.8rem", color: "white", letterSpacing: "0.5px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{pl.nombre}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", marginTop: "3px" }}>
                      {pl.canciones === 0 ? "Sin canciones" : `${pl.canciones ?? 0} canciones`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mix semanal + Hits del momento ── */}
        <div className="mix-hits-grid" style={{
          marginBottom: "44px",
          animation: mounted ? "fade-in-up 0.6s ease 0.26s both" : "none",
        }}>

          {/* Mix semanal */}
          <section>
            <SectionTitle>Mix semanal</SectionTitle>
            <div
              className="hover-card"
              style={{
                marginTop: "16px",
                background: "linear-gradient(145deg, rgba(28,240,148,0.07) 0%, rgba(94,234,212,0.04) 100%)",
                border: "1px solid rgba(28,240,148,0.12)",
              }}
            >
              {/* Banner del mix */}
              <div style={{
                padding: "18px 20px",
                background: "linear-gradient(90deg, rgba(28,240,148,0.12), rgba(163,255,71,0.06))",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
                borderRadius: "18px 18px 0 0", overflow: "hidden",
              }}>
                <img src="/images/mixsemanal.jpg" alt="Mix semanal" style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  objectFit: "cover", flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", fontFamily: "var(--font-nunito), sans-serif" }}>Tu mix de la semana</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>Basado en tus gustos</div>
                </div>
                <div className="nota-rain">
                  {MIX_NOTES.map((n, i) => (
                    <span key={i} className="nota" style={{
                      ["--left" as string]: n.left,
                      ["--color" as string]: n.color,
                      ["--dur" as string]: n.dur,
                      ["--del" as string]: n.del,
                      ["--size" as string]: n.size,
                    } as React.CSSProperties}>{n.char}</span>
                  ))}
                </div>
              </div>
              {/* Lista de canciones */}
              <div className="panel-scroll">
                {mixTracks.map((track, i) => (
                  <div key={i} className="hit-row" onClick={() => playTrack(track, mixTracks)}>
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
                      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}><Link href={`/artistas/${toSlug(track.artist)}`} className="artist-link" onClick={e => e.stopPropagation()}>{track.artist}</Link></div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{fmtDur(track.duration ?? 0)}</div>
                    <button onClick={e => toggleLike(track, e)} style={{ background: "none", border: "none", cursor: "pointer", color: likedSet.has(`${track.title}|${track.artist}`) ? "#ff5078" : "rgba(255,255,255,0.25)", fontSize: "0.9rem", padding: "2px 4px", flexShrink: 0, transition: "color 0.15s" }}>♥</button>
                    <button onClick={e => { e.stopPropagation(); setAddModal(track); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: "1.1rem", padding: "2px 4px", flexShrink: 0, lineHeight: 1, transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1CF094")} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>+</button>
                    <button className="play-btn" style={{ width: "30px", height: "30px" }}><PlayIcon /></button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Hits del momento */}
          <section>
            <SectionTitle>Hits del momento</SectionTitle>
            <div
              className="hover-card"
              style={{
                marginTop: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{
                padding: "18px 20px",
                background: "linear-gradient(90deg, rgba(255,100,80,0.08), rgba(255,80,120,0.04))",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
                borderRadius: "18px 18px 0 0", overflow: "hidden",
              }}>
                <img src="/images/hitsdelmomento.jpg" alt="Hits del momento" style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  objectFit: "cover", flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: "0.9rem", fontFamily: "var(--font-nunito), sans-serif" }}>Top canciones globales</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>Actualizado hoy</div>
                </div>
                <div className="nota-rain">
                  {HITS_NOTES.map((n, i) => (
                    <span key={i} className="nota" style={{
                      ["--left" as string]: n.left,
                      ["--color" as string]: n.color,
                      ["--dur" as string]: n.dur,
                      ["--del" as string]: n.del,
                      ["--size" as string]: n.size,
                    } as React.CSSProperties}>{n.char}</span>
                  ))}
                </div>
              </div>
              <div className="panel-scroll hits-scroll">
                {topTracks.map((track, i) => (
                  <div key={i} className="hit-row" onClick={() => playTrack(track, topTracks)}>
                    <div style={{
                      width: "22px", textAlign: "center", flexShrink: 0,
                      color: i === 0 ? "#1CF094" : "rgba(255,255,255,0.35)",
                      fontWeight: 800, fontSize: "0.82rem",
                      fontFamily: "var(--font-nunito), sans-serif",
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "white", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-nunito), sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {track.title}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}><Link href={`/artistas/${toSlug(track.artist)}`} className="artist-link" onClick={e => e.stopPropagation()}>{track.artist}</Link></div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>{fmtDur(track.duration ?? 0)}</div>
                    <button onClick={e => toggleLike(track, e)} style={{ background: "none", border: "none", cursor: "pointer", color: likedSet.has(`${track.title}|${track.artist}`) ? "#ff5078" : "rgba(255,255,255,0.25)", fontSize: "0.9rem", padding: "2px 4px", flexShrink: 0, transition: "color 0.15s" }}>♥</button>
                    <button onClick={e => { e.stopPropagation(); setAddModal(track); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: "1.1rem", padding: "2px 4px", flexShrink: 0, lineHeight: 1, transition: "color 0.15s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1CF094")} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}>+</button>
                    <button className="play-btn" style={{ width: "30px", height: "30px" }}><PlayIcon /></button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Nuevos lanzamientos ── */}
        <section
          style={{ animation: mounted ? "fade-in-up 0.6s ease 0.34s both" : "none" }}
          onMouseLeave={() => setActiveAlbum(-1)}
        >
          <SectionTitle>Nuevos lanzamientos</SectionTitle>
          <div style={{ position: "relative", marginTop: "16px", overflow: "visible" }}>
            {/* Flecha izquierda */}
            <button
              onClick={() => {
                const nextActive = Math.max(0, activeAlbum <= 0 ? 0 : activeAlbum - 1);
                setActiveAlbum(nextActive);
                setWindowStart(Math.max(0, Math.min(nextActive, albums.length - CAROUSEL_VISIBLE)));
              }}
              disabled={activeAlbum <= 0}
              style={{
                position: "absolute", left: "-40px", top: "50%", transform: "translateY(-50%)",
                zIndex: 10, width: "24px", height: "24px",
                background: "none", border: "none",
                color: activeAlbum <= 0 ? "rgba(255,255,255,0.2)" : "#1CF094",
                cursor: activeAlbum <= 0 ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", fontWeight: 700, padding: 0,
                transition: "color 0.2s",
              }}
            >‹</button>

            {/* Álbumes visibles */}
            <div style={{
              display: "flex", gap: "14px", overflow: "visible",
              paddingTop: "14px", paddingBottom: "14px", alignItems: "center",
            }}>
              {albums.slice(windowStart, windowStart + CAROUSEL_VISIBLE).map((album, i) => {
                const realIdx = windowStart + i;
                const accent = ACCENTS[realIdx % ACCENTS.length];
                const isActive = realIdx === activeAlbum;
                return (
                  <div
                    key={album.id}
                    className={`album-card${isActive ? " active" : ""}`}
                    style={{
                      flex: `0 0 calc((100% - ${(CAROUSEL_VISIBLE - 1) * 14}px) / ${CAROUSEL_VISIBLE})`,
                      padding: 0,
                      transform: isActive ? "scale(1.08)" : "scale(1)",
                      opacity: isActive ? 1 : 0.72,
                      zIndex: isActive ? 5 : 1,
                      ["--ac" as string]: accent,
                      ["--ac2" as string]: `${accent}44`,
                    } as React.CSSProperties}
                    onMouseEnter={() => setActiveAlbum(realIdx)}
                    onClick={() => router.push(`/artistas/${toSlug(album.artista)}`)}
                  >
                    <div style={{ height: isActive ? "155px" : "120px", position: "relative", overflow: "hidden", transition: "height 0.9s cubic-bezier(0.34,1.1,0.64,1)" }}>
                      {album.caratula ? (
                        <img src={album.caratula} alt={album.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          background: `radial-gradient(circle at 40% 40%, ${accent}55, ${accent}11)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "2.5rem", color: accent,
                        }}>♪</div>
                      )}
                      <span className="tag-pill" style={{
                        position: "absolute", top: "8px", left: "8px",
                        background: `${accent}22`, border: `1px solid ${accent}55`, color: accent,
                      }}>
                        {album.año ? new Date(album.año).getFullYear() : ""}
                      </span>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {album.titulo}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif" }}>
                        <Link href={`/artistas/${toSlug(album.artista)}`} className="artist-link" onClick={e => e.stopPropagation()}>{album.artista}</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flecha derecha */}
            <button
              onClick={() => {
                const nextActive = Math.min(albums.length - 1, activeAlbum < 0 ? 0 : activeAlbum + 1);
                setActiveAlbum(nextActive);
                setWindowStart(Math.max(0, Math.min(nextActive - CAROUSEL_VISIBLE + 1, albums.length - CAROUSEL_VISIBLE)));
              }}
              disabled={activeAlbum >= albums.length - 1}
              style={{
                position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)",
                zIndex: 10, width: "24px", height: "24px",
                background: "none", border: "none",
                color: activeAlbum >= albums.length - 1 ? "rgba(255,255,255,0.2)" : "#1CF094",
                cursor: activeAlbum >= albums.length - 1 ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", fontWeight: 700, padding: 0,
                transition: "color 0.2s",
              }}
            >›</button>

            {/* Indicadores de puntos */}
            {albums.length > CAROUSEL_VISIBLE && (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "14px" }}>
                {Array.from({ length: albums.length - CAROUSEL_VISIBLE + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setWindowStart(i); setActiveAlbum(-1); }}
                    style={{
                      width: windowStart === i ? "18px" : "6px",
                      height: "6px", borderRadius: "3px",
                      background: windowStart === i ? "#1CF094" : "rgba(255,255,255,0.2)",
                      border: "none", cursor: "pointer", padding: 0,
                      transition: "width 0.25s, background 0.25s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Modal: añadir a playlist */}
      {addModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,4,12,0.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setAddModal(null)}
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
              {addModal.title} · {addModal.artist}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
              {userPlaylists.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.82rem", textAlign: "center", padding: "12px 0 4px" }}>
                  Aún no tienes playlists.
                </p>
              ) : userPlaylists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id, addModal!)}
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

            {/* Separador + botón Nueva playlist */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "14px 0 12px" }} />
            <button
              onClick={() => abrirCrear(addModal!)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", background: "rgba(28,240,148,0.07)",
                border: "1px dashed rgba(28,240,148,0.3)",
                borderRadius: "10px", padding: "10px 14px",
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(28,240,148,0.13)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(28,240,148,0.55)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(28,240,148,0.07)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(28,240,148,0.3)"; }}
            >
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(28,240,148,0.15)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1CF094" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span style={{ color: "#1CF094", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>
                Nueva playlist
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Nueva playlist */}
      {createOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 600,
            background: "rgba(0,4,12,0.82)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "backdrop-in 0.25s ease both",
          }}
          onClick={cerrarCrear}
        >
          <div
            style={{
              background: "linear-gradient(145deg,#0d1a12,#0a0f1a)",
              border: "1px solid rgba(28,240,148,0.2)",
              borderRadius: "20px", padding: "32px 28px",
              width: "100%", maxWidth: "400px",
              boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
              animation: "modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "white" }}>
                Nueva playlist
              </h2>
              <button
                onClick={cerrarCrear}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%", width: "32px", height: "32px",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              >×</button>
            </div>

            {pendingTrack && (
              <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Se añadirá: {pendingTrack.title} · {pendingTrack.artist}
              </p>
            )}

            <label style={{
              display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem",
              fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "0.5px",
              textTransform: "uppercase", marginBottom: "8px",
            }}>Nombre</label>
            <input
              className="modal-input"
              type="text"
              placeholder="Nombre de tu playlist…"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") crearYAñadir(); }}
              autoFocus
              maxLength={40}
            />

            <label style={{
              display: "block", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem",
              fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "0.5px",
              textTransform: "uppercase", margin: "20px 0 10px",
            }}>Color</label>
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
              <div style={{
                marginLeft: "auto", width: "48px", height: "48px", borderRadius: "12px",
                background: COLOR_OPTIONS[colorIdx].bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${COLOR_OPTIONS[colorIdx].accent}44`, fontSize: "1.4rem",
              }}>♫</div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
              <button
                onClick={cerrarCrear}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.88rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >Cancelar</button>
              <button
                onClick={crearYAñadir}
                disabled={!nuevoNombre.trim()}
                style={{
                  flex: 1, padding: "11px", borderRadius: "10px",
                  background: nuevoNombre.trim() ? "linear-gradient(135deg,#1CF094,#5eead4)" : "rgba(255,255,255,0.08)",
                  border: "none", cursor: nuevoNombre.trim() ? "pointer" : "not-allowed",
                  color: nuevoNombre.trim() ? "#0a0f1a" : "rgba(255,255,255,0.25)",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "0.88rem",
                  boxShadow: nuevoNombre.trim() ? "0 4px 18px rgba(28,240,148,0.4)" : "none",
                }}
              >Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {addFeedback && (
        <div style={{
          position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(28,240,148,0.15)", border: "1px solid rgba(28,240,148,0.35)",
          borderRadius: "50px", padding: "10px 22px",
          color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem",
          zIndex: 600, backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap",
        }}>
          {addFeedback}
        </div>
      )}
    </div>
  );
}
