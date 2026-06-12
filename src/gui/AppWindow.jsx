import React, { useState, useRef, useCallback, useEffect } from 'react';
import './AppWindow.css';

const SIZES = {
  terminal:     { w: 880, h: 560 },
  finder:       { w: 980, h: 640 },
  brickbreaker: { w: 860, h: 580 },
  jarvis:       { w: 760, h: 550 },
  gordon:       { w: 760, h: 550 },
  matrix:       { w: 860, h: 580 },
  readme:       { w: 620, h: 540 },
};

function initPos(w, h) {
  return {
    x: Math.max(0,  Math.round((window.innerWidth  - w) / 2)),
    y: Math.max(28, Math.round((window.innerHeight - h) / 2)),
  };
}

export default function AppWindow({ appId, label, zIndex, onClose, onMinimize, onFocus, isMinimizing, children }) {
  const { w, h } = SIZES[appId] ?? { w: 880, h: 560 };

  const [pos,       setPos]       = useState(() => initPos(w, h));
  const [maximized, setMaximized] = useState(false);
  const posRef      = useRef(pos);
  const preMaxRef   = useRef(null);
  const isDragging  = useRef(false);
  const dragOrigin  = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const containerRef = useRef(null);
  const maximizedRef = useRef(false);

  useEffect(() => { posRef.current    = pos;       }, [pos]);
  useEffect(() => { maximizedRef.current = maximized; }, [maximized]);

  // Minimize animation — runs in AppWindow so it knows its own current position
  useEffect(() => {
    if (!isMinimizing || !containerRef.current) return;
    const curX = maximizedRef.current ? 0 : posRef.current.x;
    const curY = maximizedRef.current ? 24 : posRef.current.y;
    const dstX = window.innerWidth  / 2 - w / 2;
    const dstY = window.innerHeight + 60;

    containerRef.current.animate(
      [
        { transform: `translate(${curX}px, ${curY}px) scale(1)`,     opacity: 1 },
        { transform: `translate(${dstX}px, ${dstY}px) scale(0.05)`,  opacity: 0 },
      ],
      { duration: 380, easing: 'cubic-bezier(0.4, 0, 0.8, 1)', fill: 'forwards' }
    );
  }, [isMinimizing]); // eslint-disable-line react-hooks/exhaustive-deps

  const onBarMouseDown = useCallback((e) => {
    if (e.button !== 0 || maximized) return;
    e.preventDefault();
    onFocus();
    isDragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y };

    const move = (ev) => {
      if (!isDragging.current) return;
      setPos({
        x: Math.max(0,  dragOrigin.current.px + ev.clientX - dragOrigin.current.mx),
        y: Math.max(24, dragOrigin.current.py + ev.clientY - dragOrigin.current.my),
      });
    };
    const up = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',   up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
  }, [maximized, onFocus]);

  const toggleMax = useCallback(() => {
    if (maximized) {
      if (preMaxRef.current) setPos(preMaxRef.current);
      setMaximized(false);
    } else {
      preMaxRef.current = posRef.current;
      setMaximized(true);
    }
  }, [maximized]);

  const style = maximized
    ? { width: '100vw', height: 'calc(100vh - 24px - 80px)', transform: 'translate(0px, 24px)', borderRadius: 0 }
    : { width: w, height: h, transform: `translate(${pos.x}px, ${pos.y}px)`, borderRadius: 12 };

  return (
    <div ref={containerRef} className="appwin" style={{ ...style, zIndex }} onMouseDown={onFocus}>
      {/* Titlebar — drag handle */}
      <div className="appwin-bar" onMouseDown={onBarMouseDown}>
        <div className="appwin-dots">
          <button className="appwin-dot appwin-red"    onClick={e => { e.stopPropagation(); onClose();    }} title="Close" />
          <button className="appwin-dot appwin-yellow" onClick={e => { e.stopPropagation(); onMinimize(); }} title="Minimize" />
          <button className="appwin-dot appwin-green"  onClick={e => { e.stopPropagation(); toggleMax();  }} title="Maximise" />
        </div>
        <span className="appwin-title">{label}</span>
      </div>

      {/* Body — transform: translateZ(0) makes this the containing block for fixed children */}
      <div className="appwin-body">
        {children}
      </div>
    </div>
  );
}
