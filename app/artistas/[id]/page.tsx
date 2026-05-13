"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/app/context/PlayerContext";

const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

function fmtDuracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Artista  = { nombre: string; genero: string; descripcion?: string; id?: string; imagen?: string };
type Cancion  = { id: string; titulo: string; duracion: number; num_reproducciones: number; caratula?: string; audio_url?: string | null };
type Album    = { id: string; titulo: string; año: string; canciones: number; caratula?: string };
type Playlist = { id: string; nombre: string; accent: string };

const artistaCss = `
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.93) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes heartbeat {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.55); }
    50%  { transform: scale(1); }
    75%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes feedback-in {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .song-action-btn {
    background: none; border: none; cursor: pointer;
    padding: 5px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.15s;
    color: rgba(255,255,255,0.35);
    flex-shrink: 0;
  }
  .song-action-btn:hover { background: rgba(255,255,255,0.08); transform: scale(1.15); }
  .song-action-btn.liked { color: #ff5078; animation: heartbeat 0.45s ease; }
  .song-action-btn.add:hover { color: #1CF094; }
  .pl-modal-backdrop {
    position: fixed; inset: 0; z-index: 600;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
  }
  .pl-modal-box {
    background: linear-gradient(145deg, #0d1a12, #0a0f1a);
    border: 1px solid rgba(28,240,148,0.2);
    border-radius: 18px; padding: 24px 20px;
    width: 100%; max-width: 340px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8);
    animation: modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .pl-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    border: none; background: none; width: 100%; text-align: left;
    color: rgba(255,255,255,0.8); font-family: var(--font-nunito), sans-serif;
    font-size: 0.86rem; font-weight: 700;
    transition: background 0.15s, color 0.15s;
  }
  .pl-item:hover { background: rgba(255,255,255,0.07); color: white; }
  .pl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .feedback-toast {
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
    background: rgba(10,18,30,0.92);
    border: 1px solid rgba(28,240,148,0.3);
    color: white; padding: 10px 20px; border-radius: 50px;
    font-family: var(--font-nunito), sans-serif; font-size: 0.85rem; font-weight: 700;
    backdrop-filter: blur(12px); z-index: 900; white-space: nowrap;
    animation: feedback-in 0.25s ease both;
  }
  .new-pl-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 9px; padding: 10px 14px;
    color: white; font-size: 0.86rem; font-family: var(--font-nunito), sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .new-pl-input:focus { border-color: rgba(28,240,148,0.5); }
`;

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const { playTrack, track: currentTrack, playing } = usePlayer();
  const [artista,   setArtista]   = useState<Artista | null>(null);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albums,    setAlbums]    = useState<Album[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [likedSet,    setLikedSet]    = useState<Set<string>>(new Set());
  const [playlists,   setPlaylists]   = useState<Playlist[]>([]);
  const [addTarget,   setAddTarget]   = useState<Cancion | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName,     setNewName]     = useState("");
  const [creating,    setCreating]    = useState(false);
  const [feedback,    setFeedback]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artista")
      .then(r => r.json())
      .then((data: Artista[]) => {
        if (!Array.isArray(data)) { router.replace("/inicio"); return; }
        const found = data.find(a => toSlug(a.nombre) === id) ?? null;
        if (!found) { router.replace("/inicio"); return; }
        setArtista(found);

        const artistaId = found.id;
        if (!artistaId) return;

        Promise.all([
          fetch(`/api/canciones?artista_id=${artistaId}`).then(r => r.json()),
          fetch(`/api/albums?artista_id=${artistaId}`).then(r => r.json()),
        ]).then(([c, a]) => {
          if (Array.isArray(c)) setCanciones(c);
          if (Array.isArray(a)) {
            console.log("Albums del artista:", a.map((x: any) => ({ titulo: x.titulo, caratula: x.caratula })));
            setAlbums(a);
          }
        });
      })
      .catch(() => router.replace("/inicio"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch('/api/likes').then(r => r.ok ? r.json() : []).then((data: Cancion[]) => {
      if (Array.isArray(data)) setLikedSet(new Set(data.map(s => `${s.titulo}|${artista?.nombre ?? ""}`)));
    });
  }, [artista]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const toggleLike = async (c: Cancion, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${c.titulo}|${artista?.nombre ?? ""}`;
    const liked = likedSet.has(key);
    if (liked) {
      await fetch('/api/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: c.titulo, artista: artista?.nombre }),
      });
      setLikedSet(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: c.titulo, artista: artista?.nombre, duracion: c.duracion }),
      });
      setLikedSet(prev => new Set(prev).add(key));
    }
  };

  const openAddModal = async (c: Cancion, e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatingNew(false);
    setNewName("");
    const res = await fetch('/api/playlists');
    if (res.ok) setPlaylists(await res.json());
    setAddTarget(c);
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!addTarget) return;
    const res = await fetch(`/api/playlists/${playlistId}/canciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: addTarget.titulo, artista: artista?.nombre, duracion: addTarget.duracion }),
    });
    setAddTarget(null);
    const pl = playlists.find(p => p.id === playlistId);
    if (res.status === 409) showFeedback('Ya está en esa playlist');
    else if (res.ok) showFeedback(`Añadida a ${pl?.nombre ?? 'playlist'}`);
    else showFeedback('Error al añadir');
  };

  const createAndAdd = async () => {
    if (!addTarget || !newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newName.trim(), accent: '#1CF094', bg: 'linear-gradient(135deg,#1CF09422,transparent)' }),
    });
    if (res.ok) {
      const pl = await res.json();
      await addToPlaylist(pl.id);
    } else {
      showFeedback('Error al crear playlist');
    }
    setCreating(false);
  };

  if (loading) return (
    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "80px", fontFamily: "var(--font-nunito)" }}>
      Cargando…
    </div>
  );

  if (!artista) return null;

  return (
    <div style={{ maxWidth: "700px", margin: "60px auto", padding: "0 20px" }}>
      <style>{artistaCss}</style>

      {/* Cabecera */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "28px",
      }}>
        {artista.imagen && (
          <img
            src={artista.imagen}
            alt={artista.nombre}
            style={{
              width: "110px", height: "110px",
              borderRadius: "50%", objectFit: "cover",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.12)",
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "var(--font-nunito)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {artista.genero}
          </p>
          <h1 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "2rem", margin: "0 0 12px" }}>
            {artista.nombre}
          </h1>
          {artista.descripcion && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-nunito)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0, textAlign: "justify" }}>
              {artista.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Álbumes */}
      {albums.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "1.1rem", margin: "0 0 16px", opacity: 0.7 }}>
            Álbumes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {albums.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "10px 12px", borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {a.caratula ? (
                  <img src={a.caratula} alt={a.titulo} style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>♫</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontFamily: "var(--font-nunito)", fontWeight: 700, fontSize: "0.9rem" }}>
                    {a.titulo}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-nunito)", fontSize: "0.75rem", marginTop: "2px" }}>
                    {a.año ? new Date(a.año).getFullYear() : ""}
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito)", fontSize: "0.78rem" }}>
                  {a.canciones} {a.canciones === 1 ? "canción" : "canciones"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canciones */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "24px 28px",
        marginBottom: "20px",
      }}>
        <h2 style={{ color: "white", fontFamily: "var(--font-nunito)", fontSize: "1.1rem", margin: "0 0 16px", opacity: 0.7 }}>
          Canciones
        </h2>
        {canciones.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito)", margin: 0 }}>
            Sin canciones disponibles
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {canciones.map((c, i) => {
              const isActive = currentTrack?.title === c.titulo && currentTrack?.artist === artista?.nombre;
              const queue = canciones.map(s => ({
                title: s.titulo, artist: artista?.nombre ?? "", duration: s.duracion, icon: s.caratula, audioUrl: s.audio_url ?? undefined,
              }));
              const track = queue[i];
              return (
                <div
                  key={c.id}
                  onClick={() => playTrack(track, queue)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 8px", borderRadius: "10px",
                    cursor: "pointer", transition: "background 0.15s",
                    background: isActive ? "rgba(28,240,148,0.08)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? "rgba(28,240,148,0.08)" : "transparent"; }}
                >
                  <span style={{ color: isActive ? "#1CF094" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-nunito)", width: "20px", textAlign: "right", flexShrink: 0, fontWeight: isActive ? 700 : 400 }}>
                    {isActive && playing ? "▶" : i + 1}
                  </span>
                  {c.caratula ? (
                    <img src={c.caratula} alt={c.titulo} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "rgba(255,255,255,0.2)" }}>♪</div>
                  )}
                  <span style={{ color: isActive ? "#1CF094" : "white", fontFamily: "var(--font-nunito)", flex: 1, fontWeight: isActive ? 700 : 400 }}>
                    {c.titulo}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-nunito)", fontSize: "0.8rem" }}>
                    {(c.num_reproducciones / 1000).toFixed(0)}k
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito)", fontSize: "0.85rem", width: "36px", textAlign: "right" }}>
                    {fmtDuracion(c.duracion)}
                  </span>

                  {/* ♥ Me gusta */}
                  <button
                    className={`song-action-btn${likedSet.has(`${c.titulo}|${artista?.nombre ?? ""}`) ? " liked" : ""}`}
                    onClick={e => toggleLike(c, e)}
                    title={likedSet.has(`${c.titulo}|${artista?.nombre ?? ""}`) ? "Quitar de Me gusta" : "Añadir a Me gusta"}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24"
                      fill={likedSet.has(`${c.titulo}|${artista?.nombre ?? ""}`) ? "#ff5078" : "none"}
                      stroke={likedSet.has(`${c.titulo}|${artista?.nombre ?? ""}`) ? "#ff5078" : "currentColor"}
                      strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  {/* + Añadir a playlist */}
                  <button
                    className="song-action-btn add"
                    onClick={e => openAddModal(c, e)}
                    title="Añadir a playlist"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          color: "rgba(255,255,255,0.6)",
          padding: "10px 20px",
          cursor: "pointer",
          fontFamily: "var(--font-nunito)",
        }}
      >
        Volver
      </button>

      {/* Modal: añadir a playlist */}
      {addTarget && (
        <div className="pl-modal-backdrop" onClick={() => setAddTarget(null)}>
          <div className="pl-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ color: "white", fontFamily: "var(--font-nunito)", fontWeight: 900, fontSize: "1rem" }}>
                  Añadir a playlist
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito)", fontSize: "0.75rem", marginTop: "2px" }}>
                  {addTarget.titulo}
                </div>
              </div>
              <button onClick={() => setAddTarget(null)} style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%", width: "28px", height: "28px", color: "rgba(255,255,255,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>×</button>
            </div>

            <div style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "12px" }}>
              {playlists.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito)", fontSize: "0.82rem", textAlign: "center", padding: "16px 0" }}>
                  No tienes playlists todavía
                </p>
              ) : playlists.map(pl => (
                <button key={pl.id} className="pl-item" onClick={() => addToPlaylist(pl.id)}>
                  <span className="pl-dot" style={{ background: pl.accent }} />
                  {pl.nombre}
                </button>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
              {!creatingNew ? (
                <button className="pl-item" onClick={() => setCreatingNew(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1CF094" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span style={{ color: "#1CF094" }}>Nueva playlist</span>
                </button>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="new-pl-input"
                    placeholder="Nombre de la playlist…"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") createAndAdd(); }}
                    autoFocus
                    maxLength={40}
                  />
                  <button
                    onClick={createAndAdd}
                    disabled={!newName.trim() || creating}
                    style={{
                      background: newName.trim() ? "linear-gradient(135deg,#1CF094,#5eead4)" : "rgba(255,255,255,0.08)",
                      border: "none", borderRadius: "9px", padding: "0 14px",
                      color: newName.trim() ? "#0a0f1a" : "rgba(255,255,255,0.25)",
                      cursor: newName.trim() ? "pointer" : "not-allowed",
                      fontFamily: "var(--font-nunito)", fontWeight: 800, fontSize: "0.82rem", flexShrink: 0,
                    }}
                  >
                    {creating ? "…" : "Crear"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {feedback && <div className="feedback-toast">{feedback}</div>}
    </div>
  );
}
