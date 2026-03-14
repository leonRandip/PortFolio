import React, { useState, useEffect, useRef } from 'react';

const LINES = [
  '# ~/.bashrc — Randip Leon\'s shell config',
  '',
  'alias ll=\'ls -la --color=auto\'',
  'alias gs=\'git status\'',
  'alias glog=\'git log --oneline --graph --all\'',
  'alias dev=\'npm run dev\'',
  '',
  'export PS1=\'\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ \'',
  'export EDITOR=\'vim\'',
  'export NODE_ENV=\'development\'',
  'export PATH="$HOME/.local/bin:$HOME/.yarn/bin:$PATH"',
  '',
  '# source completions',
  '[ -f ~/.bash_completion ] && source ~/.bash_completion',
  '',
  'echo "⚡ Shell ready. Have a great session."',
];

const CHAR_DELAY = 22;   // ms per character
const LINE_PAUSE = 180;  // extra pause between lines

export default function BashrcPopup({ onClose }) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineText, setCurrentLineText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [closingIn, setClosingIn] = useState(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    const typeLines = async () => {
      for (let li = 0; li < LINES.length; li++) {
        if (cancelled) return;
        const line = LINES[li];

        // Type each character
        for (let ci = 0; ci <= line.length; ci++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, CHAR_DELAY));
          setCurrentLineText(line.slice(0, ci));
        }

        // Commit the line
        setDisplayedLines(prev => [...prev, line]);
        setCurrentLineText('');
        await new Promise(r => setTimeout(r, LINE_PAUSE));
      }

      if (cancelled) return;
      setIsDone(true);

      // Countdown close
      for (let s = 3; s >= 0; s--) {
        if (cancelled) return;
        setClosingIn(s);
        if (s === 0) break;
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!cancelled) onCloseRef.current?.();
    };

    typeLines();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* Window card */}
      <div
        style={{
          width: 'min(580px, 92vw)',
          background: '#0a0f0a',
          border: '1px solid rgba(0,255,65,0.3)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 20px 60px rgba(0,0,0,0.7)',
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          style={{
            background: '#111811',
            borderBottom: '1px solid rgba(0,255,65,0.15)',
            padding: '0.5rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Decorative traffic lights */}
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
          <span style={{ marginLeft: 8, color: 'rgba(0,255,65,0.45)', fontSize: '0.7rem', letterSpacing: '0.06em' }}>
            ~/.bashrc — bash
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1rem 1.2rem',
            maxHeight: '55vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {displayedLines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: '0.78rem',
                lineHeight: 1.65,
                color: line.startsWith('#') ? 'rgba(0,255,65,0.4)' : '#00ff41',
                minHeight: '1.3em',
                whiteSpace: 'pre',
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}

          {/* Currently typing line */}
          {!isDone && (
            <div style={{ fontSize: '0.78rem', lineHeight: 1.65, color: '#00ff41', whiteSpace: 'pre', minHeight: '1.3em' }}>
              {currentLineText}
              <span style={{ display: 'inline-block', width: 7, height: '0.85em', background: '#00ff41', verticalAlign: 'text-bottom', animation: 'terminalBlink 1s step-end infinite' }} />
            </div>
          )}

          {/* Done state */}
          {isDone && closingIn !== null && (
            <div style={{ fontSize: '0.72rem', color: 'rgba(0,255,65,0.4)', marginTop: '0.75rem', letterSpacing: '0.04em' }}>
              [ Process completed — window closing in {closingIn}s ]
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(0,255,65,0.1)',
          padding: '0.35rem 1.2rem',
          fontSize: '0.62rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.06em',
        }}>
          click outside to dismiss
        </div>
      </div>
    </div>
  );
}
