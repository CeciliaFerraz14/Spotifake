"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const css = `
  .reset-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 14px;
    padding: 14px 16px;
    color: white;
    font-size: 0.9rem;
    font-family: Arial, sans-serif;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
    box-sizing: border-box;
  }
  .reset-input::placeholder { color: rgba(255,255,255,0.22); }
  .reset-input:focus {
    border-color: rgba(28,240,148,0.55);
    box-shadow: 0 0 0 3px rgba(28,240,148,0.1);
    background: rgba(28,240,148,0.04);
  }
  @keyframes shimmer-btn {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .reset-btn {
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
  }
  .reset-btn:hover { transform: scale(1.025); box-shadow: 0 8px 36px rgba(28,240,148,.6); }
  .reset-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const router = useRouter();

  const mismatch = confirm && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setTimeout(() => router.push("/inicio"), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 40%, #16203a 0%, #080c18 65%, #000 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{css}</style>
      <div style={{
        width: "100%", maxWidth: "400px", margin: "20px",
        background: "rgba(10,12,22,0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "28px",
        padding: "44px 40px",
        boxShadow: "0 30px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(28,240,148,0.07)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: "18%", right: "18%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #1CF094, #a3ff47, transparent)",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 0 18px rgba(28,240,148,0.65)",
        }} />

        <h1 style={{
          color: "white", fontSize: "1.6rem", fontWeight: 900,
          fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif",
          margin: "0 0 8px", textAlign: "center",
        }}>
          Nueva contraseña
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.35)", fontSize: "0.82rem",
          textAlign: "center", margin: "0 0 28px", fontFamily: "Arial, sans-serif",
        }}>
          Elige una contraseña nueva para tu cuenta
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              className="reset-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", fontFamily: "Arial, sans-serif", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="reset-input"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {mismatch && (
              <span style={{ color: "#ff4d4d", fontSize: "0.72rem", fontFamily: "Arial, sans-serif" }}>
                Las contraseñas no coinciden
              </span>
            )}
          </div>

          {error && (
            <p style={{ color: "#ff4d4d", fontSize: "0.78rem", fontFamily: "Arial, sans-serif", margin: 0, textAlign: "center" }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: "#1CF094", fontSize: "0.82rem", fontFamily: "Arial, sans-serif", margin: 0, textAlign: "center" }}>
              ¡Contraseña actualizada! Redirigiendo…
            </p>
          )}

          <button type="submit" className="reset-btn" disabled={!canSubmit} style={{ marginTop: "4px" }}>
            {loading ? "Guardando…" : "Guardar contraseña →"}
          </button>
        </form>
      </div>
    </div>
  );
}
