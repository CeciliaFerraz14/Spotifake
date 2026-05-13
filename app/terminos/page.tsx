export const metadata = { title: "Términos de uso · SpotiFake" };

const sections = [
  {
    title: "Aceptación de los términos",
    content: "Al usar SpotiFake aceptas estos términos. Si no estás de acuerdo con alguna parte, te pedimos que no uses el servicio.",
  },
  {
    title: "Uso del servicio",
    content: "SpotiFake es una plataforma de música para uso personal. No está permitido usar el servicio para fines comerciales, distribuir contenido sin autorización ni intentar acceder a datos de otros usuarios.",
  },
  {
    title: "Cuenta de usuario",
    content: "El usuario es responsable de mantener la confidencialidad de tu cuenta y contraseña. Notificanos inmediatamente si sospechas de un acceso no autorizado.",
  },
  {
    title: "Contenido",
    content: "El contenido musical disponible en SpotiFake es de carácter demostrativo. SpotiFake no se responsabiliza por la disponibilidad continua de canciones o álbumes específicos.",
  },
  {
    title: "Modificaciones",
    content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigencia al ser publicados. El uso continuado del servicio implica la aceptación de los nuevos términos.",
  },
  {
    title: "Limitación de responsabilidad",
    content: "SpotiFake se provee 'tal cual'. No garantizamos disponibilidad ininterrumpida del servicio y no somos responsables por pérdidas de datos o interrupciones del servicio.",
  },
];

export default function TerminosPage() {
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
        Términos de uso
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
