"use client";
import Link from "next/link";

const footerCss = `
  @keyframes shimmer-footer {
    0%   { background-position: 0% center; }
    100% { background-position: 300% center; }
  }

  .footer-grad-border {
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #1CF094 25%, #5eead4 50%, #a3ff47 75%, transparent 100%);
    background-size: 300% auto;
    animation: shimmer-footer 4s linear infinite;
    opacity: 0.8;
  }

  .footer-link {
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    font-size: 0.82rem;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
    display: block;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .footer-link:hover { color: #1CF094; }

  .footer-col-title {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: linear-gradient(90deg, #1CF094 0%, #a3ff47 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 14px;
    font-family: var(--font-nunito), 'Trebuchet MS', sans-serif;
  }

  .footer-social-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(28,240,148,0.2);
    background: rgba(28,240,148,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    font-size: 0.85rem;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .footer-social-btn:hover {
    border-color: rgba(28,240,148,0.6);
    color: #1CF094;
    background: rgba(28,240,148,0.1);
  }
`;

const navLinks = [
  { label: "Inicio", href: "/inicio" },
  { label: "Discos", href: "/discos" },
  { label: "FAQ", href: "/faq" },
];

const accountLinks = [
  { label: "Iniciar sesión", href: "/usuario" },
  { label: "Registrarse", href: "/usuario" },
];

export default function Footer() {
  return (
    <footer style={{
      background: "radial-gradient(ellipse at 50% 0%, #0d1a2e 0%, #05080f 100%)",
    }}>
      <style>{footerCss}</style>
      <div className="footer-grad-border" />

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "52px 24px 28px",
        display: "flex",
        flexWrap: "wrap",
        gap: "48px",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}>

        {/* Marca */}
        <div style={{ minWidth: "200px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "18px" }}>
            <img
              src="/images/logo.jpeg"
              alt="SpotiFake"
              style={{
                width: "42px", height: "42px",
                borderRadius: "50%", objectFit: "cover",
                boxShadow: "0 0 18px rgba(28,240,148,0.3)",
              }}
            />
            <span style={{
              fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
              fontWeight: 900,
              fontSize: "1.2rem",
              background: "linear-gradient(90deg, #1CF094, #5eead4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              SpotiFake
            </span>
          </Link>
          <p style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.8rem",
            lineHeight: 1.7,
            maxWidth: "220px",
            margin: "0 0 22px",
            fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
          }}>
            Tu plataforma de música favorita.<br />Escucha, descubre, conecta.
          </p>
          {/* Redes sociales */}
          <div style={{ display: "flex", gap: "10px" }}>
            <a href="#" className="footer-social-btn" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" className="footer-social-btn" aria-label="Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="footer-social-btn" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Explorar */}
        <div>
          <p className="footer-col-title">Explorar</p>
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
          ))}
        </div>

        {/* Cuenta */}
        <div>
          <p className="footer-col-title">Cuenta</p>
          {accountLinks.map((l) => (
            <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p className="footer-col-title">Legal</p>
          <a href="#" className="footer-link">Privacidad</a>
          <a href="#" className="footer-link">Términos de uso</a>
          <a href="#" className="footer-link">Cookies</a>
        </div>

      </div>

      {/* Copyright */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 24px",
        textAlign: "center",
      }}>
        <p style={{
          color: "rgba(255,255,255,0.18)",
          fontSize: "0.74rem",
          fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
          margin: 0,
        }}>
          © 2025 SpotiFake · Ceci, Jess &amp; Isa · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
