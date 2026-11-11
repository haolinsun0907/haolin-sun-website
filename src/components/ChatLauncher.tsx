"use client";

import { useState } from "react";
import { profile } from "../content/profile";

// Placeholder for the "Ask Haolin" assistant.
// Step 2 replaces the panel body with the real chat UI.
export default function ChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chat">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Ask Haolin">
          <div className="chat-head">
            <strong>Ask Haolin</strong>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
          <p>
            An AI assistant that answers questions about my work is coming soon. Until then, I'm happy to answer
            them myself.
          </p>
          <a href={`mailto:${profile.links.email}`} className="btn btn-primary btn-block">
            Email me
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
          <path
            d="M4 5h16v11H8l-4 4V5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Ask about me
      </button>
    </div>
  );
}
