import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MissMinutes.css';
import { COMMAND_REACTIONS, GENERIC_REACTIONS, HOVER_REACTIONS } from './missMinutesReactions';
import { COMMAND_EXPRESSIONS } from './expressionMap';
import MissMinutes3D from './MissMinutes3D';

// ── Safe zones ───────────────────────────────────────────────────────────────
const SAFE      = { topMin: 8,  topMax: 72, leftMin: 4,  leftMax: 80 };
const SAFE_FLY  = { topMin: 4,  topMax: 80, leftMin: 2,  leftMax: 86 };

function randomPosition(current, safe = SAFE) {
  let top, left, attempts = 0;
  do {
    top  = safe.topMin  + Math.random() * (safe.topMax  - safe.topMin);
    left = safe.leftMin + Math.random() * (safe.leftMax - safe.leftMin);
    attempts++;
  } while (
    attempts < 20 && current &&
    Math.abs(top - current.top) < 15 &&
    Math.abs(left - current.left) < 15
  );
  return { top, left };
}

// ── Reaction picker ──────────────────────────────────────────────────────────
const recentlyUsed = [];
function pickReaction(command) {
  const pool     = COMMAND_REACTIONS[command] ?? GENERIC_REACTIONS;
  const filtered = pool.length > 2 ? pool.filter(l => !recentlyUsed.includes(l)) : pool;
  const chosen   = (filtered.length ? filtered : pool)[Math.floor(Math.random() * (filtered.length || pool.length))];
  recentlyUsed.push(chosen);
  if (recentlyUsed.length > 5) recentlyUsed.shift();
  return chosen;
}

function pickHoverReaction() {
  return HOVER_REACTIONS[Math.floor(Math.random() * HOVER_REACTIONS.length)];
}

// ── Bubble placement ─────────────────────────────────────────────────────────
function getBubblePlacement(posTop, posLeft) {
  return {
    above:      posTop > 45,
    shiftLeft:  posLeft > 65,
    shiftRight: posLeft < 20,
  };
}

