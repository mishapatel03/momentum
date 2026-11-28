"use client";

import type { Options } from "canvas-confetti";

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e"];

/**
 * Confetti, loaded only when needed (keeps it out of the initial bundle).
 * Users who prefer reduced motion get none: callers still show a message.
 */
export async function celebrate(size: "small" | "big"): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const { default: confetti } = await import("canvas-confetti");
  const base: Options = { colors: COLORS, disableForReducedMotion: true, zIndex: 100 };

  if (size === "small") {
    await confetti({
      ...base,
      particleCount: 60,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.7 },
    });
    return;
  }

  // The big one: two side cannons for ~2.5s, then a burst from the middle.
  const end = Date.now() + 2500;
  const frame = () => {
    void confetti({ ...base, particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
    void confetti({ ...base, particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  await confetti({
    ...base,
    particleCount: 160,
    spread: 110,
    startVelocity: 45,
    origin: { y: 0.6 },
  });
}
