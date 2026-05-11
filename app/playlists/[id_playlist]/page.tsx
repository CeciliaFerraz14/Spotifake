"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";

type DbPlaylist = { id: string; nombre: string; accent: string; bg: string; image_url?: string | null };

const COLOR_OPTIONS = [
  { accent: "#1CF094", bg: "linear-gradient(145deg,#001a00,#003a0a)" },
  { accent: "#6e2fff", bg: "linear-gradient(145deg,#0d0020,#1a0040)" },
  { accent: "#00d4ff", bg: "linear-gradient(145deg,#001520,#002a3a)" },
  { accent: "#ff6ef7", bg: "linear-gradient(145deg,#1a0020,#35003a)" },
  { accent: "#ff9a00", bg: "linear-gradient(145deg,#1a0800,#3a1800)" },
];
type DbCancion  = { id: string; titulo: string; artista: string; accent?: string; duracion?: number; position: number };

/* ── Estrellas: dos capas, muchas y densas ── */
const STAR_COLORS = ["#ffffff","#ffffff","#ffffff","#ffffffdd","#1CF09466","#5eead455","#a3ff4744","#6e2fff55","#cc88ff66","#aaddff55","#ffffff88"];
const STARS_BG = Array.from({ length: 320 }, (_, i) => ({
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
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin-vinyl-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
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
    0%   { transform: rotate(-18deg) scaleX(1);   opacity: 0.13; }
    50%  { transform: rotate(-18deg) scaleX(1.04); opacity: 0.18; }
    100% { transform: rotate(-18deg) scaleX(1);   opacity: 0.13; }
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

  .track-row {
    display: grid;
    grid-template-columns: 36px 1fr auto auto auto;
    align-items: center;
    gap: 14px;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .track-row:hover  { background: rgba(28,240,148,0.06); }
  .track-row.active { background: rgba(28,240,148,0.11); }

  .back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(28,240,148,0.08);
    border: 1px solid rgba(28,240,148,0.22);
    border-radius: 50px; padding: 8px 20px;
    color: rgba(255,255,255,0.75); cursor: pointer;
    font-family: var(--font-nunito), sans-serif;
    font-weight: 700; font-size: 0.82rem;
    transition: background 0.18s, color 0.18s;
    backdrop-filter: blur(10px);
  }
  .back-btn:hover { background: rgba(28,240,148,0.16); color: #1CF094; }

  .play-all-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg, #1CF094 0%, #5eead4 50%, #a3ff47 100%);
    background-size: 200% auto;
    animation: shimmer-btn 3s linear infinite;
    border: none; border-radius: 50px;
    padding: 12px 30px; cursor: pointer;
    color: #061210; font-weight: 900; font-size: 0.92rem;
    font-family: var(--font-nunito), sans-serif;
    box-shadow: 0 4px 24px rgba(28,240,148,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .play-all-btn:hover {
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 36px rgba(28,240,148,0.65);
  }

  .shuffle-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(28,240,148,0.08);
    border: 1px solid rgba(28,240,148,0.22);
    border-radius: 50px; padding: 12px 26px; cursor: pointer;
    color: rgba(255,255,255,0.85); font-weight: 700; font-size: 0.9rem;
    font-family: var(--font-nunito), sans-serif;
    backdrop-filter: blur(10px);
    transition: background 0.18s, color 0.18s, border-color 0.18s;
  }
  .shuffle-btn:hover        { background: rgba(28,240,148,0.15); color: #1CF094; border-color: rgba(28,240,148,0.45); }
  .shuffle-btn.shuffle-on   { background: rgba(28,240,148,0.18); color: #1CF094; border-color: rgba(28,240,148,0.5); box-shadow: 0 0 16px rgba(28,240,148,0.25); }

  /* Panel semitransparente verde */
  .glass-panel {
    background: rgba(28, 240, 148, 0.07);
    border: 1px solid rgba(28, 240, 148, 0.18);
    border-radius: 18px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(28,240,148,0.12);
  }

  .eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .eq-bar  { width: 3px; border-radius: 2px; transform-origin: bottom; }

  .tracks-scroll {
    overflow-y: auto;
    max-height: 440px;
    scrollbar-width: thin;
    scrollbar-color: rgba(28,240,148,0.2) transparent;
  }
  .tracks-scroll::-webkit-scrollbar { width: 3px; }
  .tracks-scroll::-webkit-scrollbar-track { background: transparent; }
  .tracks-scroll::-webkit-scrollbar-thumb { background: rgba(28,240,148,0.25); border-radius: 2px; }

  .heart-btn {
    background: none; border: none; cursor: pointer;
    font-size: 0.95rem; padding: 4px; line-height: 1;
    transition: color 0.2s; display: flex; align-items: center;
  }
  .heart-btn.liked { color: #ff5078; animation: heartbeat 0.45s ease; }
  .heart-btn.unliked { color: rgba(255,255,255,0.22); }
  .heart-btn:hover { transform: scale(1.2); }

  .dots-btn-detail {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: rgba(28,240,148,0.1);
    border: 1px solid rgba(28,240,148,0.25);
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.85);
    transition: background 0.18s, transform 0.18s, color 0.18s, border-color 0.18s;
    backdrop-filter: blur(10px);
  }
  .dots-btn-detail:hover {
    background: rgba(28,240,148,0.2);
    color: #1CF094;
    transform: scale(1.07);
    border-color: rgba(28,240,148,0.5);
  }

  @keyframes ctx-in {
    from { opacity: 0; transform: scale(0.92) translateY(-6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ctx-menu {
    position: fixed; z-index: 1000;
    background: rgba(10, 18, 30, 0.95);
    border: 1px solid rgba(28,240,148,0.25);
    border-radius: 14px;
    padding: 6px;
    min-width: 200px;
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
    animation: ctx-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .ctx-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 9px;
    cursor: pointer; font-family: var(--font-nunito), sans-serif;
    font-size: 0.84rem; font-weight: 700;
    color: rgba(255,255,255,0.8);
    transition: background 0.15s, color 0.15s;
    border: none; background: none; width: 100%; text-align: left;
  }
  .ctx-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .ctx-item.danger:hover { background: rgba(255,60,60,0.12); color: #ff4d4d; }
  .ctx-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 8px; }

  .modal-bd {
    position: fixed; inset: 0; z-index: 800;
    background: rgba(0,4,12,0.78);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-bx {
    background: linear-gradient(145deg, #0d1a12, #0a0f1a);
    border: 1px solid rgba(28,240,148,0.2);
    border-radius: 20px; padding: 28px 24px;
    width: 100%; max-width: 420px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    animation: ctx-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
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
    width: 30px; height: 30px; border-radius: 50%;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .color-dot:hover { transform: scale(1.15); }
  .color-dot.selected { border-color: white; transform: scale(1.15); }
  .cover-section-label {
    display: block; color: rgba(255,255,255,0.5); font-size: 0.72rem;
    font-family: var(--font-nunito), sans-serif; letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 10px;
  }
  .cover-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 22px 0 16px;
    color: rgba(255,255,255,0.3);
    font-size: 0.7rem; font-family: var(--font-nunito), sans-serif;
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .cover-divider::before, .cover-divider::after {
    content: ""; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
  }
  .upload-zone {
    display: flex; align-items: center; gap: 14px;
    padding: 14px;
    background: rgba(255,255,255,0.04);
    border: 1px dashed rgba(28,240,148,0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .upload-zone:hover { background: rgba(28,240,148,0.06); border-color: rgba(28,240,148,0.5); }
  .upload-thumb {
    width: 56px; height: 56px; border-radius: 10px;
    object-fit: cover; flex-shrink: 0;
    background: rgba(0,0,0,0.4);
  }
  .remove-img-btn {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.3);
    color: #ff7b7b;
    padding: 7px 14px; border-radius: 8px;
    cursor: pointer; font-size: 0.78rem; font-weight: 700;
    font-family: var(--font-nunito), sans-serif;
    transition: background 0.15s;
  }
  .remove-img-btn:hover { background: rgba(255,80,80,0.18); }

  .col-header {
    color: rgba(255,255,255,0.35);
    font-size: 0.68rem;
    font-family: Arial, sans-serif;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(28,240,148,0.12);
    padding-bottom: 10px;
    margin-bottom: 4px;
  }
`;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Vinyl({ accent, size = 110, spinning }: { accent: string; size?: number; spinning?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle, ${accent} 0%, ${accent} 17%, #141414 18%, #141414 25%,
        #222 28%, #141414 32%, #222 38%, #141414 44%, #222 52%, #141414 60%, #1e1e1e 100%)`,
      animation: spinning ? "spin-vinyl-slow 6s linear infinite" : "none",
      position: "relative",
      boxShadow: `0 0 40px ${accent}55, 0 8px 32px rgba(0,0,0,0.6)`,
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
      {[0, 1, 2].map(i => (
        <div key={i} className="eq-bar" style={{
          height: "100%", background: accent,
          animation: `eq-bar ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function PlaylistDetailPage() {
  const router   = useRouter();
  const params   = useParams();
  const supabase = createClient();
  const { playTrack, track: currentTrack, playing, shuffle, toggleShuffle } = usePlayer();

  const [cargando, setCargando]   = useState(true);
  const [mounted,  setMounted]    = useState(false);
  const [playlist, setPlaylist]   = useState<DbPlaylist | null>(null);
  const [canciones, setCanciones] = useState<DbCancion[]>([]);
  const [likedSet, setLikedSet]   = useState<Set<string>>(new Set());

  // Men� + modales
  const [menuPos, setMenuPos]                   = useState<{ x: number; y: number } | null>(null);
  const [renameOpen, setRenameOpen]             = useState(false);
  const [renameValue, setRenameValue]           = useState("");
  const [coverOpen, setCoverOpen]               = useState(false);
  const [coverColorIdx, setCoverColorIdx]       = useState<number | null>(null);
  const [coverFile, setCoverFile]               = useState<File | null>(null);
  const [coverPreview, setCoverPreview]         = useState<string | null>(null);
  const [coverRemoveImage, setCoverRemoveImage] = useState(false);
  const [coverSaving, setCoverSaving]           = useState(false);
  const [coverError, setCoverError]             = useState<string | null>(null);

  const playlistId = params.id_playlist as string;

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/usuario"); return; }

      const [plRes, canRes, likesRes] = await Promise.all([
        fetch('/api/playlists'),
        fetch(`/api/playlists/${playlistId}/canciones`),
        fetch('/api/likes'),
      ]);

      if (plRes.ok) {
        const all: DbPlaylist[] = await plRes.json();
        const found = all.find(p => p.id === playlistId) ?? null;
        if (!found) { router.replace("/playlists"); return; }
        setPlaylist(found);
      } else {
        router.replace("/playlists"); return;
      }

      if (canRes.ok) {
        const data = await canRes.json();
        setCanciones(Array.isArray(data) ? data : []);
      }

      if (likesRes.ok) {
        const data = await likesRes.json();
        if (Array.isArray(data)) {
          setLikedSet(new Set(data.map((s: any) => `${s.titulo}|${s.artista}`)));
        }
      }

      setCargando(false);
    })();
  }, [playlistId]);

  const tracks = canciones.map(c => ({ title: c.titulo, artist: c.artista, accent: c.accent, duration: c.duracion }));
  const totalDuration = canciones.reduce((acc, c) => acc + (c.duracion ?? 0), 0);
  const accent = playlist?.accent ?? "#1CF094";

  const toggleLike = async (c: DbCancion, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${c.titulo}|${c.artista}`;
    const liked = likedSet.has(key);
    if (liked) {
      await fetch('/api/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: c.titulo, artista: c.artista }),
      });
      setLikedSet(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: c.titulo, artista: c.artista, accent: c.accent, duracion: c.duracion }),
      });
      setLikedSet(prev => new Set(prev).add(key));
    }
  };

  const abrirMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const x = Math.min(Math.max(8, r.right - menuWidth), window.innerWidth - menuWidth - 8);
    setMenuPos({ x, y: r.bottom + 6 });
  };

  const abrirRenombrar = () => {
    if (!playlist) return;
    setMenuPos(null);
    setRenameValue(playlist.nombre);
    setRenameOpen(true);
  };

  const confirmarRenombre = async () => {
    if (!playlist || !renameValue.trim()) return;
    const nombre = renameValue.trim();
    const res = await fetch(`/api/playlists/${playlist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) {
      setPlaylist(prev => prev ? { ...prev, nombre } : prev);
    }
    setRenameOpen(false);
    setRenameValue("");
  };

  const eliminarPlaylist = async () => {
    if (!playlist) return;
    setMenuPos(null);
    if (!confirm(`�Eliminar la playlist �${playlist.nombre}�? Esta acci�n no se puede deshacer.`)) return;
    const res = await fetch(`/api/playlists/${playlist.id}`, { method: 'DELETE' });
    if (res.ok) router.replace('/playlists');
  };

  const abrirPortada = () => {
    setMenuPos(null);
    setCoverColorIdx(null);
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoveImage(false);
    setCoverError(null);
    setCoverOpen(true);
  };

  const cerrarPortada = () => {
    setCoverOpen(false);
    setCoverFile(null);
    setCoverPreview(null);
    setCoverColorIdx(null);
    setCoverRemoveImage(false);
    setCoverError(null);
  };

  const elegirArchivoPortada = (file: File | null) => {
    setCoverError(null);
    if (!file) { setCoverFile(null); setCoverPreview(null); return; }
    if (file.size > 5 * 1024 * 1024) { setCoverError("La imagen no puede superar 5 MB"); return; }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setCoverError("Formato no v�lido (JPG, PNG, WEBP o GIF)"); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoveImage(false);
    setCoverColorIdx(null);
  };

  const guardarPortada = async () => {
    if (!playlist) return;
    setCoverSaving(true);
    setCoverError(null);
    try {
      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const res = await fetch(`/api/playlists/${playlist.id}/portada`, { method: 'POST', body: fd });
        if (!res.ok) { setCoverError("No se pudo subir la imagen"); return; }
        const { image_url } = await res.json();
        setPlaylist(prev => prev ? { ...prev, image_url } : prev);
      } else if (coverColorIdx !== null) {
        const c = COLOR_OPTIONS[coverColorIdx];
        const body: Record<string, string | null> = { accent: c.accent, bg: c.bg };
        if (playlist.image_url) body.image_url = null;
        const res = await fetch(`/api/playlists/${playlist.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) { setCoverError("No se pudo cambiar el color"); return; }
        setPlaylist(prev => prev ? { ...prev, accent: c.accent, bg: c.bg, image_url: null } : prev);
      } else if (coverRemoveImage && playlist.image_url) {
        const res = await fetch(`/api/playlists/${playlist.id}/portada`, { method: 'DELETE' });
        if (!res.ok) { setCoverError("No se pudo quitar la imagen"); return; }
        setPlaylist(prev => prev ? { ...prev, image_url: null } : prev);
      }
      cerrarPortada();
    } finally {
      setCoverSaving(false);
    }
  };

  const removeCancion = async (cancion: DbCancion, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/playlists/${playlistId}/canciones`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancion_id: cancion.id }),
    });
    setCanciones(prev => prev.filter(c => c.id !== cancion.id));
  };

  if (cargando) return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px", fontFamily: "var(--font-nunito), sans-serif" }}>
      Cargando...
    </div>
  );

  if (!playlist) return null;

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      {/* ── Fondo base: azul/morado profundo ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 40% 60%, #1a0a3a 0%, #0d0a2a 35%, #06080f 70%, #020305 100%)",
      }} />

      {/* Vía láctea diagonal — morado/azul/verde */}
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
      <div style={{ position: "fixed", top: "35%",  left: "30%",  width: "40vw", height: "40vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: `radial-gradient(circle, ${accent}12 0%, transparent 65%)`, animation: "nebula-drift 18s ease-in-out 3s infinite",          filter: "blur(50px)" }} />
      <div style={{ position: "fixed", top: "10%",  right: "5%",  width: "35vw", height: "35vw", borderRadius: "50%", zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle, #4422cc18 0%, transparent 65%)", animation: "nebula-drift 22s ease-in-out 1s infinite reverse",  filter: "blur(45px)" }} />

      {/* ── Estrellas parpadeantes ── */}
      {STARS_BG.map((s, i) => (
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
          padding: "32px",
          marginBottom: "16px",
          animation: mounted ? "fade-in-up 0.5s ease 0.05s both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "32px", flexWrap: "wrap" }}>

            {/* Portada */}
            <div style={{
              width: 200, height: 200, borderRadius: "16px", flexShrink: 0,
              background: playlist.bg || `linear-gradient(145deg, ${accent}33, ${accent}11)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 16px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}22`,
              border: `1px solid ${accent}22`,
              overflow: "hidden",
              position: "relative",
            }}>
              {playlist.image_url ? (
                <img
                  src={playlist.image_url}
                  alt={playlist.nombre}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Vinyl accent={accent} size={130} spinning={playing && canciones.some(c => c.titulo === currentTrack?.title)} />
              )}
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
                background: `linear-gradient(90deg, #fff 0%, ${accent} 140%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                lineHeight: 1.1,
              }}>
                {playlist.nombre}
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.3)", fontSize: "0.8rem",
                fontFamily: "Arial, sans-serif", margin: "0 0 28px",
              }}>
                {canciones.length} {canciones.length === 1 ? "canción" : "canciones"}
                {totalDuration > 0 && ` · ${fmt(totalDuration)}`}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="play-all-btn" onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#061210"><polygon points="5,3 19,12 5,21" /></svg>
                  Reproducir todo
                </button>
                <button
                  className={`shuffle-btn${shuffle ? " shuffle-on" : ""}`}
                  onClick={() => {
                    toggleShuffle();
                    if (tracks.length > 0) {
                      const r = Math.floor(Math.random() * tracks.length);
                      playTrack(tracks[r], tracks);
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
                  </svg>
                  Aleatorio
                </button>
                <button
                  className="dots-btn-detail"
                  onClick={abrirMenu}
                  title="Opciones de la playlist"
                  aria-label="Opciones de la playlist"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5"  cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel lista de canciones ── */}
        <div className="glass-panel" style={{ animation: mounted ? "fade-in-up 0.5s ease 0.12s both" : "none" }}>

          {/* Cabecera columnas */}
          <div className="col-header" style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr auto auto auto",
            gap: "14px", padding: "14px 20px 10px",
          }}>
            <span style={{ textAlign: "center" }}>#</span>
            <span>Título</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" style={{ alignSelf: "center" }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span />
            <span />
          </div>

          {/* Filas */}
          <div className="tracks-scroll" style={{ padding: "4px 0 8px" }}>
            {canciones.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "rgba(255,255,255,0.28)",
                fontFamily: "var(--font-nunito), sans-serif",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}>♫</div>
                Esta playlist está vacía.<br />
                <span style={{ fontSize: "0.85rem" }}>Añade canciones desde la página de inicio.</span>
              </div>
            ) : canciones.map((c, i) => {
              const track  = tracks[i];
              const isActive = currentTrack?.title === c.titulo && currentTrack?.artist === c.artista;
              const isLiked  = likedSet.has(`${c.titulo}|${c.artista}`);
              return (
                <div
                  key={c.id}
                  className={`track-row${isActive ? " active" : ""}`}
                  onClick={() => playTrack(track, tracks)}
                >
                  {/* # / EQ */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isActive && playing
                      ? <EqBars accent={accent} />
                      : <span style={{
                          color: isActive ? accent : "rgba(255,255,255,0.28)",
                          fontSize: "0.8rem", fontFamily: "Arial, sans-serif",
                          fontWeight: isActive ? 700 : 400,
                        }}>{i + 1}</span>
                    }
                  </div>

                  {/* Título + Artista */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      color: isActive ? accent : "white",
                      fontWeight: 700, fontSize: "0.88rem",
                      fontFamily: "var(--font-nunito), sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      transition: "color 0.15s",
                    }}>
                      {c.titulo}
                    </div>
                    <div style={{
                      color: "rgba(255,255,255,0.35)", fontSize: "0.74rem",
                      fontFamily: "Arial, sans-serif", marginTop: "2px",
                    }}>
                      {c.artista}
                    </div>
                  </div>

                  {/* Duración */}
                  <span style={{
                    color: "rgba(255,255,255,0.3)", fontSize: "0.78rem",
                    fontFamily: "Arial, sans-serif", flexShrink: 0,
                  }}>
                    {fmt(c.duracion ?? 0)}
                  </span>

                  {/* Corazón */}
                  <button
                    className={`heart-btn ${isLiked ? "liked" : "unliked"}`}
                    onClick={e => {
                      const btn = e.currentTarget;
                      btn.classList.remove("liked");
                      void btn.offsetWidth;
                      toggleLike(c, e);
                    }}
                    title={isLiked ? "Quitar de Me gusta" : "Añadir a Me gusta"}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24"
                      fill={isLiked ? "#ff5078" : "none"}
                      stroke={isLiked ? "#ff5078" : "currentColor"}
                      strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  {/* Quitar de playlist */}
                  <button
                    onClick={e => removeCancion(c, e)}
                    title="Quitar de la playlist"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.25)", fontSize: "1rem",
                      lineHeight: 1, padding: "4px", transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ff5078")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Men� contextual */}
      {menuPos && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setMenuPos(null)} />
          <div className="ctx-menu" style={{ top: menuPos.y, left: menuPos.x }}>
            <button className="ctx-item" onClick={abrirRenombrar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Cambiar nombre
            </button>
            <button className="ctx-item" onClick={abrirPortada}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Cambiar portada
            </button>
            <div className="ctx-divider" />
            <button className="ctx-item danger" onClick={eliminarPlaylist}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Eliminar playlist
            </button>
          </div>
        </>
      )}

      {/* Modal: Renombrar */}
      {renameOpen && (
        <div className="modal-bd" onClick={() => setRenameOpen(false)}>
          <div className="modal-bx" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "white" }}>
                Cambiar nombre
              </h2>
              <button onClick={() => setRenameOpen(false)} style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%", width: "30px", height: "30px", color: "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>�</button>
            </div>
            <input
              className="modal-input"
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmarRenombre(); }}
              autoFocus
              maxLength={40}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setRenameOpen(false)} style={{
                flex: 1, padding: "10px", borderRadius: "10px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
                fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.88rem",
              }}>Cancelar</button>
              <button onClick={confirmarRenombre} disabled={!renameValue.trim()} style={{
                flex: 1, padding: "10px", borderRadius: "10px",
                background: renameValue.trim() ? "linear-gradient(135deg, #1CF094, #5eead4)" : "rgba(255,255,255,0.08)",
                border: "none", cursor: renameValue.trim() ? "pointer" : "not-allowed",
                color: renameValue.trim() ? "#0a0f1a" : "rgba(255,255,255,0.25)",
                fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "0.88rem",
              }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar portada */}
      {coverOpen && playlist && (
        <div className="modal-bd" onClick={cerrarPortada}>
          <div className="modal-bx" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "white" }}>
                Cambiar portada
              </h2>
              <button onClick={cerrarPortada} style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%", width: "30px", height: "30px", color: "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>�</button>
            </div>

            {/* Vista previa */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{
                width: 130, height: 130, borderRadius: "14px", overflow: "hidden",
                background: coverColorIdx !== null ? COLOR_OPTIONS[coverColorIdx].bg : playlist.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                position: "relative",
              }}>
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : !coverRemoveImage && playlist.image_url && coverColorIdx === null ? (
                  <img src={playlist.image_url} alt="actual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Vinyl accent={coverColorIdx !== null ? COLOR_OPTIONS[coverColorIdx].accent : playlist.accent} size={75} />
                )}
              </div>
            </div>

            <label className="cover-section-label">Elige un color</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {COLOR_OPTIONS.map((c, i) => (
                <button
                  key={i}
                  className={`color-dot${coverColorIdx === i ? " selected" : ""}`}
                  style={{ background: c.accent }}
                  onClick={() => {
                    setCoverColorIdx(i);
                    setCoverFile(null);
                    setCoverPreview(null);
                    setCoverRemoveImage(false);
                    setCoverError(null);
                  }}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>

            <div className="cover-divider">o</div>

            <label className="cover-section-label">Sube tu propia imagen</label>
            <label className="upload-zone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={e => elegirArchivoPortada(e.target.files?.[0] ?? null)}
              />
              {coverPreview ? (
                <img src={coverPreview} alt="preview" className="upload-thumb" />
              ) : playlist.image_url && !coverRemoveImage ? (
                <img src={playlist.image_url} alt="actual" className="upload-thumb" />
              ) : (
                <div className="upload-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "white", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                  {coverFile ? coverFile.name : "Seleccionar imagen�"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", marginTop: 2, fontFamily: "Arial, sans-serif" }}>
                  JPG, PNG, WEBP o GIF � m�x 5 MB
                </div>
              </div>
            </label>

            {playlist.image_url && !coverFile && !coverRemoveImage && (
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="remove-img-btn"
                  onClick={() => {
                    setCoverRemoveImage(true);
                    setCoverFile(null);
                    setCoverPreview(null);
                    setCoverColorIdx(null);
                    setCoverError(null);
                  }}
                >
                  Quitar imagen actual
                </button>
              </div>
            )}
            {coverRemoveImage && (
              <div style={{ marginTop: 10, color: "#ff7b7b", fontSize: "0.78rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                Se quitar� la imagen al guardar.
              </div>
            )}

            {coverError && (
              <div style={{ marginTop: 12, color: "#ff7b7b", fontSize: "0.8rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                {coverError}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button onClick={cerrarPortada} style={{
                flex: 1, padding: "10px", borderRadius: "10px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
                fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.88rem",
              }}>Cancelar</button>
              <button
                onClick={guardarPortada}
                disabled={coverSaving || (coverFile === null && coverColorIdx === null && !coverRemoveImage)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  background: (!coverSaving && (coverFile || coverColorIdx !== null || coverRemoveImage))
                    ? "linear-gradient(135deg, #1CF094, #5eead4)" : "rgba(255,255,255,0.08)",
                  border: "none",
                  cursor: (!coverSaving && (coverFile || coverColorIdx !== null || coverRemoveImage)) ? "pointer" : "not-allowed",
                  color: (!coverSaving && (coverFile || coverColorIdx !== null || coverRemoveImage)) ? "#0a0f1a" : "rgba(255,255,255,0.25)",
                  fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "0.88rem",
                }}
              >
                {coverSaving ? "Guardando�" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
