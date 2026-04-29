"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
              <img
                src="/images/logo.jpeg"
                alt="SpotiFake"
                style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                fontWeight: 900,
                fontSize: "1.1rem",
                background: "linear-gradient(90deg, #1CF094, #5eead4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.3px",
              }}>
                SpotiFake
              </span>
            </Link>
          </div>

          {/* Centro: links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link href={loggedIn ? "/inicio" : "/"} className={`nav-link${pathname === "/inicio" || pathname === "/" ? " nav-link--active" : ""}`}>Inicio</Link>
            <Link href="/discos" className={`nav-link${pathname === "/discos" ? " nav-link--active" : ""}`}>Discos</Link>
            <Link href="/faq" className={`nav-link${pathname === "/faq" ? " nav-link--active" : ""}`}>FAQ</Link>
            {loggedIn && (
              <Link href="/configuracion" className={`nav-link${pathname === "/configuracion" ? " nav-link--active" : ""}`}>Configuración</Link>
            )}
          </div>

          {/* Derecha: botón */}
          <div style={{ flexShrink: 0 }}>
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
