import React, { useEffect, useRef, useState } from 'react';

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!?><|/\\';

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function makeGlitchBlock(cols = 48, rows = 10) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, randomChar).join('')
  ).join('\n');
}

const SYS_MESSAGES = [
  '[SYS] Deconstructing project-black...',
  '[SYS] Terminating active processes...',
  '[SYS] Clearing memory buffers...',
];

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: '#000',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  padding: '2.5rem 2rem',
};

export default function DeconstructOverlay({ onComplete }) {
  const [phase, setPhase] = useState('messages'); // messages | countdown | glitch | black
  const [visibleMsgs, setVisibleMsgs] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [glitchBlock, setGlitchBlock] = useState('');
  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Reduced motion: simple fast fade → done
  useEffect(() => {
    if (!prefersReduced.current) return;
    const t = setTimeout(onComplete, 500);
    return () => clearTimeout(t);
  }, [onComplete]);

  // Phase: messages — print lines one by one
  useEffect(() => {
    if (prefersReduced.current) return;

    let i = 0;
    const show = () => {
      if (i < SYS_MESSAGES.length) {
        setVisibleMsgs(prev => [...prev, SYS_MESSAGES[i]]);
        i++;
        setTimeout(show, 480);
      } else {
        setTimeout(() => setPhase('countdown'), 300);
      }
    };
    show();
  }, []);

  // Phase: countdown — 3 → 2 → 1
  useEffect(() => {
    if (phase !== 'countdown') return;

    let count = 3;
    setCountdown(count);

    const tick = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(tick);
        setTimeout(() => setPhase('glitch'), 300);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [phase]);

  // Phase: glitch — rapid noise frames
  useEffect(() => {
    if (phase !== 'glitch') return;

    let frame = 0;
    const totalFrames = 22;

    const animate = () => {
      if (frame >= totalFrames) {
        setPhase('black');
        return;
      }
      setGlitchBlock(makeGlitchBlock(50, 12));
      frame++;
      setTimeout(animate, 45);
    };
    animate();
  }, [phase]);

  // Phase: black → call onComplete
  useEffect(() => {
    if (phase !== 'black') return;
    const t = setTimeout(onComplete, 280);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (prefersReduced.current) {
    return <div style={{ ...overlayStyle, transition: 'opacity 0.5s', opacity: 0 }} />;
  }

  if (phase === 'black') {
    return <div style={overlayStyle} />;
  }

  if (phase === 'glitch') {
    return (
      <div style={overlayStyle}>
        <pre
          style={{
            color: '#00ff41',
            fontSize: '0.6rem',
            lineHeight: 1.35,
            whiteSpace: 'pre',
            textShadow:
              '0 0 12px rgba(0,255,65,0.9), 3px 0 rgba(255,0,0,0.4), -3px 0 rgba(0,100,255,0.4)',
            userSelect: 'none',
          }}
        >
          {glitchBlock}
        </pre>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        {visibleMsgs.map((msg, i) => (
          <p
            key={i}
            style={{
              color: '#00ff41',
              fontSize: '0.88rem',
              marginBottom: '0.45rem',
              letterSpacing: '0.03em',
              opacity: 1,
            }}
          >
            {msg}
          </p>
        ))}

        {phase === 'countdown' && (
          <p
            style={{
              color: '#ff4444',
              fontSize: '2.4rem',
              fontWeight: 700,
              marginTop: '1.75rem',
              letterSpacing: '0.08em',
              textShadow: '0 0 24px rgba(255,68,68,0.8)',
            }}
          >
            Destruction in {countdown}...
          </p>
        )}
      </div>
    </div>
  );
}
