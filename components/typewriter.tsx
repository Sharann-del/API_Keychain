"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TypewriterProps {
  /** Words cycled through: typed, held, deleted, then the next one. */
  words: string[];
  /** Per-character typing cadence in ms. */
  typeSpeed?: number;
  /** Per-character deleting cadence in ms (usually faster than typing). */
  deleteSpeed?: number;
  /** How long a fully-typed word is held before it deletes, in ms. */
  holdDelay?: number;
  /** Pause after a word is fully deleted before the next begins, in ms. */
  swapDelay?: number;
  className?: string;
}

type Phase = "typing" | "holding" | "deleting";

/**
 * Render.com-style rotating typewriter: types a word out, holds it, backspaces
 * it away, then types the next — looping forever with a blinking caret.
 * Respects prefers-reduced-motion by showing the first word, statically.
 */
export function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 38,
  holdDelay = 1500,
  swapDelay = 400,
  className,
}: TypewriterProps) {
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("typing");
  const [reduced, setReduced] = React.useState(false);

  const word = words[index] ?? "";

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setReduced(true);
    }
  }, []);

  React.useEffect(() => {
    if (reduced) return;

    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (count < word.length) {
        timer = setTimeout(() => setCount((c) => c + 1), typeSpeed);
      } else {
        timer = setTimeout(() => setPhase("holding"), holdDelay);
      }
    } else if (phase === "holding") {
      setPhase("deleting");
    } else if (phase === "deleting") {
      if (count > 0) {
        timer = setTimeout(() => setCount((c) => c - 1), deleteSpeed);
      } else {
        timer = setTimeout(() => {
          setIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        }, swapDelay);
      }
    }

    return () => clearTimeout(timer);
  }, [
    count,
    phase,
    word,
    words.length,
    reduced,
    typeSpeed,
    deleteSpeed,
    holdDelay,
    swapDelay,
  ]);

  // The caret holds steady while characters move; it only blinks at rest.
  const atRest = phase === "holding" || (phase === "typing" && count === 0);

  return (
    <span className={className}>
      <span aria-live="polite">{reduced ? word : word.slice(0, count)}</span>
      <span
        aria-hidden="true"
        className={cn(
          "ml-1 inline-block w-[0.32em] h-[0.8em] -translate-y-[0.12em] bg-current align-middle opacity-80",
          atRest ? "animate-caret-blink" : "opacity-80"
        )}
      />
    </span>
  );
}