// ── Walk duration based on distance ─────────────────────────────────────────
function walkDuration(from, to) {
  const dist = Math.sqrt(
    Math.pow(to.top - from.top, 2) + Math.pow((to.left - from.left) * 1.6, 2)
  );
  return Math.min(5500, Math.max(2000, dist * 80));
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MissMinutes({ lastCommand, commandCounter }) {
  const [position, setPosition]               = useState(() => randomPosition(null));
  const [bubbleText, setBubbleText]           = useState('');
  const [bubbleVisible, setBubbleVisible]     = useState(false);
  const [bubblePlacement, setBubblePlacement] = useState({ above: true, shiftLeft: false, shiftRight: false });
  const [isHovered, setIsHovered]             = useState(false);
  const [expression, setExpression]           = useState('idle');
  const [isWalking, setIsWalking]             = useState(false);
  const [walkDir, setWalkDir]                 = useState(null);
  const [isFlying, setIsFlying]               = useState(false);
  const [positionKey, setPositionKey]         = useState(0);

  const dismissTimer  = useRef(null);
  const hoverTimer    = useRef(null);
  const walkTimer     = useRef(null);
  const flyTimer      = useRef(null);
  const walkDurRef    = useRef(700);
  const positionRef   = useRef(position);
  const isHoveredRef  = useRef(false);
  const commandActive = useRef(false);
  const isFlyingRef   = useRef(false);

  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);
  useEffect(() => { isFlyingRef.current = isFlying; }, [isFlying]);

  // ── Walking loop ────────────────────────────────────────────────────────
  useEffect(() => {
    function scheduleWalk(delayMs) {
      walkTimer.current = setTimeout(() => {
        if (isHoveredRef.current || commandActive.current || isFlyingRef.current) {
          scheduleWalk(1500);
          return;
        }
        startWalk();
      }, delayMs);
    }

    function startWalk() {
      const from = positionRef.current;
      const to   = randomPosition(from);
      const dir  = to.left >= from.left ? 'right' : 'left';
      const dur  = walkDuration(from, to);

      walkDurRef.current = dur;
      setWalkDir(dir);
      setIsWalking(true);
      setPosition(to);
      setPositionKey(k => k + 1);
      positionRef.current = to;
      setBubblePlacement(getBubblePlacement(to.top, to.left));

      walkTimer.current = setTimeout(() => {
        setIsWalking(false);
        setWalkDir(null);
        walkDurRef.current = 700;
        scheduleWalk(3500 + Math.random() * 5000);
      }, dur + 200);
    }

    scheduleWalk(4000 + Math.random() * 3000);
    return () => clearTimeout(walkTimer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flying loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    function scheduleFly(delayMs) {
      flyTimer.current = setTimeout(() => {
        if (isHoveredRef.current || commandActive.current) {
          scheduleFly(3000);
          return;
        }
        startFly();
      }, delayMs);
    }

    function startFly() {
      // Interrupt walk
      clearTimeout(walkTimer.current);
      setIsWalking(false);
      setWalkDir(null);

      const from = positionRef.current;
      const to   = randomPosition(from, SAFE_FLY);

      setIsFlying(true);
      setPosition(to);
      setPositionKey(k => k + 1);
      positionRef.current = to;
      setBubblePlacement(getBubblePlacement(to.top, to.left));
      walkDurRef.current = 1200; // faster air transition

      // Land after 5-8 seconds
      const flyDur = 5000 + Math.random() * 3000;
      flyTimer.current = setTimeout(() => {
        setIsFlying(false);
        walkDurRef.current = 700;
        // Resume walk loop
        scheduleFly(12000 + Math.random() * 10000);
      }, flyDur);
    }

    // First flight after 12-20 seconds
    scheduleFly(12000 + Math.random() * 8000);
    return () => clearTimeout(flyTimer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(dismissTimer.current);
      clearTimeout(hoverTimer.current);
      clearTimeout(walkTimer.current);
      clearTimeout(flyTimer.current);
    };
  }, []);

  // ── React to commands ────────────────────────────────────────────────────
  useEffect(() => {
    if (commandCounter === 0) return;

    clearTimeout(walkTimer.current);
    clearTimeout(flyTimer.current);
    setIsWalking(false);
    setIsFlying(false);
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
    setPositionKey(k => k + 1);
    positionRef.current = newPos;
    setExpression(expr);

    const idleTimer = setTimeout(() => setExpression('idle'), 2200);
    const showTimer = setTimeout(() => setBubbleVisible(true), 120);

    dismissTimer.current = setTimeout(() => setBubbleVisible(false), 4500);

    const resumeTimer = setTimeout(() => {
      commandActive.current = false;
      const pause = 2500 + Math.random() * 3000;
      walkTimer.current = setTimeout(() => {
        if (!isHoveredRef.current && !isFlyingRef.current) {
          const from = positionRef.current;
          const to   = randomPosition(from);
          const dir  = to.left >= from.left ? 'right' : 'left';
          const dur  = walkDuration(from, to);
          walkDurRef.current = dur;
          setWalkDir(dir);
          setIsWalking(true);
          setPosition(to);
          setPositionKey(k => k + 1);
          positionRef.current = to;
          setBubblePlacement(getBubblePlacement(to.top, to.left));
          walkTimer.current = setTimeout(() => {
            setIsWalking(false);
            setWalkDir(null);
            walkDurRef.current = 700;
          }, dur + 200);
        }
      }, pause);
    }, 5500);

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

  // ── Class strings ─────────────────────────────────────────────────────────
  const bubbleClass = [
    'miss-minutes-bubble',
    bubbleVisible       ? 'visible'      : '',
    bubblePlacement.above      ? 'above'       : 'below',
    bubblePlacement.shiftLeft  ? 'shift-left'  : '',
    bubblePlacement.shiftRight ? 'shift-right' : '',
  ].filter(Boolean).join(' ');

  const avatarClass = [
    'miss-minutes-avatar',
    isFlying                   ? 'flying'      : '',
    !isFlying && isWalking     ? 'walking'      : '',
    !isFlying && isWalking && walkDir ? `walk-${walkDir}` : '',
  ].filter(Boolean).join(' ');

  const transitionDur = isFlying ? 1200 : walkDurRef.current;

  return (
    <div
      className="miss-minutes"
      style={{
        top:  `${position.top}%`,
        left: `${position.left}%`,
        transition: `top ${transitionDur}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), left ${transitionDur}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      <div
        className={avatarClass}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      >
        <MissMinutes3D
          expression={expression}
          isHovered={isHovered}
          isWalking={isWalking}
          isFlying={isFlying}
          walkDir={walkDir}
          positionKey={positionKey}
        />
      </div>

      <div className={bubbleClass}>
        {bubbleText}
      </div>
    </div>
  );
}
