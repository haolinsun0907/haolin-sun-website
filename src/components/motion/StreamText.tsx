"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./useReducedMotion";

// Writes the text out a few characters at a time, like an LLM streaming
// tokens. The not-yet-written part stays in the layout (invisible), so
// nothing below it moves while the text appears.
export default function StreamText({
  text,
  delay = 700,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(text.length);
  const [caret, setCaret] = useState<"off" | "typing" | "blink">("off");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setShown(0);
    setCaret("typing");
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      i = Math.min(text.length, i + 1 + Math.floor(Math.random() * 3));
      setShown(i);
      if (i < text.length) {
        timer = setTimeout(step, 40 + Math.random() * 70);
      } else {
        setCaret("blink");
        timer = setTimeout(() => setCaret("off"), 2600);
      }
    };
    timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {caret !== "off" && <span className={`caret caret-${caret}`} />}
        <span className="stream-rest">{text.slice(shown)}</span>
      </span>
    </p>
  );
}
