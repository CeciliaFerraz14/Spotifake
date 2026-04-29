"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MusicPlayer from "./MusicPlayer";

export default function ConditionalPlayer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loggedIn) return null;
  return (
    <>
      <style>{`main { padding-bottom: 72px; }`}</style>
      <MusicPlayer />
    </>
  );
}
