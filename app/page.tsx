"use client";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlayer } from "@/app/context/PlayerContext";

const innerImages = [
  "/images/Portada_1.jpg",
  "/images/Portada_2.jpg",
  "/images/Portada_3.jpg",
  "/images/Portada4.jpg",
  "/images/Portada5.jpg",
  "/images/Portada6.jpg",
];

const outerImages = [
  "/images/portada.jpg",
  "/images/totakeke.jpg",
  "/images/chil.jpg",
  "/images/portada.1.jpg",
  "/images/otraPortada.webp",
  "/images/animal-crossing-winter-pfj1ezjg2zhif7ju.jpg",
  "/images/ankha-animal-crossing-6yflin5hrafqsehx.jpg",
];

const INNER_R = 195;
const OUTER_R = 340;
const INNER_DUR = 24;
const OUTER_DUR = 40;
const REPULSION_R = 140;   // radio de influencia en px
const REPULSION_FORCE = 72; // distancia máxima de empuje en px

const allImages = [
  ...innerImages.map((src, i) => ({ src, orbit: "inner" as const, i })),
  ...outerImages.map((src, i) => ({ src, orbit: "outer" as const, i })),
];

const css = `
  @keyframes orbit-inner {
    from { transform: rotate(0deg)   translateX(${INNER_R}px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(${INNER_R}px) rotate(-360deg); }
  }
  @keyframes orbit-outer {
    from { transform: rotate(0deg)   translateX(${OUTER_R}px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(${OUTER_R}px) rotate(-360deg); }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 40px 8px rgba(28,240,148,.35), 0 0 90px 20px rgba(28,240,148,.12); }
    50%       { box-shadow: 0 0 65px 14px rgba(28,240,148,.6), 0 0 130px 30px rgba(28,240,148,.2); }
  }
  @keyframes float-y {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  /* La capa exterior solo hace la órbita — sin overflow ni border-radius */
  .orbit-slot {
    position: absolute;
    top: 50%; left: 50%;
  }
  .orbit-slot--inner {
    width: 82px; height: 82px;
    margin-top: -41px; margin-left: -41px;
    animation: orbit-inner ${INNER_DUR}s linear infinite;
  }
  .orbit-slot--outer {
    width: 96px; height: 96px;
    margin-top: -48px; margin-left: -48px;
    animation: orbit-outer ${OUTER_DUR}s linear infinite;
  }

  /* La capa interior recibe el transform de repulsión y tiene el estilo visual */
  .cover-inner {
    width: 100%; height: 100%;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0,0,0,.55);
    /* sin transition: el RAF se encarga de la suavidad */
    will-change: transform;
    cursor: pointer;
  }
  .cover-inner img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    pointer-events: none;
  }

  .center-logo  { border-radius: 50%; animation: glow-pulse 3.5s ease-in-out infinite; }
  .center-text  { animation: float-y 4.5s ease-in-out infinite; text-align: center; }

  .enter-btn {
    background: linear-gradient(90deg, #1CF094 0%, #5eead4 50%, #1CF094 100%);
    background-size: 200% auto;
    animation: shimmer-btn 3s linear infinite;
    color: #0a0f1a; font-weight: 800; font-size: 1rem;
    padding: 13px 40px; border-radius: 50px;
    text-decoration: none; display: inline-block;
    box-shadow: 0 4px 22px rgba(28,240,148,.45);
    transition: transform .2s, box-shadow .2s;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
  }
  .enter-btn:hover {
    transform: scale(1.07);
    box-shadow: 0 8px 36px rgba(28,240,148,.65);
  }

  .ring {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%; pointer-events: none;
    transform: translate(-50%, -50%);
  }

  @keyframes spin-vinyl {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes orbit-label {
    from { transform: rotate(0deg)   translateX(60px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
  }
  @keyframes slide-up-bounce {
    0%   { opacity: 0; transform: translateX(-50%) translateY(40px); }
    65%  { opacity: 1; transform: translateX(-50%) translateY(-8px); }
    82%  { transform: translateX(-50%) translateY(5px); }
    100% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

/*
  Ciclo ~10s:
  0 → idle        telón verde cubre pantalla, vinilo oculto bajo centro
  1 → rising-g    vinilo sube desde abajo-centro (fondo verde)
  2 → spin-g      gira en sitio
  3 → slide       vinilo + telón se van a la izquierda (lila se revela)
  4 → snap-right  snap INSTANTÁNEO: vinilo aparece oculto bajo la derecha
  5 → rising-l    vinilo sube desde abajo-derecha hacia centro (fondo lila)
  6 → spin-l      gira en sitio sobre lila
  7 → return      telón verde regresa desde la izquierda cubriendo el lila
  → nuevo ciclo
*/
function VinylSection() {
  const [step, setStep] = useState(0);
  const sectionRef  = useRef<HTMLDivElement>(null);
  const startedRef  = useRef(false);
  const timersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cycleRef    = useRef<() => void>(() => {});

  useEffect(() => {
    const clearAll = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
    const t = (fn: () => void, ms: number) => timersRef.current.push(setTimeout(fn, ms));

    cycleRef.current = () => {
      clearAll();
      t(() => setStep(1), 0);       // sube en verde
      t(() => setStep(2), 1600);    // gira en verde
      t(() => setStep(3), 3300);    // slide izq + telón
      t(() => setStep(4), 5150);    // snap a derecha-abajo (sin transición)
      t(() => setStep(5), 5210);    // sube desde la derecha sobre lila
      t(() => setStep(6), 6800);    // gira en lila
      t(() => setStep(7), 8500);    // telón regresa
      t(() => { setStep(0); setTimeout(() => cycleRef.current(), 50); }, 9900);
    };

    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current) {
        startedRef.current = true;
        setTimeout(() => cycleRef.current(), 400);
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); clearAll(); };
  }, []);

  const [countOyentes, setCountOyentes]   = useState(0);
  const [countArtistas, setCountArtistas] = useState(0);
  const [greenKey, setGreenKey]           = useState(0);
  const [lilacKey, setLilacKey]           = useState(0);

  useEffect(() => {
    if (step === 1) {
      setGreenKey(k => k + 1);
      setCountOyentes(0);
      let n = 0;
      const id = setInterval(() => {
        n = Math.min(n + 5, 500);
        setCountOyentes(n);
        if (n >= 500) clearInterval(id);
      }, 30);
      return () => clearInterval(id);
    }
    if (step === 5) {
      setLilacKey(k => k + 1);
      setCountArtistas(0);
      let n = 0;
      const id = setInterval(() => {
        n = Math.min(n + 1, 100);
        setCountArtistas(n);
        if (n >= 100) clearInterval(id);
      }, 25);
      return () => clearInterval(id);
    }
  }, [step]);

  /* ── Telón verde ── */
  const curtainX =
    step <= 2               ? "translateX(0)"
    : step === 7            ? "translateX(0)"       // vuelve desde izq
    :                         "translateX(-110vw)"; // fuera por izquierda

  const curtainTr =
    step === 3 ? "transform 1.8s cubic-bezier(0.25,0.46,0.45,0.94)"
    : step === 7 ? "transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)"
    : "none";

  /* ── Vinilo ── */
  // step 4: snap instantáneo a derecha-abajo (como si "hubiese dado la vuelta")
  const vinylX =
    step === 0 || step === 7     ? "translate(-50%,  100%)"
    : step === 1 || step === 2   ? "translate(-50%,  50%)"
    : step === 3                 ? "translate(calc(-50% - 110vw), 50%)"
    : step === 4                 ? "translate(calc(-50% + 110vw), 100%)" // derecha, oculto
    : /* step 5-6 */               "translate(-50%,  50%)";

  const vinylTr =
    step === 1 ? "transform 1.5s cubic-bezier(0.34,1.56,0.64,1)"
    : step === 3 ? "transform 1.8s cubic-bezier(0.25,0.46,0.45,0.94)"
    : step === 5 ? "transform 1.5s cubic-bezier(0.34,1.56,0.64,1)" // sube desde derecha
    : "none";

  const isSpinning  = step >= 1 && step <= 6;
  const onLilac     = step >= 5 && step <= 6;

  const headingBase: React.CSSProperties = {
    position: "absolute", top: "22%", left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
    fontSize: "clamp(3rem, 7vw, 6rem)",
    fontWeight: 900,
    whiteSpace: "nowrap",
    letterSpacing: "-2px",
    pointerEvents: "none",
    margin: 0,
  };

  const vinylDisc: React.CSSProperties = {
    width: "650px", height: "650px",
    borderRadius: "50%",
    animation: isSpinning ? "spin-vinyl 3.5s linear infinite" : "none",
    background: `
      radial-gradient(circle at 40% 36%, rgba(255,255,255,0.07) 0%, transparent 42%),
      radial-gradient(circle,
        #141414 0%,   #141414 24%,
        #242424 25%,  #141414 26%,
        #242424 29%,  #141414 30%,
        #242424 33%,  #141414 34%,
        #242424 37%,  #141414 38%,
        #242424 41%,  #141414 42%,
        #242424 45%,  #141414 46%,
        #242424 49%,  #141414 50%,
        #242424 53%,  #141414 55%,
        #242424 58%,  #141414 60%,
        #242424 63%,  #141414 65%,
        #242424 69%,  #141414 71%,
        #242424 76%,  #141414 78%,
        #242424 84%,  #141414 86%,
        #242424 93%,  #141414 95%,
        #1e1e1e 100%
      )
    `,
    boxShadow: "0 30px 90px rgba(0,0,0,0.75), 0 0 0 3px #2a2a2a",
    position: "relative",
    flexShrink: 0,
  };

  return (
    <div
      id="for-listeners"
      ref={sectionRef}
      style={{ minHeight: "100vh", background: "#d4b8f0", position: "relative", overflow: "hidden" }}
    >
      {/* "for artists" — debajo del telón, se revela cuando el telón se va */}
      <h2
        key={lilacKey}
        style={{ ...headingBase, color: "#3d1a6b", zIndex: 2,
          opacity: 0,
          animation: onLilac ? "slide-up-bounce 0.9s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        }}
      >
        Más de {countArtistas} artistas
      </h2>

      {/* Texto de fondo "ARTISTAS" en el área lila */}
      <div style={{
        position: "absolute",
        bottom: "-4.2vw",
        left: "50%",
        transform: "translateX(-50%) scaleX(0.70)",
        transformOrigin: "center bottom",
        fontSize: "28vw",
        fontWeight: 900,
        color: "#3d1a6b",
        opacity: 0.12,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
        letterSpacing: "2px",
        pointerEvents: "none",
        userSelect: "none",
        lineHeight: 1,
        zIndex: 1,
      }}>
        ARTISTAS
      </div>

      {/* ── Telón verde ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#1CF094",
        transform: curtainX,
        transition: curtainTr,
        zIndex: 3,
      }}>
        {/* "for listeners" viaja dentro del telón */}
        <h2
          key={greenKey}
          style={{ ...headingBase, color: "#0d3d25", zIndex: 1,
            opacity: 0,
            animation: greenKey > 0 ? "slide-up-bounce 0.9s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
          }}
        >
          Más de {countOyentes} oyentes diarios
        </h2>

        {/* Texto de fondo "OYENTES" — detrás del vinilo */}
        <div style={{
          position: "absolute",
          bottom: "-4.5vw",
          left: "50%",
          transform: "translateX(-50%) scaleX(0.75)",
          transformOrigin: "center bottom",
          fontSize: "28vw",
          fontWeight: 900,
          color: "#0d3d25",
          opacity: 0.12,
          whiteSpace: "nowrap",
          fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
          letterSpacing: "2px",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}>
          OYENTES
        </div>
      </div>

      {/* ── Vinilo (siempre encima del telón) ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: vinylX, transition: vinylTr,
        zIndex: 5,
      }}>
        <div style={vinylDisc}>
          {/* Etiqueta central */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px", height: "200px", borderRadius: "50%",
            background: onLilac ? "#9f7aea" : "#1CF094",
            transition: "background 0.8s ease",
            boxShadow: "0 2px 18px rgba(0,0,0,0.55)",
            zIndex: 2,
          }}>
            {/* Punto central fijo */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#0a0a0a", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.9)",
              zIndex: 3,
            }} />
            {/* Hojita orbitando alrededor del punto */}
            <img
              src="/images/hojita.png"
              alt=""
              style={{
                position: "absolute",
                top: "calc(50% - 28px)",
                left: "calc(50% + 32px)",
                width: "56px", height: "56px",
                objectFit: "contain",
                transformOrigin: "-32px 28px",
                animation: "spin-vinyl 2.5s linear infinite",
                mixBlendMode: "multiply",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const NEON = "#a3ff47";
const ACCENTS = ["#6e2fff","#ff3c3c","#00d4ff","#ff6ef7","#a3ff47","#ff9a00","#c060ff","#ff0080","#00ffcc","#ffcc00"];

const carouselCss = `
@keyframes card-enter {
  from { opacity: 0; transform: translateY(70px) scale(0.85); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes card-tri-enter {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes listen-btn-in {
  from { opacity: 0; transform: translateY(10px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes active-glow-pulse {
  0%,100% { box-shadow: 0 0 0 2px ${NEON}, 0 0 28px rgba(163,255,71,.45), 0 24px 60px rgba(0,0,0,.85); }
  50%     { box-shadow: 0 0 0 2px #d4ff70, 0 0 52px rgba(163,255,71,.75), 0 24px 60px rgba(0,0,0,.85); }
}
@keyframes halo-breathe {
  0%,100% { opacity:.55; transform: translateX(-50%) scaleX(1);   }
  50%     { opacity:.85; transform: translateX(-50%) scaleX(1.12); }
}
@keyframes hover-label {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes track-from-right {
  from { transform: translateX(55px); }
  to   { transform: translateX(0); }
}
@keyframes track-from-left {
  from { transform: translateX(-55px); }
  to   { transform: translateX(0); }
}
.pl-card {
  position: absolute;
  width: 220px; height: 300px;
  border-radius: 18px;
  cursor: pointer;
  overflow: hidden;
  transition: transform .55s cubic-bezier(.25,.46,.45,.94),
              opacity  .55s cubic-bezier(.25,.46,.45,.94),
              box-shadow .3s ease;
  user-select: none;
  touch-action: pan-y;
}
.pl-card:hover .pl-label { animation: hover-label .25s ease forwards; }
.pl-card:hover { filter: brightness(1.15); }
.pl-card.active { animation: active-glow-pulse 2.5s ease-in-out infinite; }

.pl-label {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 48px 18px 18px;
  background: linear-gradient(to top, rgba(0,0,0,.92) 0%, transparent 100%);
  opacity: 0;
  pointer-events: none;
}
.pl-card.active .pl-label { opacity: 1; animation: none; }

.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(163,255,71,.25);
  color: ${NEON}; font-size: 1.3rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 30;
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.carousel-arrow:hover {
  background: rgba(163,255,71,.15);
  border-color: ${NEON};
  box-shadow: 0 0 16px rgba(163,255,71,.4);
}

`;

type AlbumCard = { id: string; titulo: string; año: string; canciones: number; caratula?: string; artista: string; genero: string };

function PlaylistCarouselSection() {
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [slideAnim, setSlideAnim] = useState<{ key: number; dir: "left" | "right" }>({ key: 0, dir: "left" });
  const [albums, setAlbums] = useState<AlbumCard[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragMoved  = useRef(false);
  const router = useRouter();
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetch("/api/albums")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAlbums(data);
          setActive(Math.min(4, Math.floor(data.length / 2)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const n = albums.length;
  const prev = () => {
    setActive(a => (a - 1 + n) % n);
    setSlideAnim(s => ({ key: s.key + 1, dir: "right" }));
  };
  const next = () => {
    setActive(a => (a + 1) % n);
    setSlideAnim(s => ({ key: s.key + 1, dir: "left" }));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragMoved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 8) dragMoved.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 40) { delta < 0 ? next() : prev(); }
    dragStartX.current = null;
  };

  const handleListenNow = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/usuario"); return; }

    const album = albums[active];
    if (!album) return;

    const res = await fetch(`/api/canciones?album_id=${album.id}`);
    if (!res.ok) return;
    const canciones = await res.json();
    if (!Array.isArray(canciones) || canciones.length === 0) return;

    const queue = canciones.map((c: any) => ({
      title:    c.titulo,
      artist:   c.artista || album.artista,
      duration: c.duracion,
      icon:     c.caratula || album.caratula || undefined,
      accent:   ACCENTS[active % ACCENTS.length],
    }));
    playTrack(queue[0], queue);
  };

  return (
    <div
      id="join"
      ref={sectionRef}
      style={{ background: "#000", minHeight: "100vh", position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "100px" }}
    >
      <style>{carouselCss}</style>

      {/* Scanline texture overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.015) 2px,rgba(255,255,255,.015) 4px)", pointerEvents:"none", zIndex:1 }} />

      {/* Header */}
      <div style={{ textAlign:"center", paddingTop:"90px", marginBottom:"20px", zIndex:5, position:"relative" }}>
        <p style={{ color:"rgba(163,255,71,.7)", fontFamily:"var(--font-anton),'Anton',sans-serif",
          letterSpacing:"5px", fontSize:".8rem", margin:"0 0 10px", textTransform:"uppercase" }}>
          Tu música. Tu mundo.
        </p>
        <h2 style={{ fontFamily:"var(--font-anton),'Anton',sans-serif", fontSize:"clamp(3rem,7vw,5.5rem)",
          color:"#fff", margin:0, letterSpacing:"2px", lineHeight:1,
          textShadow:`0 0 40px rgba(163,255,71,.3)` }}>
          RADAR DE NOVEDADES
        </h2>
        <div style={{ height:"3px", width:"80px", background:NEON, margin:"18px auto 0",
          boxShadow:`0 0 16px ${NEON}` }} />
      </div>

      {/* Carousel viewport */}
      <div
        style={{ position:"relative", width:"100%", maxWidth:"1200px", height:"440px",
          perspective:"1200px", margin:"30px 0 40px", zIndex:5, cursor:"grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Green orbit halo */}
        <div className="halo-breathe" style={{
          position:"absolute", bottom:"-30px", left:"50%",
          width:"620px", height:"60px",
          background:`radial-gradient(ellipse at center, rgba(163,255,71,.22) 0%, transparent 70%)`,
          animation: entered ? "halo-breathe 3s ease-in-out infinite" : "none",
          pointerEvents:"none", zIndex:0,
        }} />

        {/* Cards */}
        <div
          key={slideAnim.key}
          style={{
            position: "absolute", inset: 0,
            animation: slideAnim.key > 0
              ? `${slideAnim.dir === "left" ? "track-from-right" : "track-from-left"} .48s cubic-bezier(.25,.46,.45,.94) both`
              : "none",
          }}
        >
        {albums.map((album, idx) => {
          const accent = ACCENTS[idx % ACCENTS.length];
          let offset = idx - active;
          if (offset > n / 2)  offset -= n;
          if (offset < -n / 2) offset += n;
          const absOff = Math.abs(offset);
          if (absOff > 1) return null;

          const translateX = offset * 248;
          const translateY = absOff === 0 ? -50 : 45;
          const rotateY    = offset * -16;
          const scale      = absOff === 0 ? 1.06 : 0.80;
          const zIndex     = absOff === 0 ? 20 : 10;
          const opacity    = absOff === 0 ? 1 : 0.82;
          const isActive   = offset === 0;

          return (
            <div
              key={album.id}
              className={`pl-card${isActive ? " active" : ""}`}
              onClick={() => { if (!dragMoved.current) setActive(idx); }}
              style={{
                background: "#0a0a0a",
                left: "50%",
                top:  "50%",
                marginLeft: "-110px",
                marginTop:  "-150px",
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                animation: (entered && slideAnim.key === 0)
                  ? `card-tri-enter .6s ease ${absOff * 0.15}s backwards${isActive ? ", active-glow-pulse 2.5s .8s ease-in-out infinite" : ""}`
                  : isActive ? "active-glow-pulse 2.5s ease-in-out infinite" : "none",
              }}
            >
              {/* Portada */}
              {album.caratula ? (
                <img
                  src={album.caratula}
                  alt={album.titulo}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                    objectFit:"cover", display:"block", pointerEvents:"none" }}
                />
              ) : (
                <div style={{ position:"absolute", inset:0,
                  background:`radial-gradient(circle at 40% 40%, ${accent}33, #0a0a0a)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"4rem", color:`${accent}88` }}>♪</div>
              )}

              {/* Scrim oscuro sobre la imagen */}
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.75) 100%)",
                pointerEvents:"none" }} />

              {/* Accent bar */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"4px",
                background:accent, boxShadow:`0 0 16px ${accent}`, zIndex:2 }} />

              {/* Año badge */}
              <div style={{ position:"absolute", top:"18px", right:"16px",
                background:"rgba(0,0,0,.65)", border:`1px solid ${accent}55`,
                borderRadius:"20px", padding:"3px 10px",
                color:accent, fontSize:".7rem", fontFamily:"Arial, sans-serif",
                letterSpacing:"1px", zIndex:2 }}>
                {album.año ? new Date(album.año).getFullYear() : ""}
              </div>

              {/* Label */}
              <div className="pl-label" style={{ zIndex:2 }}>
                <p style={{ margin:"0 0 4px", fontFamily:"var(--font-anton),'Anton',sans-serif",
                  fontSize:"1.1rem", color:"#fff", letterSpacing:"2px" }}>{album.titulo.toUpperCase()}</p>
                <p style={{ margin:0, fontSize:".75rem", color:"rgba(255,255,255,.65)",
                  fontFamily:"Arial,sans-serif" }}>{album.artista} · {album.genero}</p>
              </div>
            </div>
          );
        })}
        </div>

        {/* Escuchar ahora */}
        <div style={{
          position: "absolute",
          top: "calc(50% + 118px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 25,
        }}>
          <button
            key={active}
            onClick={handleListenNow}
            style={{
              background: NEON,
              color: "#050a00",
              border: "none",
              borderRadius: "50px",
              padding: "11px 30px",
              fontWeight: 800,
              fontSize: ".88rem",
              cursor: "pointer",
              fontFamily: "var(--font-nunito),'Trebuchet MS',sans-serif",
              letterSpacing: ".5px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 4px 22px ${NEON}55`,
              animation: entered ? "listen-btn-in .45s cubic-bezier(.34,1.56,.64,1) both" : "none",
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 32px ${NEON}88`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 22px ${NEON}55`;
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            Escuchar ahora
          </button>
        </div>

      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"8px", zIndex:5, position:"relative", marginBottom:"60px" }}>
        {albums.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? "24px" : "8px", height:"8px",
            borderRadius:"4px", border:"none", cursor:"pointer",
            background: i === active ? NEON : "rgba(255,255,255,.2)",
            boxShadow: i === active ? `0 0 10px ${NEON}` : "none",
            transition:"all .3s ease", padding:0,
          }} />
        ))}
      </div>

    </div>
  );
}

