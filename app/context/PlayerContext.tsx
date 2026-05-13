"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export type Track = {
  title: string;
  artist: string;
  accent?: string;
  icon?: string;
  duration?: number;
  audioUrl?: string;
};

type PlayerCtx = {
  track: Track | null;
  queue: Track[];
  playing: boolean;
  progress: number;
  elapsed: number;
  volume: number;
  shuffle: boolean;
  playTrack: (t: Track, q?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
};

const Ctx = createContext<PlayerCtx | null>(null);
export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer must be inside PlayerProvider");
  return c;
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue,         setQueue]        = useState<Track[]>([]);
  const [idx,           setIdx]          = useState(0);
  const [playing,       setPlaying]      = useState(false);
  const [elapsed,       setElapsed]      = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume,        setVol]          = useState(70);
  const [shuffle,       setShuffle]      = useState(false);
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const loadedUrlRef  = useRef<string | null>(null);

  const track    = queue[idx] ?? null;
  const duration = audioDuration || track?.duration || 210;
  const progress = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;

  // Create audio element once on client
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  // Persistent timeupdate + loadedmetadata listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setElapsed(Math.floor(audio.currentTime));
    const onMeta = () => setAudioDuration(Math.floor(audio.duration));
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  // "ended" listener — needs current shuffle & queue length
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setElapsed(0);
      if (shuffle && queue.length > 1) {
        setIdx(i => { let r = i; while (r === i) r = Math.floor(Math.random() * queue.length); return r; });
      } else {
        setIdx(i => (i + 1 < queue.length ? i + 1 : 0));
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [shuffle, queue]);

  // Load new src when audioUrl changes; play or pause based on `playing`
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = track?.audioUrl ?? null;

    if (url !== loadedUrlRef.current) {
      loadedUrlRef.current = url;
      setElapsed(0);
      setAudioDuration(0);
      if (!url) { audio.pause(); audio.src = ""; return; }
      audio.src = url;
      audio.load();
    }

    if (playing && url) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [track?.audioUrl, playing]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playTrack = (t: Track, q?: Track[]) => {
    const newQueue = q ?? [t];
    const newIdx   = newQueue.findIndex(x => x.title === t.title && x.artist === t.artist);
    setQueue(newQueue);
    setIdx(newIdx >= 0 ? newIdx : 0);
    setElapsed(0);
    setPlaying(true);
  };

  const toggle = () => setPlaying(p => !p);

  const next = () => {
    setElapsed(0);
    if (shuffle && queue.length > 1) {
      setIdx(i => { let r = i; while (r === i) r = Math.floor(Math.random() * queue.length); return r; });
    } else {
      setIdx(i => (i + 1) % Math.max(queue.length, 1));
    }
  };

  const prev = () => {
    const audio = audioRef.current;
    if (elapsed > 3) {
      setElapsed(0);
      if (audio) audio.currentTime = 0;
      return;
    }
    setIdx(i => (i - 1 + Math.max(queue.length, 1)) % Math.max(queue.length, 1));
    setElapsed(0);
  };

  const seek = (pct: number) => {
    const audio = audioRef.current;
    const dur   = (audio && !isNaN(audio.duration) && audio.duration > 0) ? audio.duration : duration;
    const t     = (pct / 100) * dur;
    setElapsed(Math.round(t));
    if (audio && !isNaN(t)) audio.currentTime = t;
  };

  const setVolume    = (v: number) => setVol(Math.max(0, Math.min(100, v)));
  const toggleShuffle = () => setShuffle(s => !s);

  return (
    <Ctx.Provider value={{ track, queue, playing, progress, elapsed, volume, shuffle, playTrack, toggle, next, prev, seek, setVolume, toggleShuffle }}>
      {children}
    </Ctx.Provider>
  );
}
