export const metadata = { title: "Cookies · SpotiFake" };

const sections = [
  {
    title: "¿Qué son las cookies?",
    content: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mantenga tu sesión activa.",
  },
  {
    title: "Cookies que usamos",
    content: "SpotiFake utiliza únicamente cookies de sesión estrictamente necesarias para mantenerte autenticado mientras navegas. Sin estas cookies, no podríamos recordar que iniciaste sesión.",
  },
  {
    title: "Cookies de terceros",
    content: "Si inicias sesión con Google, este proveedor puede establecer sus propias cookies según su política de privacidad. No tenemos control sobre estas cookies.",
  },
  {
    title: "Cómo gestionar las cookies",
    content: "Se puede configurar tu navegador para rechazar cookies o para que te avise cuando se envíe una. Ten en cuenta que deshabilitar las cookies puede afectar el funcionamiento del servicio, incluyendo la posibilidad de iniciar sesión.",
  },
];

export default function CookiesPage() {
  return (
    <div style={{
      maxWidth: "740px", margin: "0 auto",
      padding: "72px 24px 120px",
    }}>
      <h1 style={{
        fontFamily: "var(--font-anton), sans-serif",
        fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
        background: "linear-gradient(135deg, #1CF094, #5eead4)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        marginBottom: "8px", lineHeight: 1,
      }}>
        Política de cookies
      </h1>
      <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.85rem", marginBottom: "48px" }}>
        Última actualización: mayo 2026
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {sections.map((s) => (
          <div key={s.title} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px", padding: "24px 28px",
          }}>
            <h2 style={{
              fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800,
              fontSize: "1rem", color: "#1CF094", margin: "0 0 10px",
            }}>{s.title}</h2>
            <p style={{
              fontFamily: "var(--font-nunito), sans-serif", fontSize: "0.9rem",
              color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0,
            }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
