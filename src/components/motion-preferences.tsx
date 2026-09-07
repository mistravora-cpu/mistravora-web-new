"use client";
import { useEffect, useState } from "react";
export function MotionPreferences() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const apply = () => {
      let choice = false;
      try { choice = localStorage.getItem("mistravora-motion") === "paused"; } catch {}
      document.documentElement.classList.toggle("motion-paused", choice);
      setPaused(choice);
      window.dispatchEvent(new Event("mistravora:motion"));
    };
    const timer = window.setTimeout(apply, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function toggle() {
    const next = !paused;
    setPaused(next);
    try { localStorage.setItem("mistravora-motion", next ? "paused" : "allowed"); } catch {}
    document.documentElement.classList.toggle("motion-paused", next);
    window.dispatchEvent(new Event("mistravora:motion"));
  }
  return <button type="button" aria-pressed={paused} onClick={toggle} className="text-left text-sm underline underline-offset-4">{paused ? "Resume animations" : "Pause animations"}</button>;
}
