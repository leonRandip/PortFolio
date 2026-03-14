import React, { useState, useEffect, useRef } from 'react';
import './hack.css';

const HACKING_LINES = [
  '[SYS] Bypassing firewall...',
  '[SYS] Injecting payload...',
  '[SYS] Escalating privileges...',
  '[SYS] Exfiltrating data...',
];

const overlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: '#000',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  color: '#00ff41',
  padding: '2rem',
};

export default function HackSequence({ onClose }) {
  const [phase, setPhase] = useState('blurred');
  const [blurAmount, setBlurAmount] = useState(20);
  const [revealDone, setRevealDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [hackLines, setHackLines] = useState([]);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Keydown: Enter advances through phases
  useEffect(() => {
    const handle = (e) => {
      if (e.key !== 'Enter') return;
      if (phase === 'blurred') setPhase('hacking');
      else if (phase === 'payment') setPhase('revealing');
      else if (phase === 'revealing' && revealDone) setPhase('burning');
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, revealDone]);

  // hacking: stagger output lines then auto-advance to payment
  useEffect(() => {
    if (phase !== 'hacking') return;
    setHackLines([]);
    const timers = HACKING_LINES.map((line, i) =>
      setTimeout(() => setHackLines(prev => [...prev, line]), i * 600 + 200)
    );
    const done = setTimeout(() => setPhase('payment'), 3200);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [phase]);

  // revealing: trigger CSS blur transition via double-rAF
  useEffect(() => {
    if (phase !== 'revealing') return;
    setRevealDone(false);
    setBlurAmount(20);
    let raf1, raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBlurAmount(0));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [phase]);

  // burning: animate then close
  useEffect(() => {
    if (phase !== 'burning') return;
    setTransitioning(true);
    const id = setTimeout(() => onCloseRef.current('Block mined. Item dropped: profile.jpg'), 2600);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <div style={overlay}>

      {/* ── Phase: blurred ── */}
      {phase === 'blurred' && (
        <>
          <img
            src="/images/fs0ciety.jpeg"
            alt=""
            draggable={false}
            style={{
              filter: 'blur(18px)',
              width: '60%',
              maxWidth: 480,
              borderRadius: 4,
              display: 'block',
            }}
          />
          <p style={{ marginTop: 24, fontSize: '1.1rem', letterSpacing: '0.15em', color: '#00ff41', textShadow: '0 0 12px rgba(0,255,65,0.6)', marginBottom: 0 }}>
            [ TARGET ACQUIRED ]
          </p>
          <p style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.78rem', marginTop: 12, letterSpacing: '0.06em' }}>
            Press Enter to initiate breach
          </p>
        </>
      )}

      {/* ── Phase: hacking ── */}
      {phase === 'hacking' && (
        <>
          <p style={{ fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: 4, color: '#ffb800' }}>
            [ BREACH IN PROGRESS ]
          </p>
          <div className="hack-progress-bar">
            <div className="hack-progress-fill" />
          </div>
          <div style={{ width: '60%', maxWidth: 480, fontSize: '0.78rem', lineHeight: 1.8 }}>
            {hackLines.map((line, i) => (
              <div key={i} style={{ color: '#00ff41' }}>{line}</div>
            ))}
          </div>
        </>
      )}

      {/* ── Phase: payment ── */}
      {phase === 'payment' && (
        <>
          <pre style={{
            color: '#ffb800',
            lineHeight: 1.7,
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: 0,
            letterSpacing: '0.04em',
          }}>
{`  ┌──────────────────────────────────┐
  │  SYSTEM: Payment required        │
  │  Amount: $1.00 USD               │
  │  Recipient: hack.exe             │
  └──────────────────────────────────┘`}
          </pre>
          <p style={{ color: 'rgba(0,255,65,0.45)', fontSize: '0.78rem', marginTop: 20, letterSpacing: '0.06em' }}>
            [ Press Enter to authorize payment ]
          </p>
        </>
      )}

      {/* ── Phase: revealing ── */}
      {phase === 'revealing' && (
        <>
          <img
            src="/images/profile.JPG"
            alt=""
            draggable={false}
            style={{
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 3s ease-out',
              width: '55%',
              maxWidth: 440,
              borderRadius: 4,
              display: 'block',
            }}
            onTransitionEnd={() => setRevealDone(true)}
          />
          <p style={{ color: '#ffb800', marginTop: 20, letterSpacing: '0.12em', fontSize: '0.9rem', marginBottom: 0 }}>
            DECRYPTING TARGET...
          </p>
          {revealDone && (
            <p style={{ color: 'rgba(0,255,65,0.45)', fontSize: '0.78rem', marginTop: 12, letterSpacing: '0.06em' }}>
              [ Press Enter to MINE ]
            </p>
          )}
        </>
      )}

      {/* ── Phase: burning (mining) ── */}
      {phase === 'burning' && (
        <>
          <div className={transitioning ? 'hack-mine-container hack-mine-active' : 'hack-mine-container'}>
            <img
              src="/images/profile.JPG"
              alt=""
              draggable={false}
              style={{ width: '55%', maxWidth: 440, borderRadius: 4, display: 'block' }}
            />
            {transitioning && <div className="hack-mine-crack" />}
          </div>
          <p style={{ color: '#ffb800', marginTop: 20, letterSpacing: '0.12em', fontSize: '0.9rem', textShadow: '0 0 10px rgba(255,184,0,0.5)' }}>
            ⛏ &nbsp;MINING BLOCK...
          </p>
        </>
      )}

    </div>
  );
}
