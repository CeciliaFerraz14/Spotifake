"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/app/context/PlayerContext";
import type { Track } from "@/app/context/PlayerContext";

const toSlug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

function fmtDuracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ACCENTS = ["#1CF094","#6e2fff","#ff6ef7","#00d4ff","#ff9a00","#a3ff47","#ff3c3c"];

type Artista  = { nombre: string; genero: string; descripcion?: string; id?: string; imagen?: string };
type Cancion  = { id: string; titulo: string; duracion: number; num_reproducciones: number; caratula?: string };
type Album    = { id: string; titulo: string; año: string; canciones: number; caratula?: string };
type Playlist = { id: string; nombre: string; accent: string; bg: string };

export default function ArtistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();
  const { playTrack } = usePlayer();

  const [artista,   setArtista]   = useState<Artista | null>(null);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [albums,    setAlbums]    = useState<Album[]>([]);
  const [loading,   setLoading]   = useState(true);

  const [addModal,    setAddModal]    = useState<Cancion | null>(null);
  const [playlists,   setPlaylists]   = useState<Playlist[]>([]);
  const [feedback,    setFeedback]    = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName,     setNewName]     = useState("");
  const [creating,    setCreating]    = useState(false);

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
          if (Array.isArray(a)) setAlbums(a);
        });
      })
      .catch(() => router.replace("/inicio"))
      .finally(() => setLoading(false));
  }, [id]);

  const asTracks = (): Track[] => canciones.map((c, i) => ({
    title: c.titulo, artist: artista?.nombre ?? "", accent: ACCENTS[i % ACCENTS.length], duration: c.duracion,
  }));

  const openAddModal = (c: Cancion) => {
    setCreatingNew(false);
    setNewName("");
    fetch("/api/playlists").then(r => r.ok ? r.json() : []).then((data: any[]) => {
      if (Array.isArray(data)) setPlaylists(data);
    });
    setAddModal(c);
  };

  const addToPlaylist = async (playlistId: string, cancion: Cancion) => {
    const res = await fetch(`/api/playlists/${playlistId}/canciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: cancion.titulo, artista: artista?.nombre ?? "", accent: ACCENTS[0], duracion: cancion.duracion }),
    });
    setAddModal(null);
    const pl = playlists.find(p => p.id === playlistId);
    if (res.status === 409) setFeedback("Ya está en esa playlist");
    else if (res.ok) setFeedback(`Añadida a ${pl?.nombre ?? "playlist"}`);
    else setFeedback("Error al añadir");
    setTimeout(() => setFeedback(null), 2500);
  };

  const createAndAdd = async (cancion: Cancion) => {
    if (!newName.trim()) return;
    setCreating(true);
    const accent = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: newName.trim(), accent, bg: `linear-gradient(135deg,${accent}22,transparent)` }),
    });
    if (res.ok) {
      const pl = await res.json();
      await addToPlaylist(pl.id, cancion);
    } else {
      setFeedback("Error al crear playlist");
      setTimeout(() => setFeedback(null), 2500);
      setAddModal(null);
    }
    setCreating(false);
  };

  if (loading) return (
    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "80px", fontFamily: "var(--font-nunito)" }}>
      Cargando…
    </div>
  );

  if (!artista) return null;

  const tracks = asTracks();

  return (
    <div style={{ maxWidth: "700px", margin: "60px auto", padding: "0 20px" }}>

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
            {canciones.map((c, i) => (
              <div
                key={c.id}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", borderRadius: "10px", transition: "background 0.15s", cursor: "pointer" }}
                onClick={() => playTrack(tracks[i], tracks)}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-nunito)", width: "20px", textAlign: "right", flexShrink: 0 }}>
                  {i + 1}
                </span>
                {c.caratula ? (
                  <img src={c.caratula} alt={c.titulo} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "rgba(255,255,255,0.2)" }}>♪</div>
                )}
                <span style={{ color: "white", fontFamily: "var(--font-nunito)", flex: 1 }}>
                  {c.titulo}
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-nunito)", fontSize: "0.8rem" }}>
                  {(c.num_reproducciones / 1000).toFixed(0)}k
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito)", fontSize: "0.85rem", width: "36px", textAlign: "right" }}>
                  {fmtDuracion(c.duracion)}
                </span>
                {/* Botón + */}
                <button
                  onClick={e => { e.stopPropagation(); openAddModal(c); }}
                  title="Añadir a playlist"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", fontSize: "1.2rem", lineHeight: 1,
                    padding: "2px 4px", flexShrink: 0, fontWeight: 700,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1CF094")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  +
                </button>
              </div>
            ))}
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

      {/* Modal añadir a playlist */}
      {addModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,4,12,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setAddModal(null)}
        >
          <div
            style={{ background: "linear-gradient(145deg,#0d1a12,#0a0f1a)", border: "1px solid rgba(28,240,148,0.2)", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "340px", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 900, fontSize: "1rem" }}>
              Añadir a playlist
            </h3>
            <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {addModal.titulo} · {artista.nombre}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", marginBottom: "12px" }}>
              {playlists.length === 0 && !creatingNew && (
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif", textAlign: "center", padding: "8px 0" }}>
                  No tienes playlists aún
                </p>
              )}
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id, addModal)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.borderColor = `${pl.accent}55`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: pl.accent, fontSize: "0.85rem" }}>♫</span>
                  </div>
                  <span style={{ color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem" }}>{pl.nombre}</span>
                </button>
              ))}
            </div>

            {creatingNew ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createAndAdd(addModal); if (e.key === "Escape") setCreatingNew(false); }}
                  placeholder="Nombre de la playlist…"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(28,240,148,0.3)", borderRadius: "10px", padding: "10px 14px", color: "white", fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", outline: "none", width: "100%" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => createAndAdd(addModal)}
                    disabled={!newName.trim() || creating}
                    style={{ flex: 1, background: "linear-gradient(135deg,#1CF094,#5eead4)", border: "none", borderRadius: "10px", padding: "10px", color: "#0a0f1a", fontWeight: 800, fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", cursor: newName.trim() && !creating ? "pointer" : "default", opacity: newName.trim() && !creating ? 1 : 0.5 }}
                  >
                    {creating ? "Creando…" : "Crear y añadir"}
                  </button>
                  <button
                    onClick={() => setCreatingNew(false)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreatingNew(true)}
                style={{ width: "100%", background: "rgba(28,240,148,0.08)", border: "1px dashed rgba(28,240,148,0.35)", borderRadius: "10px", padding: "10px 14px", color: "#1CF094", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(28,240,148,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(28,240,148,0.08)")}
              >
                + Nueva playlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {feedback && (
        <div style={{ position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)", background: "rgba(28,240,148,0.15)", border: "1px solid rgba(28,240,148,0.35)", borderRadius: "50px", padding: "10px 22px", color: "white", fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "0.85rem", zIndex: 600, backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
