"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

export type Track = {
  title: string;
  artist: string;
  accent?: string;
  icon?: string;
  duration?: number; // segundos
};

type PlayerCtx = {
  track: Track | null;
  queue: Track[];
  playing: boolean;
  progress: number;  // 0–100
  elapsed: number;   // segundos
  volume: number;    // 0–100
  playTrack: (t: Track, q?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  setVolume: (v: number) => void;
};

const Ctx = createContext<PlayerCtx | null>(null);
export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer must be inside PlayerProvider");
  return c;
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue,    setQueue]   = useState<Track[]>([]);
  const [idx,      setIdx]     = useState(0);
  const [playing,  setPlaying] = useState(false);
  const [elapsed,  setElapsed] = useState(0);
  const [volume,   setVol]     = useState(70);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = queue[idx] ?? null;
  const duration = track?.duration ?? 210;
  const progress = duration > 0 ? Math.min((elapsed / duration) * 100, 100) : 0;

  const clearTick = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= duration - 1) {
          clearTick();
          // auto-siguiente
          setIdx(i => i + 1 < queue.length ? i + 1 : 0);
          return 0;
        }
        return e + 1;
      });
    }, 1000);
  }, [duration, queue.length]);

  useEffect(() => {
    if (playing) startTick();
    else clearTick();
    return clearTick;
  }, [playing, startTick]);

  // reset elapsed cuando cambia el track
  useEffect(() => { setElapsed(0); }, [idx]);

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
    setIdx(i => (i + 1) % Math.max(queue.length, 1));
    setElapsed(0);
  };

  const prev = () => {
    if (elapsed > 3) { setElapsed(0); return; }
    setIdx(i => (i - 1 + Math.max(queue.length, 1)) % Math.max(queue.length, 1));
    setElapsed(0);
  };

  const seek = (pct: number) => setElapsed(Math.round((pct / 100) * duration));
  const setVolume = (v: number) => setVol(Math.max(0, Math.min(100, v)));

  return (
    <Ctx.Provider value={{ track, queue, playing, progress, elapsed, volume, playTrack, toggle, next, prev, seek, setVolume }}>
      {children}
    </Ctx.Provider>
  );
}
