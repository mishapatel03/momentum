"use client";

import { useEffect } from "react";

import { celebrate } from "@/lib/confetti";

/**
 * A small burst the first time today's missions are all done (per device).
 * Browser storage is fine here: it's a nicety, and it fails silently if blocked.
 */
export function DayCompleteBurst({ day }: { day: string }) {
  useEffect(() => {
    const key = `momentum:day-complete:${day}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      return; // storage blocked: skip the burst rather than repeat it on every visit
    }
    void celebrate("small");
  }, [day]);

  return null;
}
