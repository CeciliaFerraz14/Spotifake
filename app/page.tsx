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
    : step === 3                 ? "translate(calc(-50% - 62vw), 50%)"
    : step === 4                 ? "translate(calc(-50% + 62vw), 100%)" // derecha, oculto
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
      ref={sectionRef}
      style={{ minHeight: "100vh", background: "#d4b8f0", position: "relative", overflow: "hidden" }}
    >
      {/* "for artists" — debajo del telón, se revela cuando el telón se va */}
      <h2 style={{ ...headingBase, color: "#3d1a6b", zIndex: 2,
        opacity: onLilac ? 1 : 0, transition: "opacity 0.9s ease 0.4s" }}>
        for artists
      </h2>

      {/* ── Telón verde ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#1CF094",
        transform: curtainX,
        transition: curtainTr,
        zIndex: 3,
      }}>
        {/* "for listeners" viaja dentro del telón */}
        <h2 style={{ ...headingBase, color: "#0d3d25", zIndex: 1 }}>
          for listeners
        </h2>
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
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2,
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#0a0a0a", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.9)",
            }} />
          </div>
        </div>
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
      </div>

      <VinylSection />
    </>
  );
}
