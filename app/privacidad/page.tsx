export const metadata = { title: "Privacidad · SpotiFake" };

const sections = [
  {
    title: "Datos que recopilamos",
    content: "Recopilamos tu nombre, correo electrónico y foto de perfil al registrarte. También almacenamos tus playlists, canciones favoritas y preferencias de reproducción para ofrecerte una experiencia personalizada.",
  },
  {
    title: "Cómo usamos tu información",
    content: "Usamos tus datos únicamente para hacer funcionar SpotiFake: mostrarte tu biblioteca musical, guardar tus playlists y personalizar tu experiencia. No vendemos ni compartimos tu información con terceros.",
  },
  {
    title: "Almacenamiento y seguridad",
    content: "Tus datos se almacenan de forma segura en Supabase con cifrado en tránsito y en reposo. Utilizamos autenticación segura mediante email/contraseña y OAuth con Google.",
  },
  {
    title: "Tus derechos",
    content: "Podés acceder, modificar o eliminar tu cuenta y datos en cualquier momento desde la sección de Configuración. Si tenés alguna consulta, contactanos a través de nuestra página.",
  },
  {
    title: "Cookies",
    content: "Usamos cookies de sesión estrictamente necesarias para mantenerte autenticado. No utilizamos cookies de seguimiento ni publicidad.",
  },
];

export default function PrivacidadPage() {
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
        Política de privacidad
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
