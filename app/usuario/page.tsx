"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const loginCss = `
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 40px 8px rgba(28,240,148,.35), 0 0 90px 20px rgba(28,240,148,.12); }
    50%       { box-shadow: 0 0 65px 14px rgba(28,240,148,.6), 0 0 130px 30px rgba(28,240,148,.2); }
  }
  @keyframes float-y {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes float-y-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-18px) rotate(4deg); }
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes spin-vinyl {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes spin-vinyl-rev {
    from { transform: rotate(360deg); }
    to   { transform: rotate(0deg); }
  }
  @keyframes eq-wave {
    0%, 100% { transform: scaleY(0.15); opacity: 0.4; }
    50%       { transform: scaleY(1);    opacity: 0.9; }
  }
  @keyframes card-in {
    from { opacity: 0; transform: translateY(50px) scale(0.93); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes logo-in {
    from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes ring-breathe {
    0%, 100% { opacity: 0.06; transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 0.12; transform: translate(-50%, -50%) scale(1.04); }
  }
  @keyframes note-float {
    0%   { transform: translateY(0)   rotate(0deg);  opacity: 0; }
    15%  { opacity: 0.55; }
    85%  { opacity: 0.55; }
    100% { transform: translateY(-90px) rotate(25deg); opacity: 0; }
  }

  .login-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 14px;
    padding: 14px 16px;
    color: white;
    font-size: 0.9rem;
    font-family: Arial, sans-serif;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    box-sizing: border-box;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.22); }
  .login-input:focus {
    border-color: rgba(28,240,148,0.55);
    box-shadow: 0 0 0 3px rgba(28,240,148,0.1), 0 0 18px rgba(28,240,148,0.12);
    background: rgba(28,240,148,0.04);
  }

  .enter-btn-login {
    background: linear-gradient(90deg, #1CF094 0%, #5eead4 50%, #1CF094 100%);
    background-size: 200% auto;
    animation: shimmer-btn 3s linear infinite;
    color: #0a0f1a;
    font-weight: 800;
    font-size: 0.95rem;
    padding: 15px 24px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    width: 100%;
    box-shadow: 0 4px 22px rgba(28,240,148,.38);
    transition: transform .2s, box-shadow .2s;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
    letter-spacing: 0.5px;
  }
  .enter-btn-login:hover {
    transform: scale(1.025);
    box-shadow: 0 8px 36px rgba(28,240,148,.6);
  }

  .social-btn-dark {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 14px;
    padding: 13px 24px;
    color: rgba(255,255,255,0.75);
    font-size: 0.88rem;
    font-family: Arial, sans-serif;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    box-sizing: border-box;
  }
  .social-btn-dark:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.22);
    transform: translateY(-2px);
  }

  .ring-deco {
    position: absolute;
    top: 50%; left: 50%;
    border-radius: 50%;
    border: 1px solid rgba(28,240,148,0.08);
    pointer-events: none;
    animation: ring-breathe 5s ease-in-out infinite;
  }
`;

function VinylDeco({
  size,
  accent,
  speed,
  reverse = false,
  style,
}: {
  size: number;
  accent: string;
  speed: string;
  reverse?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle,
          ${accent} 0%, ${accent} 17%,
          #141414 18%, #141414 24%,
          #222 25%, #141414 27%,
          #222 30%, #141414 32%,
          #222 35%, #141414 37%,
          #222 40%, #141414 42%,
          #222 46%, #141414 50%,
          #222 55%, #141414 60%,
          #222 66%, #141414 72%,
          #222 80%, #141414 86%,
          #1e1e1e 100%
        )`,
        boxShadow: `0 10px 50px rgba(0,0,0,0.85), 0 0 24px ${accent}28`,
        animation: `${reverse ? "spin-vinyl-rev" : "spin-vinyl"} ${speed} linear infinite`,
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: size * 0.13,
          height: size * 0.13,
          borderRadius: "50%",
          background: "#080808",
        }}
      />
    </div>
  );
}

const EQ_BARS = Array.from({ length: 22 }, (_, i) => ({
  delay: `${(i * 0.07).toFixed(2)}s`,
  duration: `${(0.38 + (i % 7) * 0.09).toFixed(2)}s`,
  height: 8 + (i % 8) * 5,
}));

const MUSIC_NOTES = ["♪", "♫", "♩", "♬", "♭", "♮"];

