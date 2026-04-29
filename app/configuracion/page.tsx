"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const css = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .cfg-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.11); border-radius: 12px;
    padding: 13px 16px; color: white; font-size: 0.88rem;
    font-family: Arial, sans-serif; outline: none;
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
    box-sizing: border-box;
  }
  .cfg-input::placeholder { color: rgba(255,255,255,0.22); }
  .cfg-input:focus {
    border-color: rgba(28,240,148,0.55);
    box-shadow: 0 0 0 3px rgba(28,240,148,0.1);
    background: rgba(28,240,148,0.04);
  }

  .cfg-btn-primary {
    background: linear-gradient(90deg, #1CF094 0%, #5eead4 50%, #1CF094 100%);
    background-size: 200% auto; animation: shimmer-btn 3s linear infinite;
    color: #0a0f1a; font-weight: 800; font-size: 0.85rem;
    padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer;
    font-family: var(--font-nunito), sans-serif; transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 18px rgba(28,240,148,.35);
  }
  .cfg-btn-primary:hover { transform: scale(1.03); box-shadow: 0 6px 28px rgba(28,240,148,.55); }
  .cfg-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; animation: none; background: #1CF094; }

  .cfg-btn-danger {
    background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.35);
    color: #ff6b6b; font-weight: 700; font-size: 0.85rem;
    padding: 12px 24px; border-radius: 12px; cursor: pointer;
    font-family: var(--font-nunito), sans-serif; transition: background .2s, border-color .2s, transform .2s;
  }
  .cfg-btn-danger:hover { background: rgba(255,60,60,0.16); border-color: rgba(255,60,60,0.6); transform: scale(1.02); }

  .cfg-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 28px 30px;
    margin-bottom: 20px;
  }

  .cfg-label {
    color: rgba(255,255,255,0.42); font-size: 0.68rem;
    font-family: Arial, sans-serif; letter-spacing: 1.3px;
    text-transform: uppercase; margin-bottom: 7px; display: block;
  }

  .cfg-section-title {
    color: white; font-weight: 900; font-size: 1rem;
    font-family: var(--font-nunito), sans-serif;
    margin: 0 0 20px; display: flex; align-items: center; gap: 10px;
  }
  .cfg-section-title::after {
    content: ""; flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(28,240,148,0.2), transparent);
  }

  .avatar-ring {
    width: 90px; height: 90px; border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(28,240,148,0.4);
    box-shadow: 0 0 20px rgba(28,240,148,0.2);
  }
  .avatar-placeholder {
    width: 90px; height: 90px; border-radius: 50%;
    background: linear-gradient(135deg, #1CF094, #5eead4);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 900; color: #0a0f1a;
    font-family: var(--font-nunito), sans-serif;
    border: 2px solid rgba(28,240,148,0.4);
    flex-shrink: 0;
  }

  .msg-ok  { color: #1CF094; font-size: 0.78rem; font-family: Arial, sans-serif; margin-top: 8px; }
  .msg-err { color: #ff6b6b; font-size: 0.78rem; font-family: Arial, sans-serif; margin-top: 8px; }
`;

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="cfg-card">
      <h2 className="cfg-section-title"><span>{icon}</span> {title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label className="cfg-label">{label}</label>
      {children}
    </div>
  );
}

function Feedback({ ok, err }: { ok?: string; err?: string }) {
  if (ok)  return <p className="msg-ok">✓ {ok}</p>;
  if (err) return <p className="msg-err">✕ {err}</p>;
  return null;
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser]       = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Perfil
  const [name, setName]         = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ ok: "", err: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Email
  const [email, setEmail]   = useState("");
  const [emailMsg, setEmailMsg] = useState({ ok: "", err: "" });
  const [savingEmail, setSavingEmail] = useState(false);

  // Contraseña
  const [pw, setPw]         = useState("");
  const [pw2, setPw2]       = useState("");
  const [pwMsg, setPwMsg]   = useState({ ok: "", err: "" });
  const [savingPw, setSavingPw] = useState(false);

  // Borrar cuenta
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteMsg, setDeleteMsg]         = useState({ ok: "", err: "" });
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.replace("/usuario"); return; }
      setUser(u);
      setName(u.user_metadata?.full_name || u.user_metadata?.name || "");
      setEmail(u.email || "");
      setAvatarUrl(u.user_metadata?.avatar_url || null);

    })();
  }, []);

  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setProfileMsg({ ok: "", err: "" });
    const ext  = file.name.split(".").pop();
    const path = `${user.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setProfileMsg({ ok: "", err: upErr.message }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;
    setAvatarUrl(urlWithBust);
    setUploading(false);
  };

  /* ── Guardar perfil ── */
  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg({ ok: "", err: "" });
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, avatar_url: avatarUrl?.split("?")[0] },
    });
    setSavingProfile(false);
    if (error) setProfileMsg({ ok: "", err: error.message });
    else       setProfileMsg({ ok: "Perfil actualizado", err: "" });
  };

  /* ── Guardar email ── */
  const saveEmail = async () => {
    setSavingEmail(true);
    setEmailMsg({ ok: "", err: "" });
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) setEmailMsg({ ok: "", err: error.message });
    else       setEmailMsg({ ok: "Revisa tu nuevo correo para confirmar el cambio", err: "" });
  };

  /* ── Guardar contraseña ── */
  const savePassword = async () => {
    if (pw !== pw2) { setPwMsg({ ok: "", err: "Las contraseñas no coinciden" }); return; }
    if (pw.length < 6) { setPwMsg({ ok: "", err: "Mínimo 6 caracteres" }); return; }
    setSavingPw(true);
    setPwMsg({ ok: "", err: "" });
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) setPwMsg({ ok: "", err: error.message });
    else { setPwMsg({ ok: "Contraseña actualizada", err: "" }); setPw(""); setPw2(""); }
  };

  /* ── Borrar cuenta ── */
  const deleteAccount = async () => {
    if (deleteConfirm !== "BORRAR") { setDeleteMsg({ ok: "", err: 'Escribe BORRAR para confirmar' }); return; }
    setDeleting(true);
    setDeleteMsg({ ok: "", err: "" });
    const res = await fetch("/api/delete-account", { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json();
      setDeleteMsg({ ok: "", err: error || "Error al borrar la cuenta" });
      setDeleting(false); return;
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #060910 60%, #000 100%)",
    }}>
      <style>{css}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Cabecera */}
        <div style={{
          marginBottom: "36px",
          animation: mounted ? "fade-in-up 0.5s ease both" : "none",
        }}>
          <h1 style={{
            margin: 0, color: "white", fontSize: "1.8rem", fontWeight: 900,
            fontFamily: "var(--font-nunito), sans-serif", letterSpacing: "-0.5px",
          }}>
            Configuración
          </h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", margin: "6px 0 0", fontFamily: "Arial, sans-serif" }}>
            Gestiona tu cuenta y preferencias
          </p>
        </div>

        {/* ── Perfil ── */}
        <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.05s both" : "none" }}>
          <Section title="Perfil" icon="👤">
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "22px" }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="avatar-ring" />
                : <div className="avatar-placeholder">{initials}</div>
              }
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    background: "rgba(28,240,148,0.08)", border: "1px solid rgba(28,240,148,0.25)",
                    color: "#1CF094", borderRadius: "10px", padding: "9px 18px",
                    fontSize: "0.82rem", fontFamily: "var(--font-nunito), sans-serif",
                    fontWeight: 700, cursor: "pointer", transition: "background .2s",
                  }}
                >
                  {uploading ? "Subiendo…" : "Cambiar foto"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", margin: "6px 0 0", fontFamily: "Arial, sans-serif" }}>
                  JPG, PNG o GIF · Máx 2 MB
                </p>
              </div>
            </div>

            <Field label="Nombre">
              <input className="cfg-input" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" />
            </Field>

            <button className="cfg-btn-primary" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </button>
            <Feedback ok={profileMsg.ok} err={profileMsg.err} />
          </Section>
        </div>

        {/* ── Cuenta ── */}
        <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.1s both" : "none" }}>
          <Section title="Cuenta" icon="✉️">
            <Field label="Correo electrónico">
              <input className="cfg-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <button className="cfg-btn-primary" onClick={saveEmail} disabled={savingEmail}>
              {savingEmail ? "Guardando…" : "Actualizar correo"}
            </button>
            <Feedback ok={emailMsg.ok} err={emailMsg.err} />
          </Section>
        </div>

        {/* ── Contraseña ── */}
        <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.15s both" : "none" }}>
          <Section title="Contraseña" icon="🔒">
            <Field label="Nueva contraseña">
              <input className="cfg-input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </Field>
            <Field label="Confirmar contraseña">
              <input className="cfg-input" type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repite la contraseña" />
            </Field>
            <button className="cfg-btn-primary" onClick={savePassword} disabled={savingPw || !pw}>
              {savingPw ? "Guardando…" : "Cambiar contraseña"}
            </button>
            <Feedback ok={pwMsg.ok} err={pwMsg.err} />
          </Section>
        </div>

        {/* ── Zona de peligro ── */}
        <div style={{ animation: mounted ? "fade-in-up 0.5s ease 0.25s both" : "none" }}>
          <div className="cfg-card" style={{ borderColor: "rgba(255,60,60,0.2)" }}>
            <h2 className="cfg-section-title" style={{ color: "#ff6b6b" }}>
              <span>⚠️</span> Zona de peligro
              <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,60,60,0.25), transparent)", display: "block" }} />
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontFamily: "Arial, sans-serif", marginBottom: "16px", lineHeight: 1.6 }}>
              Esta acción es permanente e irreversible. Se eliminarán todos tus datos, playlists y configuraciones.
            </p>
            <Field label='Escribe "BORRAR" para confirmar'>
              <input
                className="cfg-input" value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="BORRAR"
                style={{ borderColor: deleteConfirm === "BORRAR" ? "rgba(255,60,60,0.5)" : undefined }}
              />
            </Field>
            <button
              className="cfg-btn-danger"
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? "Borrando cuenta…" : "Borrar mi cuenta"}
            </button>
            <Feedback ok={deleteMsg.ok} err={deleteMsg.err} />
          </div>
        </div>

      </div>
    </div>
  );
}