// ─── Reviews Section ─────────────────────────────────────────────────────────

const reviewData = [
  { name: "NightSurfer_88",  genre: "Synthwave",  rating: 5, quote: "Las recomendaciones son tan precisas que parece que SpotiFake me lee la mente.", accent: "#6e2fff" },
  { name: "BassDropQueen",   genre: "Hip-hop",    rating: 5, quote: "Jamás pensé que encontraría tanta música underground en un solo lugar.", accent: "#ff3c3c" },
  { name: "ChillVibesOnly",  genre: "Lo-fi",      rating: 4, quote: "El modo de estudio con lo-fi me ha salvado en tantos exámenes. Imprescindible.", accent: "#00d4ff" },
  { name: "Euphoria.wav",    genre: "Pop",         rating: 5, quote: "Las playlists curadas son perfectas. No puedo dejar de escuchar.", accent: "#ff6ef7" },
  { name: "DarkMatter.exe",  genre: "Electronic",  rating: 5, quote: "La calidad de audio es impecable. Noto cada detalle en la producción.", accent: "#a3ff47" },
  { name: "SolarFlare",      genre: "Rock",        rating: 4, quote: "Encontré bandas que ni sabía que existían. Mi universo musical explotó.", accent: "#ff9a00" },
  { name: "VoidWalker_XIII", genre: "Metal",       rating: 5, quote: "El único servicio que no me bombardea con pop mainstream. Por fin.", accent: "#c060ff" },
  { name: "NeonTokyo_Girl",  genre: "J-Pop",       rating: 5, quote: "La sección de música asiática es increíble. Encuentro todo aquí.", accent: "#ff0080" },
  { name: "DeepSea_Sound",   genre: "Ambient",     rating: 5, quote: "Perfecta para concentrarse. El modo offline es una maravilla añadida.", accent: "#00ffcc" },
  { name: "BrokenBeat_Soul", genre: "Neo-Soul",    rating: 4, quote: "El diseño es hermoso y la experiencia fluye de manera muy natural.", accent: "#ffcc00" },
];

