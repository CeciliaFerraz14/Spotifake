import { Track } from "@/app/context/PlayerContext";

export type Playlist = {
  id: number;
  nombre: string;
  canciones: number;
  accent: string;
  bg: string;
  tracks: Track[];
};

export const PLAYLISTS: Playlist[] = [
  {
    id: 1, nombre: "Mis favoritas", canciones: 3, accent: "#1CF094", bg: "linear-gradient(145deg,#001a00,#003a0a)",
    tracks: [
      { title: "Blinding Lights",  artist: "The Weeknd",    accent: "#1CF094", duration: 200 },
      { title: "Stay",             artist: "The Kid LAROI", accent: "#1CF094", duration: 141 },
      { title: "As It Was",        artist: "Harry Styles",  accent: "#1CF094", duration: 167 },
    ],
  },
  {
    id: 2, nombre: "Para estudiar", canciones: 3, accent: "#00d4ff", bg: "linear-gradient(145deg,#001520,#002a3a)",
    tracks: [
      { title: "Clair de Lune",    artist: "Debussy",       accent: "#00d4ff", duration: 300 },
      { title: "Experience",       artist: "Ludovico",      accent: "#00d4ff", duration: 246 },
      { title: "Comptine",         artist: "Yann Tiersen",  accent: "#00d4ff", duration: 214 },
    ],
  },
  {
    id: 3, nombre: "Gym", canciones: 3, accent: "#6e2fff", bg: "linear-gradient(145deg,#0d0020,#1a0040)",
    tracks: [
      { title: "HUMBLE.",          artist: "Kendrick Lamar", accent: "#6e2fff", duration: 177 },
      { title: "Power",            artist: "Kanye West",     accent: "#6e2fff", duration: 292 },
      { title: "Till I Collapse",  artist: "Eminem",         accent: "#6e2fff", duration: 297 },
    ],
  },
  {
    id: 4, nombre: "Viajes", canciones: 3, accent: "#ff6ef7", bg: "linear-gradient(145deg,#1a0020,#35003a)",
    tracks: [
      { title: "Hotel California", artist: "Eagles",        accent: "#ff6ef7", duration: 391 },
      { title: "Africa",           artist: "Toto",          accent: "#ff6ef7", duration: 295 },
      { title: "Fast Car",         artist: "Tracy Chapman", accent: "#ff6ef7", duration: 256 },
    ],
  },
];
