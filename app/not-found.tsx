"use client";
import Link from "next/link";

const css = `
  @keyframes spin-broken {
    0%   { transform: rotate(0deg); }
    10%  { transform: rotate(12deg); }
    20%  { transform: rotate(-8deg); }
    30%  { transform: rotate(6deg); }
    40%  { transform: rotate(-4deg); }
    50%  { transform: rotate(3deg); }
    60%  { transform: rotate(-2deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes float-404 {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }

  @keyframes glitch-text {
    0%   { clip-path: inset(0 0 100% 0); transform: translateX(0); }
    10%  { clip-path: inset(30% 0 50% 0); transform: translateX(-4px); }
    20%  { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
    30%  { clip-path: inset(10% 0 70% 0); transform: translateX(-2px); }
    40%  { clip-path: inset(80% 0 5%  0); transform: translateX(3px); }
    50%  { clip-path: inset(0  0 0   0); transform: translateX(0); }
    100% { clip-path: inset(0  0 0   0); transform: translateX(0); }
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes scratch {
    0%,100% { opacity: 0; }
    48%, 52% { opacity: 1; }
  }

  @keyframes eq-404 {
    0%,100% { height: 6px; }
    25%     { height: 18px; }
    50%     { height: 10px; }
    75%     { height: 22px; }
  }

  .nf-vinyl {
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle,
      #1CF094 0%, #1CF094 12%,
      #0a0f1a 13%, #0a0f1a 22%,
      #141414 25%, #0a0f1a 30%,
      #1a1a1a 36%, #0a0f1a 44%,
      #1a1a1a 52%, #0a0f1a 62%,
      #111 100%
    );
    box-shadow: 0 0 60px rgba(28,240,148,0.2), 0 0 120px rgba(28,240,148,0.06);
    animation: spin-broken 2.4s ease-in-out infinite;
    position: relative;
    flex-shrink: 0;
  }

  .nf-vinyl::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 24px; height: 24px;
    border-radius: 50%;
    background: #060910;
    border: 2px solid rgba(28,240,148,0.3);
  }

  .nf-scratch {
    position: absolute;
    top: 20%; left: 18%;
    width: 130%; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    transform: rotate(-38deg);
    transform-origin: left center;
    animation: scratch 2.4s ease-in-out infinite;
    pointer-events: none;
  }

  .nf-404 {
    font-family: var(--font-anton), 'Impact', sans-serif;
    font-size: clamp(7rem, 18vw, 13rem);
    line-height: 1;
    background: linear-gradient(135deg, #1CF094 0%, #5eead4 40%, #a3ff47 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: float-404 3.5s ease-in-out infinite;
    position: relative;
    letter-spacing: -4px;
  }

  .nf-404::before {
    content: "404";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #ff6ef7 0%, #6e2fff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: glitch-text 4s ease-in-out infinite;
    pointer-events: none;
  }

  .nf-title {
    font-family: var(--font-nunito), sans-serif;
    font-weight: 900;
    font-size: clamp(1.3rem, 3vw, 1.8rem);
    color: white;
    margin: 0 0 12px;
    animation: fade-up 0.6s ease 0.2s both;
  }

  .nf-sub {
    font-family: var(--font-nunito), sans-serif;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.4);
    margin: 0 0 36px;
    line-height: 1.6;
    animation: fade-up 0.6s ease 0.35s both;
  }

  .nf-btn-primary {
    background: linear-gradient(135deg, #1CF094, #5eead4);
    border: none; border-radius: 50px;
    padding: 14px 34px;
    color: #061210; font-weight: 900;
    font-family: var(--font-nunito), sans-serif;
    font-size: 0.95rem;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(28,240,148,0.35);
    display: inline-block;
    animation: fade-up 0.6s ease 0.5s both;
  }
  .nf-btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 32px rgba(28,240,148,0.55);
  }

  .nf-btn-secondary {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 13px 28px;
    color: rgba(255,255,255,0.7); font-weight: 700;
    font-family: var(--font-nunito), sans-serif;
    font-size: 0.95rem;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    display: inline-block;
    animation: fade-up 0.6s ease 0.6s both;
  }
  .nf-btn-secondary:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.25);
    color: white;
  }

  .nf-eq {
    display: flex; align-items: flex-end; gap: 3px;
    height: 24px;
  }
  .nf-eq span {
    width: 3px; border-radius: 2px;
    background: linear-gradient(to top, #1CF094, #a3ff47);
    animation: eq-404 0.8s ease-in-out infinite;
  }
  .nf-eq span:nth-child(2) { animation-delay: 0.15s; }
  .nf-eq span:nth-child(3) { animation-delay: 0.3s; }
  .nf-eq span:nth-child(4) { animation-delay: 0.1s; }
  .nf-eq span:nth-child(5) { animation-delay: 0.25s; }
`;

export default function NotFound() {
  return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 30% 20%, #0d2a1a 0%, #060910 55%, #0a0518 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        gap: "0",
      }}>

        {/* Vinilo roto */}
        <div style={{ position: "relative", marginBottom: "40px", animation: "fade-up 0.5s ease both" }}>
          <div className="nf-vinyl">
            <div className="nf-scratch" />
          </div>
        </div>

        {/* 404 */}
        <div className="nf-404">404</div>

        {/* Texto */}
        <h1 className="nf-title" style={{ marginTop: "16px" }}>
          Esta pista no existe
        </h1>
        <p className="nf-sub">
          La página que buscas se perdió en el shuffle.<br />
          Quizás fue eliminada o nunca estuvo aquí.
        </p>

        {/* Botones */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/inicio" className="nf-btn-primary">
            Volver al inicio
          </Link>
          <Link href="/playlists" className="nf-btn-secondary">
            Mis playlists
          </Link>
        </div>

        {/* Ecualizador decorativo */}
        <div style={{ marginTop: "52px", opacity: 0.4 }}>
          <div className="nf-eq">
            <span /><span /><span /><span /><span />
          </div>
        </div>

      </div>
    </>
  );
}
