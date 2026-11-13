"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "../content/profile";
import { faq } from "../content/faq";
import { prefersReducedMotion } from "./motion/useReducedMotion";

type Message = { id: number; from: "you" | "me"; text: string; shown: number };

// Preview of the "Ask Haolin" assistant: pick a question and a prewritten
// answer streams in like a model reply. The panel says plainly that these
// are prewritten. The real agent will replace this component's answers.
export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextId = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest text in view while it streams
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function ask(q: string, a: string) {
    if (busy) return;
    setAsked((x) => [...x, q]);
    const you = { id: nextId.current++, from: "you" as const, text: q, shown: q.length };
    const me = { id: nextId.current++, from: "me" as const, text: a, shown: 0 };

    if (prefersReducedMotion()) {
      setMessages((m) => [...m, you, { ...me, shown: a.length }]);
      return;
    }

    setBusy(true);
    setMessages((m) => [...m, you, me]);
    let shown = 0;
    const step = () => {
      shown = Math.min(a.length, shown + 2 + Math.floor(Math.random() * 4));
      setMessages((m) => m.map((x) => (x.id === me.id ? { ...x, shown } : x)));
      if (shown < a.length) timer.current = setTimeout(step, 16 + Math.random() * 20);
      else setBusy(false);
    };
    timer.current = setTimeout(step, 450);
  }

  const remaining = faq.filter((f) => !asked.includes(f.q));

  return (
    <div className="chat">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Ask Haolin (preview)">
          <div className="chat-head">
            <div className="chat-title">
              <strong>Ask Haolin</strong>
              <span className="chat-badge">Preview</span>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
          <p className="chat-note">
            Prewritten answers from my profile. The AI version, a LangChain agent, is in progress.
          </p>

          <div className="chat-log" ref={logRef} aria-live="polite">
            {messages.length === 0 && <p className="chat-empty">Pick a question to get started.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg chat-${m.from}`}>
                {m.text.slice(0, m.shown)}
                {m.from === "me" && m.shown < m.text.length && <span className="caret caret-typing" />}
              </div>
            ))}
          </div>

          {remaining.length > 0 ? (
            <div className="chat-suggest">
              {remaining.map((f) => (
                <button key={f.q} type="button" onClick={() => ask(f.q, f.a)} disabled={busy}>
                  {f.q}
                </button>
              ))}
            </div>
          ) : (
            <p className="chat-empty">That's every question in the preview.</p>
          )}

          <a href={`mailto:${profile.links.email}`} className="btn btn-primary btn-block">
            Ask me directly by email
          </a>
        </div>
      )}
      <button
        type="button"
        className="chat-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        Ask about me
      </button>
    </div>
  );
}
