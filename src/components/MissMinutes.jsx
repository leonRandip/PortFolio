import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MissMinutes.css';
import { COMMAND_REACTIONS, GENERIC_REACTIONS, HOVER_REACTIONS } from './missMinutesReactions';

// ── Position helpers ────────────────────────────────────────────────────────

// Safe zones keep her away from edges and the bottom input row
const SAFE = { topMin: 8, topMax: 72, leftMin: 4, leftMax: 82 };

function randomPosition(current) {
  let top, left, attempts = 0;
  do {
    top  = SAFE.topMin  + Math.random() * (SAFE.topMax  - SAFE.topMin);
    left = SAFE.leftMin + Math.random() * (SAFE.leftMax - SAFE.leftMin);
    attempts++;
    // Ensure she moves at least 12 units away from her current spot
  } while (
    attempts < 20 &&
    current &&
    Math.abs(top - current.top) < 12 &&
    Math.abs(left - current.left) < 12
  );
  return { top, left };
}

// ── Reaction picker ─────────────────────────────────────────────────────────

const recentlyUsed = [];

function pickReaction(command) {
  const pool = COMMAND_REACTIONS[command] ?? GENERIC_REACTIONS;
  // Filter out lines used in the last 5 reactions if pool is large enough
  const filtered = pool.length > 2 ? pool.filter(l => !recentlyUsed.includes(l)) : pool;
  const chosen = (filtered.length ? filtered : pool)[Math.floor(Math.random() * (filtered.length || pool.length))];
  recentlyUsed.push(chosen);
  if (recentlyUsed.length > 5) recentlyUsed.shift();
  return chosen;
}

function pickHoverReaction() {
  return HOVER_REACTIONS[Math.floor(Math.random() * HOVER_REACTIONS.length)];
}

// ── Bubble placement helpers ────────────────────────────────────────────────

function getBubblePlacement(posTop, posLeft) {
  const above    = posTop > 45;   // put bubble above avatar when she's in lower half
  const shiftLeft  = posLeft > 65;  // shift bubble left when near right edge
  const shiftRight = posLeft < 20;  // shift bubble right when near left edge
  return { above, shiftLeft, shiftRight };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function MissMinutes({ lastCommand, commandCounter }) {
  const [position, setPosition]         = useState(() => randomPosition(null));
  const [bubbleText, setBubbleText]     = useState('');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubblePlacement, setBubblePlacement] = useState({ above: true, shiftLeft: false, shiftRight: false });
  const [isHovered, setIsHovered]       = useState(false);

  const dismissTimer = useRef(null);
  const hoverTimer   = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(dismissTimer.current);
      clearTimeout(hoverTimer.current);
    };
  }, []);

  // ── React to every new command ────────────────────────────────────────────
  useEffect(() => {
    if (commandCounter === 0) return; // no reaction before first command

    // Cancel any pending dismiss
    clearTimeout(dismissTimer.current);

    const line = pickReaction(lastCommand);
    const newPos = randomPosition(position);
    const placement = getBubblePlacement(newPos.top, newPos.left);

    setBubbleText(line);
    setBubblePlacement(placement);
    setPosition(newPos);

    // Small delay so the position transition starts before bubble appears
    const showTimer = setTimeout(() => setBubbleVisible(true), 120);

    // Auto-dismiss after 4.5s
    dismissTimer.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 4500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandCounter]);

  // ── Hover handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimer.current);
    clearTimeout(dismissTimer.current);
    setIsHovered(true);
    setBubbleText(pickHoverReaction());
    setBubblePlacement(getBubblePlacement(position.top, position.left));
    setBubbleVisible(true);
  }, [position]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    hoverTimer.current = setTimeout(() => setBubbleVisible(false), 1200);
  }, []);

  // ── Bubble class string ───────────────────────────────────────────────────
  const bubbleClass = [
    'miss-minutes-bubble',
    bubbleVisible ? 'visible' : '',
    bubblePlacement.above      ? 'above'       : 'below',
    bubblePlacement.shiftLeft  ? 'shift-left'  : '',
    bubblePlacement.shiftRight ? 'shift-right' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="miss-minutes"
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
    >
      <div
        className="miss-minutes-avatar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      >
        {/* Miss Minutes — clock face emoji */}
        🕰️
      </div>

      <div className={bubbleClass}>
        {bubbleText}
      </div>
    </div>
  );
}
