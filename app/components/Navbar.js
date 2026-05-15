"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const navCss = `
  @keyframes shimmer-nav {
    0%   { background-position: 0% center; }
    100% { background-position: 300% center; }
  }
  @keyframes nav-eq1 { 0%,100%{ height:5px  } 20%{ height:24px } 55%{ height:10px } 80%{ height:17px } }
  @keyframes nav-eq2 { 0%,100%{ height:17px } 30%{ height:6px  } 60%{ height:26px } 85%{ height:8px  } }
  @keyframes nav-eq3 { 0%,100%{ height:9px  } 15%{ height:28px } 50%{ height:7px  } 75%{ height:22px } }
  @keyframes nav-eq4 { 0%,100%{ height:20px } 25%{ height:8px  } 55%{ height:30px } 80%{ height:11px } }
  @keyframes nav-eq5 { 0%,100%{ height:7px  } 35%{ height:19px } 65%{ height:26px } 90%{ height:6px  } }
  @keyframes nav-eq6 { 0%,100%{ height:14px } 20%{ height:6px  } 50%{ height:24px } 70%{ height:9px  } }
  @keyframes nav-eq7 { 0%,100%{ height:8px  } 40%{ height:28px } 70%{ height:13px } 90%{ height:20px } }

  @keyframes search-expand {
    from { width: 36px; opacity: 0.6; }
    to   { width: 280px; opacity: 1; }
  }
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  .nav-eq-wrap {
    display: flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 26px;
  }
  .nav-eq-bar {
    width: 3px;
    border-radius: 3px 3px 1px 1px;
    background: linear-gradient(to top, #1CF094, #a3ff47);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .nav-link {
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 8px;
    transition: color 0.2s, background 0.2s;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  .nav-link:hover {
    color: #1CF094;
    background: rgba(28,240,148,0.08);
  }
  .nav-link--active {
    color: #1CF094;
    background: rgba(28,240,148,0.12);
    box-shadow: inset 0 -2px 0 #1CF094;
  }

  .nav-enter-btn {
    background: linear-gradient(90deg, #1CF094 0%, #5eead4 50%, #1CF094 100%);
    background-size: 200% auto;
    animation: shimmer-nav 3s linear infinite;
    color: #0a0f1a;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 9px 22px;
    border-radius: 50px;
    text-decoration: none;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
    box-shadow: 0 2px 16px rgba(28,240,148,.35);
    transition: transform 0.2s, box-shadow 0.2s;
    white-space: nowrap;
    display: inline-block;
  }
  .nav-enter-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 4px 28px rgba(28,240,148,.6);
  }

  .nav-grad-border {
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #1CF094 25%, #5eead4 50%, #a3ff47 75%, transparent 100%);
    background-size: 300% auto;
    animation: shimmer-nav 4s linear infinite;
    opacity: 0.8;
  }

  /* ── Buscador ── */
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 6px 14px 6px 12px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, width 0.35s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    width: 36px;
    min-width: 36px;
  }
  .search-pill.open {
    width: 280px;
    background: rgba(255,255,255,0.08);
    border-color: rgba(28,240,148,0.45);
    box-shadow: 0 0 0 3px rgba(28,240,148,0.08);
  }
  .search-pill:hover:not(.open) {
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.09);
  }
  .search-input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 0.85rem;
    font-family: var(--font-nunito), sans-serif;
    width: 0;
    opacity: 0;
    transition: width 0.3s, opacity 0.3s;
    pointer-events: none;
  }
  .search-pill.open .search-input {
    width: 100%;
    opacity: 1;
    pointer-events: auto;
  }
  .search-input::placeholder {
    color: rgba(255,255,255,0.3);
  }
  .search-clear {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    padding: 0; flex-shrink: 0;
    transition: color 0.15s;
    font-size: 1rem; line-height: 1;
  }
  .search-clear:hover { color: white; }

  /* Dropdown */
  .search-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 360px;
    background: rgba(10,15,26,0.97);
    border: 1px solid rgba(28,240,148,0.18);
    border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
    overflow: hidden;
    z-index: 2000;
    animation: dropdown-in 0.22s cubic-bezier(0.34,1.2,0.64,1) both;
    backdrop-filter: blur(20px);
  }
  .search-section-label {
    font-size: 0.65rem; font-weight: 800; letter-spacing: 1.2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    font-family: var(--font-nunito), sans-serif;
    padding: 12px 16px 6px;
  }
  .search-row {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 16px;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 0;
  }
  .search-row:hover {
    background: rgba(28,240,148,0.07);
  }
  .search-row:hover .search-row-title {
    color: #1CF094;
  }
  .search-row-title {
    color: white; font-size: 0.85rem; font-weight: 700;
    font-family: var(--font-nunito), sans-serif;
    transition: color 0.15s;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .search-row-sub {
    color: rgba(255,255,255,0.38); font-size: 0.72rem;
    font-family: Arial, sans-serif;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .search-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 4px 0;
  }
  .search-empty {
    padding: 32px 16px;
    text-align: center;
    color: rgba(255,255,255,0.3);
    font-family: var(--font-nunito), sans-serif;
    font-size: 0.85rem;
  }
  .search-thumb {
    width: 38px; height: 38px; border-radius: 8px;
    object-fit: cover; flex-shrink: 0;
    background: rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .search-thumb-artist {
    border-radius: 50% !important;
  }
`;

const eqBars = [
  { anim: "nav-eq1", dur: "0.72s", delay: "0s"    },
  { anim: "nav-eq2", dur: "0.54s", delay: "0.08s" },
  { anim: "nav-eq3", dur: "0.88s", delay: "0.16s" },
  { anim: "nav-eq4", dur: "0.62s", delay: "0.04s" },
  { anim: "nav-eq5", dur: "0.50s", delay: "0.22s" },
  { anim: "nav-eq6", dur: "0.78s", delay: "0.12s" },
  { anim: "nav-eq7", dur: "0.66s", delay: "0.30s" },
  { anim: "nav-eq1", dur: "0.60s", delay: "0.18s" },
  { anim: "nav-eq3", dur: "0.74s", delay: "0.06s" },
  { anim: "nav-eq5", dur: "0.84s", delay: "0.24s" },
];

const ACCENTS = ["#1CF094","#6e2fff","#ff6ef7","#00d4ff","#ff9a00","#a3ff47","#ff3c3c"];

function fmtDur(seg) {
  if (!seg) return "";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SearchIcon({ size = 15, color = "rgba(255,255,255,0.55)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

function Thumb({ img, accent, isArtist = false }) {
  return (
    <div className={`search-thumb${isArtist ? " search-thumb-artist" : ""}`}
      style={{ background: img ? undefined : `${accent}22`, border: `1px solid ${accent}33` }}>
      {img
        ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: "1rem", color: accent }}>{isArtist ? "♪" : "♫"}</span>
      }
    </div>
  );
}

const toSlug = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

function SearchBox() {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState("");
  const [dbArtistas, setDbArtistas] = useState([]);
  const [dbCanciones, setDbCanciones] = useState([]);
  const [dbAlbums, setDbAlbums]   = useState([]);
  const wrapRef                   = useRef(null);
  const inputRef                  = useRef(null);
  const router                    = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/artista").then(r => r.json()).catch(() => []),
      fetch("/api/canciones?limit=200").then(r => r.json()).catch(() => []),
      fetch("/api/albums").then(r => r.json()).catch(() => []),
    ]).then(([arts, cans, albs]) => {
      if (Array.isArray(arts)) setDbArtistas(arts);
      if (Array.isArray(cans)) setDbCanciones(cans);
      if (Array.isArray(albs)) setDbAlbums(albs);
    });
  }, []);

  const q = query.trim().toLowerCase();

  const artistas = q
    ? dbArtistas.filter(a => a.nombre?.toLowerCase().includes(q) || a.genero?.toLowerCase().includes(q))
    : [];
  const canciones = q
    ? dbCanciones.filter(c => c.titulo?.toLowerCase().includes(q) || c.artista?.toLowerCase().includes(q))
    : [];
  const albums = q
    ? dbAlbums.filter(a => a.titulo?.toLowerCase().includes(q) || a.artista?.toLowerCase().includes(q))
    : [];

  const total = artistas.length + canciones.length + albums.length;
  const hasResults = total > 0;
  const showDropdown = open && q.length > 0;

  const goToArtist = (nombre) => {
    setOpen(false);
    setQuery("");
    router.push(`/artistas/${toSlug(nombre)}`);
  };

  const openSearch = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearSearch = (e) => {
    e.stopPropagation();
    setQuery("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div
        className={`search-pill${open ? " open" : ""}`}
        onClick={!open ? openSearch : undefined}
      >
        <SearchIcon color={open ? "#1CF094" : "rgba(255,255,255,0.55)"} size={15} />
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Artistas, canciones, álbumes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          tabIndex={open ? 0 : -1}
        />
        {open && query && (
          <button className="search-clear" onClick={clearSearch}>×</button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {!hasResults ? (
            <div className="search-empty">
              Sin resultados para <strong style={{ color: "rgba(255,255,255,0.6)" }}>"{query}"</strong>
            </div>
          ) : (
            <>
              {/* Artistas */}
              {artistas.length > 0 && (
                <>
                  <div className="search-section-label">Artistas</div>
                  {artistas.slice(0, 3).map((a, i) => (
                    <div key={i} className="search-row" onClick={() => goToArtist(a.nombre)}>
                      <Thumb img={a.imagen || null} accent={ACCENTS[i % ACCENTS.length]} isArtist />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-row-title">{a.nombre}</div>
                        <div className="search-row-sub">{a.genero}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Canciones */}
              {canciones.length > 0 && (
                <>
                  {artistas.length > 0 && <div className="search-divider" />}
                  <div className="search-section-label">Canciones</div>
                  {canciones.slice(0, 4).map((c, i) => (
                    <div key={i} className="search-row" onClick={() => { if (c.artista) goToArtist(c.artista); }}>
                      <Thumb img={c.caratula || null} accent={ACCENTS[i % ACCENTS.length]} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-row-title">{c.titulo}</div>
                        <div className="search-row-sub">{c.artista}</div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", flexShrink: 0 }}>
                        {fmtDur(c.duracion)}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Álbumes */}
              {albums.length > 0 && (
                <>
                  {(artistas.length > 0 || canciones.length > 0) && <div className="search-divider" />}
                  <div className="search-section-label">Álbumes</div>
                  {albums.slice(0, 3).map((a, i) => (
                    <div key={i} className="search-row" onClick={() => goToArtist(a.artista)}>
                      <Thumb img={a.caratula || null} accent={ACCENTS[i % ACCENTS.length]} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-row-title">{a.titulo}</div>
                        <div className="search-row-sub">{a.artista} · {a.año ? new Date(a.año).getFullYear() : ""}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Footer */}
              <div style={{
                padding: "10px 16px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <SearchIcon size={12} color="rgba(28,240,148,0.6)" />
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                  {total} resultado{total !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <style>{navCss}</style>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(6, 10, 20, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>

          {/* Izquierda: EQ + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div className="nav-eq-wrap">
              {eqBars.map((b, i) => (
                <div
                  key={i}
                  className="nav-eq-bar"
                  style={{ animation: `${b.anim} ${b.dur} ${b.delay} ease-in-out infinite` }}
                />
              ))}
            </div>
            <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <img
                src="/images/ChatGPT Image 11 may 2026, 11_04_21 a.m..png"
                alt="SpotiFake"
                style={{ height: "82px", objectFit: "contain", display: "block", marginTop: "10px" }}
              />
            </Link>
          </div>

          {/* Centro: links + buscador */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link href={loggedIn ? "/inicio" : "/"} className={`nav-link${pathname === "/inicio" || pathname === "/" ? " nav-link--active" : ""}`}>Inicio</Link>
            {!loggedIn && (
              <Link href="/#faq" className="nav-link">FAQ</Link>
            )}
            {loggedIn && (
              <Link href="/playlists" className={`nav-link${pathname === "/playlists" ? " nav-link--active" : ""}`}>Playlists</Link>
            )}

            {/* Separador */}
            <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 6px", flexShrink: 0 }} />

            {/* Buscador */}
            <SearchBox />
          </div>

          {/* Derecha: tuerca + botón sesión */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {loggedIn && (
              <Link href="/configuracion" title="Configuración" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "50%",
                background: pathname === "/configuracion" ? "rgba(28,240,148,0.15)" : "rgba(255,255,255,0.06)",
                border: pathname === "/configuracion" ? "1px solid rgba(28,240,148,0.4)" : "1px solid rgba(255,255,255,0.1)",
                transition: "background 0.2s, border-color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(28,240,148,0.12)"; e.currentTarget.style.borderColor = "rgba(28,240,148,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = pathname === "/configuracion" ? "rgba(28,240,148,0.15)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = pathname === "/configuracion" ? "rgba(28,240,148,0.4)" : "rgba(255,255,255,0.1)"; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke={pathname === "/configuracion" ? "#1CF094" : "rgba(255,255,255,0.6)"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>
            )}
            {loggedIn ? (
              <button onClick={handleLogout} className="nav-enter-btn" style={{ border: "none", cursor: "pointer" }}>
                Cerrar sesión
              </button>
            ) : (
              <Link href="/usuario" className="nav-enter-btn">
                Entrar
              </Link>
            )}
          </div>

        </div>

        {/* Borde inferior animado */}
        <div className="nav-grad-border" />
      </nav>
    </>
  );
}
