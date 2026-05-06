"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const ACCENTS = ["#1CF094","#6e2fff","#ff6ef7","#00d4ff","#ff9a00","#a3ff47","#ff3c3c"];

type Album = { id: string; titulo: string; año: string; canciones: number; artista: string; artista_id: string };

export default function DiscosPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/albums")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAlbums(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="nook-bg min-h-screen py-16 px-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        <h2
          className="text-4xl font-black text-[#2d5a40] text-left"
          style={{ fontFamily: "var(--font-nunito), 'Trebuchet MS', sans-serif", letterSpacing: "-0.5px" }}
        >
          Álbumes
        </h2>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-nunito), sans-serif" }}>Cargando…</p>
        ) : (
          <div className="flex flex-row flex-wrap gap-8 items-start">
            {albums.map((album, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const año = album.año ? new Date(album.año).getFullYear() : "";
              return (
                <div
                  key={album.id}
                  className="album-card flex-1 bg-white rounded-2xl p-4 flex flex-col gap-4 cursor-pointer"
                  style={{ minWidth: "200px", maxWidth: "260px" }}
                  onClick={() => router.push(`/artistas/${toSlug(album.artista)}`)}
                >
                  <div
                    className="album-img-wrap w-full"
                    style={{
                      aspectRatio: "1 / 1",
                      background: `linear-gradient(135deg, ${accent}88 0%, ${accent}33 100%)`,
                      borderRadius: "12px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>♫</span>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px",
                      color: "rgba(255,255,255,0.85)", textTransform: "uppercase",
                      fontFamily: "var(--font-nunito), sans-serif",
                    }}>
                      {año}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-snug"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif", marginBottom: "4px" }}>
                      {album.titulo}
                    </p>
                    <p style={{ color: "#555", fontSize: "0.78rem", fontFamily: "Arial, sans-serif" }}>
                      {album.artista}
                    </p>
                    <p style={{ color: "#aaa", fontSize: "0.72rem", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                      {album.canciones} {album.canciones === 1 ? "canción" : "canciones"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
