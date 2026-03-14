import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DOTS = [
  { id: 'red',    color: '#ff5f57', symbol: '×', label: 'Close' },
  { id: 'yellow', color: '#febc2e', symbol: '−', label: 'Minimize' },
  { id: 'green',  color: '#28c840', symbol: '↑', label: 'Fullscreen' },
];

export default function TrafficLights({ onClose, onMinimize, onFullscreen }) {
  const [hovered, setHovered] = useState(null);

  const handlers = { red: onClose, yellow: onMinimize, green: onFullscreen };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        pointerEvents: 'auto',
      }}
    >
      {/* Pill container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(22,22,22,0.88)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '6px 12px',
          backdropFilter: 'blur(8px)',
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {DOTS.map(({ id, color, symbol }) => (
          <button
            key={id}
            onClick={handlers[id]}
            onMouseEnter={() => setHovered(id)}
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: color,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: hovered === id ? `0 0 6px ${color}88` : 'none',
              transition: 'box-shadow 0.15s ease',
            }}
            aria-label={DOTS.find(d => d.id === id)?.label}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.55rem',
                fontWeight: 700,
                color: 'rgba(0,0,0,0.65)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.1s ease',
                lineHeight: 1,
                fontFamily: 'system-ui, sans-serif',
                userSelect: 'none',
              }}
            >
              {symbol}
            </span>
          </button>
        ))}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            key={hovered}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              marginLeft: 4,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.06em',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {DOTS.find(d => d.id === hovered)?.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
