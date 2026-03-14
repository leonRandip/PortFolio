import React, { useRef, useState } from 'react';

const THRESHOLD = 120;

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
      if (delta < THRESHOLD && navigator.vibrate) {
        const milestone = Math.floor(delta / 30) * 30;
        if (milestone > lastHapticMilestoneRef.current) {
          lastHapticMilestoneRef.current = milestone;
          navigator.vibrate(8);
        }
      }

      // Threshold reached: stronger double-pulse
      if (delta >= THRESHOLD && !triggeredRef.current) {
        triggeredRef.current = true;
        if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      }
    }
  };

  const handleTouchEnd = () => {
    if (triggeredRef.current) {
      onEject();
    }
    setIsDragging(false);
    setDragY(0);
    triggeredRef.current = false;
  };

  const progress = Math.min(dragY / THRESHOLD, 1);
  const isPast = dragY >= THRESHOLD;
  const glowOpacity = 0.15 + progress * 0.7;

  return (
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
        {/* Drag notch */}
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
  );
}
