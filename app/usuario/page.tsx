"use client";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // lógica de login aquí
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col gap-7">

        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3">
          <a href="/">
            <img src="/images/logo.png" alt="SpotiFake" width={160} height={160} />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Inicia sesión</h1>
          <p className="text-sm text-gray-500">Bienvenido de nuevo a SpotiFake</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2e18f]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2e18f]"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#c2e18f] text-gray-900 font-semibold py-3 rounded-xl hover:brightness-95 transition"
          >
            Entrar
          </button>
        </form>

        {/* Divisor */}
        <div className="relative text-center">
          <span className="relative z-10 bg-white px-3 text-xs text-gray-400">o continúa con</span>
          <div className="absolute top-1/2 left-0 h-px w-full bg-gray-200 -z-0"></div>
        </div>

        {/* Botones sociales */}
        <div className="flex flex-col gap-3">
<button
            type="button"
            className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
            </svg>
            Google
          </button>
        </div>

        {/* Registro */}
        <p className="text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <a href="#" className="text-gray-700 font-medium hover:underline">
            Regístrate
          </a>
        </p>

      </div>
    </div>
  );
}
