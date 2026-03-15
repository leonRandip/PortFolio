import React, { useRef, useState } from 'react';

const THRESHOLD = 120;

// ── Haptic helper — vibrate on Android, AudioContext click on iOS ────────────
function haptic(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
    return;
  }
  // iOS Safari fallback: short tap sound via AudioContext
  try {
    const duration = Array.isArray(pattern)
      ? pattern.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0)
      : pattern;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + Math.min(duration, 80) / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
    ctx.close();
  } catch (_) { /* silently ignore if audio is blocked */ }
}

// ── Static terminal lines shown in the peek ──────────────────────────────────
const PEEK_LINES = [
  { text: '[BOOT] Loading kernel modules...    OK', type: 'sys' },
  { text: '[NET]  Network interface eth0: connected', type: 'sys' },
  { text: '[SYS]  Starting randip-leon/portfolio v2.0.0', type: 'sys' },
  { text: '[SYS]  System ready.', type: 'sys' },
  { text: '', type: 'sys' },
  { text: "Welcome. Type 'help' for available commands.", type: 'sys' },
  { text: '', type: 'sys' },
  { text: 'visitor@randip:~$ _', type: 'prompt' },
];

export default function EjectFooter({ onEject }) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const triggeredRef = useRef(false);
  const lastHapticMilestoneRef = useRef(0);

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
    triggeredRef.current = false;
    lastHapticMilestoneRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const delta = startYRef.current - e.touches[0].clientY; // positive = dragging up
    if (delta > 0) {
      const clamped = Math.min(delta, THRESHOLD + 50);
      setDragY(clamped);

      // Progressive haptic: pulse every 30px tier below threshold
      if (delta < THRESHOLD) {
        const milestone = Math.floor(delta / 30) * 30;
        if (milestone > lastHapticMilestoneRef.current) {
          lastHapticMilestoneRef.current = milestone;
          haptic(8);
        }
      }

      // Threshold reached: stronger double-pulse
      if (delta >= THRESHOLD && !triggeredRef.current) {
        triggeredRef.current = true;
        haptic([60, 30, 60]);
      }
    }
  };

  const handleTouchEnd = () => {
    if (triggeredRef.current) onEject();
    setIsDragging(false);
    setDragY(0);
    triggeredRef.current = false;
  };

  const progress     = Math.min(dragY / THRESHOLD, 1);
  const isPast       = dragY >= THRESHOLD;
  const glowOpacity  = 0.15 + progress * 0.7;

  // How many terminal lines to reveal based on drag progress
  const linesVisible = Math.floor(progress * PEEK_LINES.length);

  return (
    <>
      {/* ── Terminal peek — revealed in the gap below the moving footer ── */}
      {isDragging && dragY > 8 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: dragY + 40, // 40px = handle bar height
            zIndex: 39,          // sits behind the footer (z-index 40)
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 1.5rem',
            paddingBottom: 48,   // keep content above the handle notch
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: '0.72rem',
            lineHeight: 1.7,
            letterSpacing: '0.02em',
          }}
        >
          {PEEK_LINES.slice(0, linesVisible).map((line, i) => (
            <div
              key={i}
              style={{
                color: line.type === 'prompt' ? '#fff' : '#00ff41',
                opacity: 0.7 + (i / PEEK_LINES.length) * 0.3,
                whiteSpace: 'pre',
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
      )}

      {/* ── Draggable footer ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          transform: `translateY(-${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Expanding panel shown while dragging */}
        {isDragging && dragY > 12 && (
          <div
            style={{
              background: `rgba(0,0,0,${0.82 + progress * 0.18})`,
              borderTop: `1px solid rgba(0,255,65,${glowOpacity})`,
              borderLeft: `1px solid rgba(0,255,65,${glowOpacity * 0.4})`,
              borderRight: `1px solid rgba(0,255,65,${glowOpacity * 0.4})`,
              padding: '1.25rem 1.5rem 0.75rem',
              textAlign: 'center',
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
            }}
          >
            <p
              style={{
                color: isPast ? '#00ff41' : `rgba(0,255,65,${0.35 + progress * 0.5})`,
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textShadow: isPast ? '0 0 10px rgba(0,255,65,0.6)' : 'none',
                transition: 'color 0.15s, text-shadow 0.15s',
              }}
            >
              {isPast ? '↑ Release to eject' : '↑ Keep pulling...'}
            </p>
            {isPast && (
              <p
                style={{
                  color: 'rgba(0,255,65,0.5)',
                  fontSize: '0.62rem',
                  marginTop: '0.3rem',
                  letterSpacing: '0.04em',
                }}
              >
                [SYS] Deconstructing project-black...
              </p>
            )}
          </div>
        )}

        {/* Always-visible handle bar */}
        <div
          style={{
            background: '#080808',
            borderTop: `1px solid rgba(0,255,65,${isDragging ? glowOpacity : 0.12})`,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 4,
            cursor: 'grab',
            userSelect: 'none',
            transition: 'border-color 0.15s',
          }}
        >
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 2,
              background: `rgba(0,255,65,${isDragging ? 0.3 + progress * 0.7 : 0.2})`,
              transition: isDragging ? 'none' : 'background 0.2s',
            }}
          />
          {!isDragging && (
            <p
              style={{
                color: 'rgba(255,255,255,0.18)',
                fontSize: '0.5rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontFamily: '"JetBrains Mono", monospace',
                marginTop: 2,
              }}
            >
              pull to eject
            </p>
          )}
        </div>
      </div>
    </>
  );
}
