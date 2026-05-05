import { Track } from "@/app/context/PlayerContext";

export type PlaylistPublica = {
  id: number;
  name: string;
  songs: number;
  accent: string;
  bg: string;
  img: string;
  curator: string;
  tracks: Track[];
};

export const PLAYLISTS_PUBLICAS: PlaylistPublica[] = [
  {
    id: 1, name: "DARK MATTER", songs: 4, accent: "#1CF094",
    bg: "linear-gradient(145deg,#001a00,#003a0a)", img: "/images/playñist1.jpg",
    curator: "SpotiFake Editorial",
    tracks: [
      { title: "Paranoid Android",  artist: "Radiohead",       accent: "#1CF094", duration: 383 },
      { title: "Karma Police",      artist: "Radiohead",       accent: "#1CF094", duration: 264 },
      { title: "High and Dry",      artist: "Radiohead",       accent: "#1CF094", duration: 257 },
      { title: "Fake Plastic Trees",artist: "Radiohead",       accent: "#1CF094", duration: 290 },
    ],
  },
  {
    id: 2, name: "NIGHT DRIVE", songs: 4, accent: "#6e2fff",
    bg: "linear-gradient(145deg,#0d0020,#1a0040)", img: "/images/playlist2.jpg",
    curator: "SpotiFake Editorial",
    tracks: [
      { title: "Take Me Out",       artist: "Franz Ferdinand", accent: "#6e2fff", duration: 237 },
      { title: "Last Nite",         artist: "The Strokes",     accent: "#6e2fff", duration: 194 },
      { title: "Reptilia",          artist: "The Strokes",     accent: "#6e2fff", duration: 224 },
      { title: "Do I Wanna Know?",  artist: "Arctic Monkeys",  accent: "#6e2fff", duration: 272 },
    ],
  },
  {
    id: 3, name: "CHILL WAVE", songs: 4, accent: "#00d4ff",
    bg: "linear-gradient(145deg,#001520,#002a3a)", img: "/images/playlist3.jpg",
    curator: "SpotiFake Editorial",
    tracks: [
      { title: "Holocene",          artist: "Bon Iver",        accent: "#00d4ff", duration: 357 },
      { title: "Skinny Love",       artist: "Bon Iver",        accent: "#00d4ff", duration: 220 },
      { title: "Re: Stacks",        artist: "Bon Iver",        accent: "#00d4ff", duration: 340 },
      { title: "Flume",             artist: "Bon Iver",        accent: "#00d4ff", duration: 235 },
    ],
  },
  {
    id: 4, name: "EUPHORIA", songs: 4, accent: "#ff6ef7",
    bg: "linear-gradient(145deg,#1a0020,#35003a)", img: "/images/Portada4.jpg",
    curator: "SpotiFake Editorial",
    tracks: [
      { title: "Blinding Lights",   artist: "The Weeknd",      accent: "#ff6ef7", duration: 200 },
      { title: "Save Your Tears",   artist: "The Weeknd",      accent: "#ff6ef7", duration: 215 },
      { title: "Starboy",           artist: "The Weeknd",      accent: "#ff6ef7", duration: 230 },
      { title: "Die For You",       artist: "The Weeknd",      accent: "#ff6ef7", duration: 260 },
    ],
  },
  {
    id: 5, name: "SOLAR FLARE", songs: 4, accent: "#ff9a00",
    bg: "linear-gradient(145deg,#1a0800,#3a1800)", img: "/images/playlisst5.jpg",
    curator: "SpotiFake Editorial",
    tracks: [
      { title: "Mr. Brightside",    artist: "The Killers",     accent: "#ff9a00", duration: 222 },
      { title: "Somebody Told Me",  artist: "The Killers",     accent: "#ff9a00", duration: 197 },
      { title: "All These Things",  artist: "The Killers",     accent: "#ff9a00", duration: 247 },
      { title: "Human",             artist: "The Killers",     accent: "#ff9a00", duration: 245 },
    ],
  },
];
