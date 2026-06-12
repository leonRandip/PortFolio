import React, { useState } from 'react';

const CONTENT = `RANDIP.DEV — README
════════════════════════════════════════════════════

Welcome to my interactive portfolio. This isn't your
average resume page — it's a whole vibe.

────────────────────────────────────────────────────
 BOOT MODES
────────────────────────────────────────────────────

  [1] TERMINAL_OS  — Hacker mode.
      A fully custom terminal emulator. Type commands,
      explore projects, and break things (nicely).

      Try: help · projects · about · launch · chat

  [2] macOS_UI     — Normie mode.
      A macOS-style desktop with draggable windows,
      a dock, and this very text editor.

────────────────────────────────────────────────────
 APPS
────────────────────────────────────────────────────

  Portfolio     My projects, skills & experience.
  Terminal      The full hacker terminal, windowed.
  BrickBreaker  Playable brick-breaker game.
  J.A.R.V.I.S  AI assistant (Iron Man edition).
  Gordon        AI assistant (Gordon Ramsay edition).
  Matrix        You already know.

────────────────────────────────────────────────────
 TIPS
────────────────────────────────────────────────────

  · Double-click desktop icons to open apps.
  · Drag windows by their title bar.
  · Green dot → maximize. Yellow → minimize.
  · Click the 🕐 in the menu bar to summon
    Miss Minutes, the TVA's finest.
  · Switch UI via the dock's last icon.

────────────────────────────────────────────────────
 STACK
────────────────────────────────────────────────────

  React · Vite · Framer Motion · WebSockets
  Express · OpenAI · Resend · Deployed on Render

────────────────────────────────────────────────────

  Built by Randip Leon  ·  randip.dev
  © ${new Date().getFullYear()} All timelines reserved.
`;

export default function ReadmeViewer() {
  const [text] = useState(CONTENT);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#1c1c1e',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"JetBrains Mono", "Menlo", "Monaco", monospace',
    }}>
      {/* Toolbar */}
      <div style={{
        height: 36,
        background: '#2c2c2e',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
          README.txt — Plain Text
        </span>
      </div>

      {/* Text body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
      }}>
        <pre style={{
          margin: 0,
          fontSize: '0.78rem',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.82)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {text}
        </pre>
      </div>
    </div>
  );
}