export default function LoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [mounted, setMounted]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) { setServerError("Correo o contraseña incorrectos"); return; }
    router.push("/inicio");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 40%, #16203a 0%, #080c18 65%, #000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{loginCss}</style>

      {/* Stars */}
      {Array.from({ length: 65 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: i % 5 === 0 ? "2px" : "1px",
            height: i % 5 === 0 ? "2px" : "1px",
            borderRadius: "50%",
            background: "white",
            opacity: 0.12 + ((i * 37) % 55) / 100,
            top: `${(i * 37 + 13) % 100}%`,
            left: `${(i * 53 + 7) % 100}%`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Decorative rings behind card */}
      <div className="ring-deco" style={{ width: "800px", height: "800px" }} />
      <div
        className="ring-deco"
        style={{
          width: "560px",
          height: "560px",
          animationDelay: "1.5s",
          borderColor: "rgba(28,240,148,0.05)",
        }}
      />

      {/* Floating vinyl — left */}
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "12%",
          opacity: 0.55,
          animation: "float-y-slow 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <VinylDeco size={170} accent="#1CF094" speed="9s" />
      </div>

      {/* Floating vinyl — right bottom */}
      <div
        style={{
          position: "absolute",
          right: "5%",
          bottom: "14%",
          opacity: 0.45,
          animation: "float-y-slow 7s ease-in-out infinite 1.5s",
          pointerEvents: "none",
        }}
      >
        <VinylDeco size={130} accent="#a3ff47" speed="7s" reverse />
      </div>

      {/* Floating vinyl — top right */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          top: "8%",
          opacity: 0.28,
          animation: "float-y 8s ease-in-out infinite 0.6s",
          pointerEvents: "none",
        }}
      >
        <VinylDeco size={95} accent="#6e2fff" speed="11s" />
      </div>

      {/* Floating vinyl — bottom left */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          bottom: "8%",
          opacity: 0.3,
          animation: "float-y 9s ease-in-out infinite 2s",
          pointerEvents: "none",
        }}
      >
        <VinylDeco size={105} accent="#ff6ef7" speed="8s" reverse />
      </div>

      {/* Floating music notes */}
      {MUSIC_NOTES.map((note, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${15 + i * 14}%`,
            bottom: "15%",
            color: "#1CF094",
            fontSize: `${1 + (i % 3) * 0.4}rem`,
            opacity: 0,
            pointerEvents: "none",
            animation: `note-float ${3.5 + i * 0.6}s ease-in-out ${i * 0.9}s infinite`,
            userSelect: "none",
          }}
        >
          {note}
        </div>
      ))}

      {/* Equalizer bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-end",
          gap: "3px",
          height: "70px",
          width: "340px",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      >
        {EQ_BARS.map((bar, bi) => (
          <div
            key={bi}
            style={{
              flex: 1,
              height: `${bar.height}px`,
              background: "linear-gradient(to top, #1CF094, #a3ff47)",
              borderRadius: "2px 2px 0 0",
              transformOrigin: "bottom",
              animation: `eq-wave ${bar.duration} ${bar.delay} ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial glow behind card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(28,240,148,0.055) 0%, transparent 68%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Login card ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "430px",
          margin: "20px",
          background: "rgba(10,12,22,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "28px",
          padding: "48px 42px 44px",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(28,240,148,0.07), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: mounted
            ? "card-in 0.75s cubic-bezier(0.34,1.56,0.64,1) both"
            : "none",
        }}
      >
        {/* Top neon accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "18%",
            right: "18%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #1CF094, #a3ff47, transparent)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 0 18px rgba(28,240,148,0.65)",
          }}
        />

        {/* Logo + heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            marginBottom: "34px",
          }}
        >
          <Link href="/">
            <img
              src="/images/logo.jpeg"
              alt="SpotiFake"
              style={{
                width: "88px",
                height: "88px",
                objectFit: "cover",
                borderRadius: "50%",
                animation:
                  "logo-in 0.8s cubic-bezier(0.34,1.56,0.64,1) both, glow-pulse 3.5s ease-in-out 0.8s infinite",
                cursor: "pointer",
              }}
            />
          </Link>

          <div
            style={{
              textAlign: "center",
              animation: mounted ? "fade-up 0.6s ease 0.25s both" : "none",
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "1.85rem",
                fontWeight: 900,
                fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1,
                textShadow: "0 2px 20px rgba(28,240,148,0.25)",
              }}
            >
              Inicia sesión
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.38)",
                fontSize: "0.82rem",
                margin: "8px 0 0",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.4px",
              }}
            >
              Bienvenido de nuevo a SpotiFake
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            animation: mounted ? "fade-up 0.6s ease 0.4s both" : "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.7rem",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              className="login-input"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.7rem",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-4px" }}>
            <a
              href="#"
              style={{
                color: "rgba(255,255,255,0.28)",
                fontSize: "0.75rem",
                textDecoration: "none",
                transition: "color 0.2s",
                fontFamily: "Arial, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#1CF094")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.28)")
              }
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {serverError && (
            <p style={{ color: "#ff4d4d", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", margin: "0", textAlign: "center" }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className="enter-btn-login"
            disabled={loading}
            style={{ marginTop: "4px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Entrando…" : "Entrar →"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            position: "relative",
            textAlign: "center",
            margin: "26px 0 18px",
            animation: mounted ? "fade-up 0.6s ease 0.55s both" : "none",
          }}
        >
          <span
            style={{
              position: "relative",
              zIndex: 1,
              padding: "0 14px",
              color: "rgba(255,255,255,0.22)",
              fontSize: "0.72rem",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "1.5px",
              background:
                "radial-gradient(ellipse at center, rgba(10,12,22,0.9) 60%, transparent 100%)",
            }}
          >
            O CONTINÚA CON
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              zIndex: 0,
            }}
          />
        </div>

        {/* Google */}
        <div
          style={{
            animation: mounted ? "fade-up 0.6s ease 0.65s both" : "none",
          }}
        >
          <button type="button" className="social-btn-dark" onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              });
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="18"
              height="18"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
              />
            </svg>
            Google
          </button>
        </div>

        {/* Register */}
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.82rem",
            marginTop: "26px",
            marginBottom: 0,
            fontFamily: "Arial, sans-serif",
            animation: mounted ? "fade-up 0.6s ease 0.75s both" : "none",
          }}
        >
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            style={{
              color: "#1CF094",
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
