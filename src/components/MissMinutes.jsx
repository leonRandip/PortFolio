import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './MissMinutes.css';
import { COMMAND_REACTIONS, GENERIC_REACTIONS, HOVER_REACTIONS } from './missMinutesReactions';
import { COMMAND_EXPRESSIONS } from './expressionMap';

// Lazy-load the R3F canvas — only downloaded when TVA theme activates
const MissMinutes3D = lazy(() => import('./MissMinutes3D'));

// ── Position helpers ────────────────────────────────────────────────────────

// Safe zones keep her away from edges and the bottom input row
const SAFE = { topMin: 8, topMax: 72, leftMin: 4, leftMax: 82 };

function randomPosition(current) {
  let top, left, attempts = 0;
  do {
    top  = SAFE.topMin  + Math.random() * (SAFE.topMax  - SAFE.topMin);
    left = SAFE.leftMin + Math.random() * (SAFE.leftMax - SAFE.leftMin);
    attempts++;
    // Ensure she moves at least 15 units away from her current spot
  } while (
    attempts < 20 &&
    current &&
    Math.abs(top - current.top) < 15 &&
    Math.abs(left - current.left) < 15
  );
  return { top, left };
}

// ── Reaction picker ─────────────────────────────────────────────────────────

const recentlyUsed = [];

function pickReaction(command) {
  const pool = COMMAND_REACTIONS[command] ?? GENERIC_REACTIONS;
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
  const above      = posTop > 45;
  const shiftLeft  = posLeft > 65;
  const shiftRight = posLeft < 20;
  return { above, shiftLeft, shiftRight };
}

// ── Walk duration based on distance ────────────────────────────────────────

function walkDuration(from, to) {
  const dist = Math.sqrt(
    Math.pow(to.top - from.top, 2) + Math.pow((to.left - from.left) * 1.6, 2)
  );
  // ~60px/s feel — clamp between 1.2s and 3.5s
  return Math.min(3500, Math.max(1200, dist * 55));
}

// ── Component ───────────────────────────────────────────────────────────────

export default function MissMinutes({ lastCommand, commandCounter }) {
  const [position, setPosition]               = useState(() => randomPosition(null));
  const [bubbleText, setBubbleText]           = useState('');
  const [bubbleVisible, setBubbleVisible]     = useState(false);
  const [bubblePlacement, setBubblePlacement] = useState({ above: true, shiftLeft: false, shiftRight: false });
  const [isHovered, setIsHovered]             = useState(false);
  const [expression, setExpression]           = useState('idle');
  const [isWalking, setIsWalking]             = useState(false);
  const [walkDir, setWalkDir]                 = useState(null); // 'left' | 'right'

  const dismissTimer  = useRef(null);
  const hoverTimer    = useRef(null);
  const walkTimer     = useRef(null);   // the single active walk timer
  const walkDurRef    = useRef(700);    // ms for current walk transition
  const positionRef   = useRef(position);
  const isHoveredRef  = useRef(false);
  const commandActive = useRef(false);  // suppress walk during command reaction

  // Keep refs in sync
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);

  // ── Walking loop ────────────────────────────────────────────────────────
  useEffect(() => {
    function scheduleWalk(delayMs) {
      walkTimer.current = setTimeout(() => {
        // Wait if hovering or command reaction is playing
        if (isHoveredRef.current || commandActive.current) {
          scheduleWalk(1500);
          return;
        }
        startWalk();
      }, delayMs);
    }

    function startWalk() {
      const from   = positionRef.current;
      const to     = randomPosition(from);
      const dir    = to.left >= from.left ? 'right' : 'left';
      const dur    = walkDuration(from, to);

      walkDurRef.current = dur;
      setWalkDir(dir);
      setIsWalking(true);
      setPosition(to);
      positionRef.current = to;
      setBubblePlacement(getBubblePlacement(to.top, to.left));

      // Arrive: stop walking, then pause before next walk
      walkTimer.current = setTimeout(() => {
        setIsWalking(false);
        setWalkDir(null);
        walkDurRef.current = 700;
        const pause = 3500 + Math.random() * 5000;
        scheduleWalk(pause);
      }, dur + 200); // +200ms buffer for CSS transition settle
    }

    // Initial pause before first autonomous walk
    scheduleWalk(4000 + Math.random() * 3000);

    return () => clearTimeout(walkTimer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(dismissTimer.current);
      clearTimeout(hoverTimer.current);
      clearTimeout(walkTimer.current);
    };
  }, []);

  // ── React to every new command ────────────────────────────────────────────
  useEffect(() => {
    if (commandCounter === 0) return;

    // Interrupt any in-progress walk
    clearTimeout(walkTimer.current);
    setIsWalking(false);
    setWalkDir(null);
    commandActive.current = true;

    clearTimeout(dismissTimer.current);

    const line      = pickReaction(lastCommand);
    const newPos    = randomPosition(positionRef.current);
    const placement = getBubblePlacement(newPos.top, newPos.left);
    const expr      = COMMAND_EXPRESSIONS[lastCommand] ?? 'idle';

    setBubbleText(line);
    setBubblePlacement(placement);
    setPosition(newPos);
    positionRef.current = newPos;
    setExpression(expr);

    const idleTimer = setTimeout(() => setExpression('idle'), 2200);
    const showTimer = setTimeout(() => setBubbleVisible(true), 120);

    // Auto-dismiss bubble after 4.5s
    dismissTimer.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 4500);

    // Resume walk loop after bubble clears
    const resumeTimer = setTimeout(() => {
      commandActive.current = false;
      // Schedule next walk with a natural pause
      const pause = 2500 + Math.random() * 3000;
      walkTimer.current = setTimeout(() => {
        if (!isHoveredRef.current) {
          // inline startWalk logic
          const from = positionRef.current;
          const to   = randomPosition(from);
          const dir  = to.left >= from.left ? 'right' : 'left';
          const dur  = walkDuration(from, to);
          walkDurRef.current = dur;
          setWalkDir(dir);
          setIsWalking(true);
          setPosition(to);
          positionRef.current = to;
          setBubblePlacement(getBubblePlacement(to.top, to.left));
          walkTimer.current = setTimeout(() => {
            setIsWalking(false);
            setWalkDir(null);
            walkDurRef.current = 700;
          }, dur + 200);
        }
      }, pause);
    }, 5500); // after bubble dismiss

    return () => {
      clearTimeout(showTimer);
      clearTimeout(idleTimer);
      clearTimeout(dismissTimer.current);
      clearTimeout(resumeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandCounter]);

  // ── Hover handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimer.current);
    clearTimeout(dismissTimer.current);
    // Pause walking while hovered
    setIsWalking(false);
    setWalkDir(null);
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

  const avatarClass = [
    'miss-minutes-avatar',
    isWalking ? 'walking' : '',
    isWalking && walkDir ? `walk-${walkDir}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="miss-minutes"
      style={{
        top:  `${position.top}%`,
        left: `${position.left}%`,
        transition: `top ${walkDurRef.current}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), left ${walkDurRef.current}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      <div
        className={avatarClass}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Miss Minutes 3D model by Elcompa_Puente (CC-BY-4.0)"
        aria-hidden="true"
      >
        <Suspense fallback={<span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🕰️</span>}>
          <MissMinutes3D expression={expression} isHovered={isHovered} />
        </Suspense>
      </div>

      <div className={bubbleClass}>
        {bubbleText}
      </div>
    </div>
  );
}
