"use client";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";

const innerImages = [
  "/images/Portada_1.jpg",
  "/images/Portada_2.jpg",
  "/images/Portada_3.jpg",
  "/images/Portada4.jpg",
  "/images/Portada5.jpg",
  "/images/Portada6.jpg",
];

const outerImages = [
  "/images/dj_keke.jpg",
  "/images/totakeke.jpg",
  "/images/chil.jpg",
  "/images/icon1.jpg",
  "/images/icon2.jpg",
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

const playlists = [
  { name: "NIGHT DRIVE",  genre: "Synthwave · Lo-fi",   songs: 32, accent: "#6e2fff", bg: "linear-gradient(135deg,#0d0020 0%,#1a0040 100%)" },
  { name: "RAGE MODE",    genre: "Hip-hop · Trap",       songs: 47, accent: "#ff3c3c", bg: "linear-gradient(135deg,#200000 0%,#3a0505 100%)" },
  { name: "CHILL WAVE",   genre: "Indie · Ambient",      songs: 28, accent: "#00d4ff", bg: "linear-gradient(135deg,#001520 0%,#002a3a 100%)" },
  { name: "EUPHORIA",     genre: "Pop · Dance",          songs: 55, accent: "#ff6ef7", bg: "linear-gradient(135deg,#1a0020 0%,#35003a 100%)" },
  { name: "DARK MATTER",  genre: "Electronic · DnB",     songs: 41, accent: NEON,      bg: "linear-gradient(135deg,#001a00 0%,#003a0a 100%)" },
  { name: "SOLAR FLARE",  genre: "Rock · Psych",         songs: 36, accent: "#ff9a00", bg: "linear-gradient(135deg,#1a0800 0%,#3a1800 100%)" },
  { name: "VOID WALKER",  genre: "Industrial · Metal",   songs: 23, accent: "#c060ff", bg: "linear-gradient(135deg,#100015 0%,#220030 100%)" },
  { name: "NEON TOKYO",   genre: "J-Pop · Future Bass",  songs: 38, accent: "#ff0080", bg: "linear-gradient(135deg,#1a0010 0%,#35002a 100%)" },
  { name: "DEEP SEA",     genre: "Ambient · Drone",      songs: 19, accent: "#00ffcc", bg: "linear-gradient(135deg,#001510 0%,#002820 100%)" },
  { name: "BROKEN BEAT",  genre: "Jazz · Neo-Soul",      songs: 44, accent: "#ffcc00", bg: "linear-gradient(135deg,#1a1400 0%,#2e2200 100%)" },
];

const carouselCss = `
@keyframes card-enter {
  from { opacity: 0; transform: translateY(70px) scale(0.85); }
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

function PlaylistCarouselSection() {
  const [active, setActive] = useState(4);
  const [entered, setEntered] = useState(false);
  const [slideAnim, setSlideAnim] = useState<{ key: number; dir: "left" | "right" }>({ key: 0, dir: "left" });
  const sectionRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragMoved  = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const prev = () => {
    setActive(a => Math.max(0, a - 1));
    setSlideAnim(s => ({ key: s.key + 1, dir: "right" }));
  };
  const next = () => {
    setActive(a => Math.min(playlists.length - 1, a + 1));
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
        style={{ position:"relative", width:"100%", maxWidth:"1200px", height:"380px",
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

        {/* Arrow left */}
        <button className="carousel-arrow" style={{ left:"0px" }} onClick={prev} aria-label="anterior">
          ‹
        </button>

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
        {playlists.map((pl, idx) => {
          const offset = idx - active;
          const absOff = Math.abs(offset);
          if (absOff > 4) return null;

          const translateX = offset * 145;
          const rotateY    = offset * -28;
          const scaleMap: Record<number, number> = { 0: 1, 1: 0.84, 2: 0.70, 3: 0.58, 4: 0.48 };
          const scale      = scaleMap[absOff] ?? 0.48;
          const zIndex     = 20 - absOff;
          const opacity    = absOff === 4 ? 0.35 : 1 - absOff * 0.14;
          const isActive   = offset === 0;

          return (
            <div
              key={pl.name}
              className={`pl-card${isActive ? " active" : ""}`}
              onClick={() => { if (!dragMoved.current) setActive(idx); }}
              style={{
                background: "#0a0a0a",
                left: "50%",
                top:  "50%",
                marginLeft: "-110px",
                marginTop:  "-150px",
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                animationDelay: entered ? `${idx * 0.08}s` : "0s",
                animation: entered
                  ? `card-enter .7s cubic-bezier(.34,1.56,.64,1) ${idx * 0.08}s both${isActive ? ", active-glow-pulse 2.5s 1s ease-in-out infinite" : ""}`
                  : "none",
              }}
            >
              {/* Portada */}
              <img
                src={innerImages[idx % innerImages.length]}
                alt={pl.name}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"cover", display:"block", pointerEvents:"none" }}
              />

              {/* Scrim oscuro sobre la imagen */}
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.75) 100%)",
                pointerEvents:"none" }} />

              {/* Accent bar */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"4px",
                background:pl.accent, boxShadow:`0 0 16px ${pl.accent}`, zIndex:2 }} />

              {/* Song count badge */}
              <div style={{ position:"absolute", top:"18px", right:"16px",
                background:"rgba(0,0,0,.65)", border:`1px solid ${pl.accent}55`,
                borderRadius:"20px", padding:"3px 10px",
                color:pl.accent, fontSize:".7rem", fontFamily:"Arial, sans-serif",
                letterSpacing:"1px", zIndex:2 }}>
                {pl.songs} tracks
              </div>

              {/* Label */}
              <div className="pl-label" style={{ zIndex:2 }}>
                <p style={{ margin:"0 0 4px", fontFamily:"var(--font-anton),'Anton',sans-serif",
                  fontSize:"1.1rem", color:"#fff", letterSpacing:"2px" }}>{pl.name}</p>
                <p style={{ margin:0, fontSize:".75rem", color:"rgba(255,255,255,.65)",
                  fontFamily:"Arial,sans-serif" }}>{pl.genre}</p>
              </div>
            </div>
          );
        })}
        </div>

        {/* Arrow right */}
        <button className="carousel-arrow" style={{ right:"0px" }} onClick={next} aria-label="siguiente">
          ›
        </button>
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"8px", zIndex:5, position:"relative", marginBottom:"60px" }}>
        {playlists.map((_, i) => (
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

export default function IntroPage() {
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const coverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velRef    = useRef<{ x: number; y: number }[]>(
    allImages.map(() => ({ x: 0, y: 0 }))
  );
  const posRef    = useRef<{ x: number; y: number }[]>(
    allImages.map(() => ({ x: 0, y: 0 }))
  );
  const rafRef    = useRef<number | null>(null);

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
              src="/images/logo.png"
              alt="SpotiFake"
              className="center-logo"
              style={{ width: "110px", height: "110px", objectFit: "contain" }}
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
            <Link href="/inicio" className="enter-btn">
              Explorar →
            </Link>
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
          <span style={{ textTransform: "uppercase" }}>for listeners</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
      </div>

      <VinylSection />
      <PlaylistCarouselSection />
    </>
  );
}