const reviewsCss = `
@keyframes marquee-fwd {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes marquee-rev {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
@keyframes spin-rv {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes eq-wave {
  0%, 100% { transform: scaleY(0.15); opacity: 0.35; }
  50%       { transform: scaleY(1);    opacity: 0.8; }
}
.rv-row {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap;
  width: max-content;
  padding: 10px 0;
}
.rv-row--fwd { animation: marquee-fwd 48s linear infinite; }
.rv-row--rev { animation: marquee-rev 62s linear infinite; }
.rv-row--fwd:hover,
.rv-row--rev:hover {
  animation-play-state: paused;
}
.rv-card {
  flex-shrink: 0;
  width: 300px;
  border-radius: 16px;
  padding: 18px 20px 14px;
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease;
  cursor: default;
}
.rv-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255,255,255,0.2);
}
`;

function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const row2 = [...reviewData.slice(5), ...reviewData.slice(0, 5)];
  const doubled1 = [...reviewData, ...reviewData];
  const doubled2 = [...row2, ...row2];

  const vinylBg = (accent: string) =>
    `radial-gradient(circle, ${accent} 0%, ${accent} 18%, #0d0d0d 19%, #0d0d0d 24%, #1c1c1c 25%, #0d0d0d 27%, #1c1c1c 30%, #0d0d0d 33%, #1c1c1c 37%, #0d0d0d 41%, #1c1c1c 47%, #0d0d0d 52%, #1c1c1c 59%, #0d0d0d 64%, #1c1c1c 73%, #0d0d0d 78%, #1c1c1c 88%, #0d0d0d 93%, #111 100%)`;

  const eqBars = Array.from({ length: 16 }, (_, i) => ({
    delay:    `${(i * 0.1).toFixed(1)}s`,
    duration: `${(0.5 + (i % 5) * 0.12).toFixed(2)}s`,
    peakH:    12 + (i % 8) * 3,
  }));

  const renderCard = (r: typeof reviewData[0], idx: number) => (
    <div
      key={idx}
      className="rv-card"
      style={{ borderTop: `2px solid ${r.accent}` }}
    >
      {/* Top accent glow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "70px",
        background: `linear-gradient(to bottom, ${r.accent}18, transparent)`,
        pointerEvents: "none",
      }} />

      {/* Vinyl + name + stars */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", position: "relative", zIndex: 1 }}>
        <div style={{
          width: "54px", height: "54px", borderRadius: "50%", flexShrink: 0,
          animation: `spin-rv ${3.2 + (idx % reviewData.length) * 0.28}s linear infinite`,
          background: vinylBg(r.accent),
          boxShadow: `0 0 14px ${r.accent}55`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "11px", height: "11px", borderRadius: "50%",
            background: "#060612",
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: "#fff", fontWeight: 700,
            fontFamily: "var(--font-nunito),'Trebuchet MS',sans-serif",
            fontSize: ".88rem", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{r.name}</div>
          <div style={{
            color: r.accent, fontSize: ".68rem",
            fontFamily: "Arial,sans-serif",
            letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px",
          }}>{r.genre}</div>
        </div>

        <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{
              fontSize: ".78rem",
              color: s <= r.rating ? r.accent : "rgba(255,255,255,0.1)",
              textShadow: s <= r.rating ? `0 0 8px ${r.accent}` : "none",
            }}>★</span>
          ))}
        </div>
      </div>

      {/* Quote */}
      <p style={{
        color: "rgba(255,255,255,0.7)",
        fontSize: ".82rem", lineHeight: 1.55,
        margin: "0 0 14px",
        fontStyle: "italic",
        fontFamily: "Arial,sans-serif",
        position: "relative", zIndex: 1,
      }}>
        &ldquo;{r.quote}&rdquo;
      </p>

      {/* Equalizer bars */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "2px", height: "26px",
        position: "relative", zIndex: 1,
      }}>
        {eqBars.map((bar, bi) => (
          <div key={bi} style={{
            flex: 1, height: `${bar.peakH}px`,
            background: `linear-gradient(to top, ${r.accent}, ${r.accent}44)`,
            borderRadius: "2px 2px 0 0",
            transformOrigin: "bottom",
            animation: `eq-wave ${bar.duration} ${bar.delay} ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={sectionRef}
      style={{ background: "#080812", overflow: "hidden", paddingBottom: "80px", position: "relative" }}
    >
      <style>{reviewsCss}</style>

      {/* Radial glow behind title */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "900px", height: "500px",
        background: "radial-gradient(ellipse at center top, rgba(28,240,148,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Section header */}
      <div style={{
        textAlign: "center",
        padding: "90px 20px 50px",
        position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <p style={{
          color: "#1CF094",
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          letterSpacing: "5px", fontSize: ".75rem",
          margin: "0 0 14px", textTransform: "uppercase",
        }}>
          ★ Más de 500 reseñas verificadas ★
        </p>
        <h2 style={{
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          fontSize: "clamp(3rem,7vw,5.5rem)",
          color: "#fff", margin: 0,
          letterSpacing: "2px", lineHeight: 1.05,
        }}>
          LA COMUNIDAD
        </h2>
        <h2 style={{
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          fontSize: "clamp(3rem,7vw,5.5rem)",
          margin: "0 0 24px",
          letterSpacing: "2px", lineHeight: 1.05,
          background: "linear-gradient(90deg, #1CF094 0%, #a3ff47 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          OPINA
        </h2>
        <div style={{
          height: "2px", width: "60px",
          background: "linear-gradient(90deg, #1CF094, #a3ff47)",
          margin: "0 auto",
          boxShadow: "0 0 14px rgba(28,240,148,0.5)",
        }} />
      </div>

      {/* Marquee rows */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease 0.35s",
      }}>
        <div className="rv-row rv-row--fwd">
          {doubled1.map((r, idx) => renderCard(r, idx))}
        </div>
        <div className="rv-row rv-row--rev">
          {doubled2.map((r, idx) => renderCard(r, idx))}
        </div>
      </div>
    </div>
  );
}

const faqData = [
  {
    question: "¿Qué es SpotiFake?",
    answer: "SpotiFake es una plataforma de streaming de música inspirada en Spotify, desarrollada como proyecto educativo. Permite explorar artistas, álbumes, canciones y crear listas de reproducción personalizadas, todo con un diseño fresco y amigable.",
  },
  {
    question: "¿Necesito una cuenta para escuchar música?",
    answer: "Puedes navegar por el catálogo sin registrarte, pero para disfrutar de funciones como guardar canciones en favoritos, crear listas de reproducción o acceder a tu perfil, necesitarás crear una cuenta gratuita. El registro es rápido y sencillo.",
  },
  {
    question: "¿Cómo creo una lista de reproducción?",
    answer: "Una vez que hayas iniciado sesión, ve a la sección «Playlists» desde el menú de navegación y haz clic en «Nueva playlist». Ponle un nombre, añade una portada si quieres y empieza a agregar canciones desde cualquier álbum o artista.",
  },
  {
    question: "¿Cómo añado canciones a mis favoritos?",
    answer: "En cualquier canción del reproductor o del listado de un álbum verás un icono de corazón. Dale clic para guardarla en tus «Me gusta». Puedes acceder a todas tus canciones favoritas desde la sección «Liked Songs» dentro de Playlists.",
  },
  {
    question: "¿Puedo cambiar mi foto de perfil o mi nombre?",
    answer: "Sí. Entra en tu perfil haciendo clic en tu avatar en la barra de navegación y selecciona «Configuración». Desde allí podrás actualizar tu nombre y subir una nueva foto de perfil.",
  },
  {
    question: "He olvidado mi contraseña, ¿qué hago?",
    answer: "En la página de inicio de sesión encontrarás el enlace «¿Has olvidado tu contraseña?». Introduce tu correo electrónico y te enviaremos un enlace para restablecerla. Comprueba también la carpeta de spam por si acaso.",
  },
  {
    question: "¿Por qué algunas canciones no se reproducen correctamente?",
    answer: "SpotiFake es un proyecto en desarrollo, por lo que algunos archivos de audio pueden no estar disponibles todavía. Si tienes problemas de reproducción, prueba a refrescar la página o comprueba tu conexión a Internet.",
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id="faq"
      ref={sectionRef}
      style={{
        background: "#060910",
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px 110px",
      }}
    >
      {/* Glow superior */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse at center top, rgba(28,240,148,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        textAlign: "center", maxWidth: 680, margin: "0 auto 64px",
        position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <p style={{
          color: "#1CF094",
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          letterSpacing: "5px", fontSize: ".75rem",
          margin: "0 0 14px", textTransform: "uppercase",
        }}>
          Preguntas frecuentes
        </p>
        <h2 style={{
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          fontSize: "clamp(3rem,7vw,5.5rem)",
          color: "#fff", margin: "0 0 20px",
          letterSpacing: "2px", lineHeight: 1.05,
        }}>
          ¿TIENES ALGUNA
        </h2>
        <h2 style={{
          fontFamily: "var(--font-anton),'Anton',sans-serif",
          fontSize: "clamp(3rem,7vw,5.5rem)",
          margin: "0 0 24px",
          letterSpacing: "2px", lineHeight: 1.05,
          background: "linear-gradient(90deg, #1CF094 0%, #a3ff47 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          DUDA?
        </h2>
        <div style={{
          height: "2px", width: "60px",
          background: "linear-gradient(90deg, #1CF094, #a3ff47)",
          margin: "0 auto",
          boxShadow: "0 0 14px rgba(28,240,148,0.5)",
        }} />
      </div>

      {/* Acordeón */}
      <div style={{
        maxWidth: 720, margin: "0 auto",
        position: "relative", zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease 0.25s",
      }}>
        {faqData.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                background: isOpen ? "rgba(28,240,148,0.05)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isOpen ? "rgba(28,240,148,0.25)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 14,
                marginBottom: 10,
                cursor: "pointer",
                transition: "background 0.25s, border-color 0.25s",
                overflow: "hidden",
              }}
            >
              {/* Pregunta */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px",
                gap: 16,
              }}>
                <span style={{
                  color: isOpen ? "#1CF094" : "white",
                  fontFamily: "var(--font-nunito),'Trebuchet MS',sans-serif",
                  fontWeight: 700, fontSize: "0.95rem",
                  transition: "color 0.2s",
                  lineHeight: 1.4,
                }}>
                  {faq.question}
                </span>
                <svg
                  width="18" height="18" viewBox="0 0 18 18" fill="none"
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.35s ease",
                  }}
                >
                  <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke={isOpen ? "#1CF094" : "rgba(255,255,255,0.4)"}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Respuesta */}
              <div style={{
                maxHeight: isOpen ? "300px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <p style={{
                  margin: 0,
                  padding: "0 24px 22px",
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function IntroPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const coverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velRef    = useRef<{ x: number; y: number }[]>(
    allImages.map(() => ({ x: 0, y: 0 }))
  );
  const posRef    = useRef<{ x: number; y: number }[]>(
    allImages.map(() => ({ x: 0, y: 0 }))
  );
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

  const tick = useCallback(() => {
    const { x: mx, y: my } = mouseRef.current;

    coverRefs.current.forEach((el, idx) => {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;

      // Vector desde el ratón al centro del item
      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX = 0;
      let targetY = 0;

      if (dist < REPULSION_R && dist > 0) {
        const t = 1 - dist / REPULSION_R;          // 0 en el borde, 1 en el centro
        const force = t * t * REPULSION_FORCE;      // caída cuadrática
        targetX = (dx / dist) * force;
        targetY = (dy / dist) * force;
      }

      // Interpolación suave (lerp) para la posición actual
      const p = posRef.current[idx];
      p.x += (targetX - p.x) * 0.18;
      p.y += (targetY - p.y) * 0.18;

      // Solo actualizar el DOM si el desplazamiento es apreciable
      if (Math.abs(p.x) > 0.05 || Math.abs(p.y) > 0.05) {
        el.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`;
        // Sombra dinámica según intensidad de repulsión
        const intensity = Math.sqrt(p.x * p.x + p.y * p.y) / REPULSION_FORCE;
        if (intensity > 0.05) {
          el.style.boxShadow = `0 ${6 + intensity * 18}px ${24 + intensity * 30}px rgba(0,0,0,.7), 0 0 ${intensity * 24}px rgba(28,240,148,${(intensity * 0.6).toFixed(2)})`;
        } else {
          el.style.boxShadow = "";
        }
      }
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  return (
    <>
      <style>{css}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 50% 40%, #16203a 0%, #080c18 65%, #000 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Estrellas de fondo */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width:  i % 5 === 0 ? "2px" : "1px",
              height: i % 5 === 0 ? "2px" : "1px",
              borderRadius: "50%",
              background: "white",
              opacity: 0.15 + ((i * 37) % 50) / 100,
              top:  `${(i * 37 + 13) % 100}%`,
              left: `${(i * 53 +  7) % 100}%`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Contenedor de órbitas */}
        <div style={{ position: "relative", width: "780px", height: "780px", flexShrink: 0 }}>

          {/* Anillos decorativos */}
          <div className="ring" style={{ width: `${INNER_R*2}px`, height: `${INNER_R*2}px`, border: "1px solid rgba(28,240,148,.12)" }} />
          <div className="ring" style={{ width: `${OUTER_R*2}px`, height: `${OUTER_R*2}px`, border: "1px solid rgba(28,240,148,.07)" }} />

          {/* Carátulas */}
          {allImages.map(({ src, orbit, i }, flatIdx) => (
            <div
              key={flatIdx}
              className={`orbit-slot orbit-slot--${orbit}`}
              style={{
                animationDelay: `-${
                  orbit === "inner"
                    ? (i / innerImages.length) * INNER_DUR
                    : (i / outerImages.length) * OUTER_DUR
                }s`,
              }}
            >
              <div
                className="cover-inner"
                ref={el => { coverRefs.current[flatIdx] = el; }}
              >
                <img src={src} alt="" />
              </div>
            </div>
          ))}

          {/* Elemento central */}
          <div
            style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "18px", zIndex: 10,
            }}
          >
            <img
              src="/images/hojita.png"
              alt="SpotiFake"
              className="center-logo"
              style={{ width: "110px", height: "110px", objectFit: "cover" }}
            />
            <div className="center-text">
              <h1 style={{
                color: "white", fontSize: "2.6rem", fontWeight: 900,
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                letterSpacing: "-1px", margin: 0, lineHeight: 1,
                textShadow: "0 2px 20px rgba(28,240,148,.3)",
              }}>
                SpotiFake
              </h1>
              <p style={{
                color: "rgba(255,255,255,.5)", fontSize: ".88rem",
                margin: "8px 0 0", fontFamily: "Arial, sans-serif",
                letterSpacing: ".5px",
              }}>
                Tu música. Tu mundo.
              </p>
            </div>
            <button
              className="enter-btn"
              onClick={() => loggedIn ? router.push("/inicio") : setShowRegisterModal(true)}
              style={{ border: "none", cursor: "pointer" }}
            >
              Explorar →
            </button>
          </div>

        </div>

        {/* Botón scroll hacia "for listeners" */}
        <a
          href="#for-listeners"
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            fontSize: "0.75rem",
            letterSpacing: "1.5px",
            fontFamily: "Arial, sans-serif",
            animation: "float-y 2.5s ease-in-out infinite",
            zIndex: 20,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
      </div>

      <VinylSection />
      <PlaylistCarouselSection />
      <ReviewsSection />
      <FaqSection />

      {/* Modal: registro requerido */}
      {showRegisterModal && (
        <div
          onClick={() => setShowRegisterModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,4,12,0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "modal-backdrop-in 0.25s ease both",
          }}
        >
          <style>{`
            @keyframes modal-backdrop-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes modal-box-in {
              from { opacity: 0; transform: scale(0.88) translateY(24px); }
              to   { opacity: 1; transform: scale(1)    translateY(0); }
            }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(145deg, #0a1628 0%, #060910 100%)",
              border: "1px solid rgba(28,240,148,0.22)",
              borderRadius: "24px",
              padding: "40px 36px 36px",
              width: "100%", maxWidth: "420px",
              boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(28,240,148,0.08)",
              animation: "modal-box-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
              position: "relative",
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowRegisterModal(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%", width: 32, height: 32,
                color: "rgba(255,255,255,0.5)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", lineHeight: 1,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
            >×</button>

            {/* Icono */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(28,240,148,0.15), rgba(28,240,148,0.05))",
                border: "1px solid rgba(28,240,148,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 32px rgba(28,240,148,0.15)",
              }}>
                <img src="/images/hojita.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
              </div>
            </div>

            {/* Texto */}
            <h2 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
              fontWeight: 900, fontSize: "1.4rem",
              color: "white", textAlign: "center", letterSpacing: "-0.3px",
            }}>
              ¡Únete a SpotiFake!
            </h2>
            <p style={{
              margin: "0 0 28px",
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.88rem",
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
              lineHeight: 1.6,
            }}>
              Necesitas una cuenta para explorar el catálogo,<br />
              escuchar música y crear tus playlists.
            </p>

            {/* Botones */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/usuario"
                onClick={() => setShowRegisterModal(false)}
                style={{
                  display: "block", textAlign: "center",
                  background: "linear-gradient(135deg, #1CF094 0%, #5eead4 50%, #a3ff47 100%)",
                  backgroundSize: "200% auto",
                  color: "#061210",
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 900, fontSize: "0.95rem",
                  padding: "13px 0", borderRadius: "50px",
                  textDecoration: "none",
                  boxShadow: "0 4px 24px rgba(28,240,148,0.4)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px) scale(1.02)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 36px rgba(28,240,148,0.6)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(28,240,148,0.4)"; }}
              >
                Registrarse gratis
              </Link>
              <Link
                href="/usuario"
                onClick={() => setShowRegisterModal(false)}
                style={{
                  display: "block", textAlign: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700, fontSize: "0.88rem",
                  padding: "12px 0", borderRadius: "50px",
                  textDecoration: "none",
                  transition: "background 0.2s, border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)"; }}
              >
                Ya tengo cuenta — Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


