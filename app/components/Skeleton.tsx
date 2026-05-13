"use client";

const skeletonCss = `
  @keyframes sk-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .sk {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.04) 75%
    );
    background-size: 800px 100%;
    animation: sk-shimmer 1.6s infinite linear;
    border-radius: 8px;
  }
`;

export function SkeletonStyles() {
  return <style>{skeletonCss}</style>;
}

export function SkeletonBox({ width = "100%", height = "16px", radius = "8px", style = {} }: {
  width?: string; height?: string; radius?: string; style?: React.CSSProperties;
}) {
  return (
    <div className="sk" style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }} />
  );
}

/* Skeleton de card de álbum */
export function SkeletonAlbumCard() {
  return (
    <div style={{
      width: "180px", background: "rgba(255,255,255,0.03)",
      borderRadius: "16px", padding: "14px", display: "flex",
      flexDirection: "column", gap: "10px",
    }}>
      <SkeletonBox width="100%" height="150px" radius="12px" />
      <SkeletonBox width="70%" height="14px" />
      <SkeletonBox width="45%" height="11px" />
    </div>
  );
}

/* Skeleton de fila de canción */
export function SkeletonTrackRow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "10px 8px",
    }}>
      <SkeletonBox width="36px" height="36px" radius="8px" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "7px" }}>
        <SkeletonBox width="55%" height="13px" />
        <SkeletonBox width="35%" height="10px" />
      </div>
      <SkeletonBox width="36px" height="11px" />
    </div>
  );
}

/* Skeleton de artista (círculo + nombre) */
export function SkeletonArtistCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "90px" }}>
      <SkeletonBox width="72px" height="72px" radius="50%" />
      <SkeletonBox width="64px" height="11px" />
    </div>
  );
}
