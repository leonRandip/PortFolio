import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MacOSDesktop.css';
import AppWindow from './AppWindow';
import TerminalPage from '../terminal/TerminalPage';
import PortfolioClone from '../portfolio';
import BrickBreaker from '../components/BrickBreaker';
import ChatOverlay from '../components/ChatOverlay';
import MatrixCanvas from '../components/MatrixCanvas';
import MissMinutes from '../components/MissMinutes';
import ReadmeViewer from '../components/ReadmeViewer';

// ── Clock ─────────────────────────────────────────────────────────────────────
function clock() {
  const d  = new Date();
  const h  = d.getHours() % 12 || 12;
  const m  = String(d.getMinutes()).padStart(2, '0');
  const ap = d.getHours() >= 12 ? 'PM' : 'AM';
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return {
    time: `${h}:${m} ${ap}`,
    date: `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`,
  };
}

// ── App registry ──────────────────────────────────────────────────────────────
const DOCK_APPS = [
  { id: 'finder',       label: 'Portfolio',    imgSrc: '/images/Finder Icon.svg', color: '#4A90D9' },
  { id: 'terminal',     label: 'Terminal',     imgSrc: '/images/Design.svg',      color: '#00ff41' },
  { id: 'brickbreaker', label: 'BrickBreaker', imgSrc: '/images/brickbreaker.svg', color: '#FF9500' },
  { id: 'jarvis',       label: 'J.A.R.V.I.S', imgSrc: '/images/jarvis.png',   color: '#FFD700', iconBg: '#a00' },
  { id: 'gordon',       label: 'Gordon',       imgSrc: '/images/gordon.png',   color: '#FF4500' },
  { id: 'matrix',       label: 'Matrix',       imgSrc: '/images/Matrix Background Vector.svg', color: '#00ff41' },
];

function initIconPos(row) {
  return { x: window.innerWidth - 88, y: 44 + row * 96 };
}

export default function MacOSDesktop({ onSwitchInterface }) {
  const [windows,       setWindows]       = useState([]);
  const [minimized,     setMinimized]     = useState(new Set());
  const [minimizingKeys, setMinimizingKeys] = useState(new Set());
  const [clk,       setClk]       = useState(clock);
  const [bouncing,  setBouncing]  = useState(null);
  const [showMM,    setShowMM]    = useState(false);
  const topZRef = useRef(100);

  useEffect(() => {
    const id = setInterval(() => setClk(clock()), 15000);
    return () => clearInterval(id);
  }, []);

  // ── Window management ──────────────────────────────────────────────────────

  const focusWindow = useCallback((key) => {
    const z = ++topZRef.current;
    setWindows(ws => ws.map(w => w.key === key ? { ...w, zIndex: z } : w));
  }, []);

  const closeWindow = useCallback((key) => {
    setWindows(ws => ws.filter(w => w.key !== key));
    setMinimized(m => { const s = new Set(m); s.delete(key); return s; });
  }, []);

  const minimizeWindow = useCallback((key) => {
    // Play animation first, then remove from render after it completes
    setMinimizingKeys(m => new Set([...m, key]));
    setTimeout(() => {
      setMinimized(m => new Set([...m, key]));
      setMinimizingKeys(m => { const s = new Set(m); s.delete(key); return s; });
    }, 400);
  }, []);

  const openApp = useCallback((id) => {
    setWindows(ws => {
      const existing = ws.find(w => w.id === id);
      if (existing) {
        // Restore if minimized and bring to front
        setMinimized(m => { const s = new Set(m); s.delete(existing.key); return s; });
        const z = ++topZRef.current;
        return ws.map(w => w.key === existing.key ? { ...w, zIndex: z } : w);
      }
      // New window
      setBouncing(id);
      setTimeout(() => setBouncing(null), 220);
      const key = `${id}-${Date.now()}`;
      const z   = ++topZRef.current;
      return [...ws, { id, key, zIndex: z }];
    });
  }, []);

  // Menu-bar label = label of the topmost visible window
  const topWin = windows
    .filter(w => !minimized.has(w.key))
    .reduce((top, w) => (!top || w.zIndex > top.zIndex) ? w : top, null);
  const activeLabel = topWin
    ? (DOCK_APPS.find(a => a.id === topWin.id)?.label ?? 'Finder')
    : 'Finder';

  return (
    <div className="mac-root">
      {/* Wallpaper */}
      <div className="mac-wallpaper" />

      {/* Menu bar */}
      <div className="mac-menubar">
        <div className="mac-menubar-left">
          <span className="mac-apple">⌘</span>
          <span className="mac-mi mac-bold">{activeLabel}</span>
          <span className="mac-mi">File</span>
          <span className="mac-mi">Edit</span>
          <span className="mac-mi">View</span>
        </div>
        <div className="mac-menubar-right">
          <button
            className="mac-mi mac-mm-toggle"
            onClick={() => setShowMM(v => !v)}
            title="Toggle Miss Minutes"
          >
            🕐
          </button>
          <span className="mac-mi mac-date">{clk.date}</span>
          <span className="mac-mi">{clk.time}</span>
        </div>
      </div>

      {/* Draggable desktop icons */}
      <div className="mac-desktop-icons">
        <DraggableDesktopIcon
          label="Portfolio"
          imgSrc="/images/Folder.svg"
          initPos={initIconPos(0)}
          onDoubleClick={() => openApp('finder')}
        />
        <DraggableDesktopIcon
          label="Terminal"
          imgSrc="/images/Design.svg"
          initPos={initIconPos(1)}
          onDoubleClick={() => openApp('terminal')}
        />
        <DraggableDesktopIcon
          label="Readme.txt"
          imgSrc="/images/txt.svg"
          imgStyle={{ filter: 'brightness(0) invert(1)' }}
          initPos={initIconPos(2)}
          onDoubleClick={() => openApp('readme')}
        />
      </div>

      {/* Miss Minutes roams the desktop */}
      {showMM && (
        <MissMinutes lastCommand="" commandCounter={0} />
      )}

      {/* App windows */}
      {windows
        .filter(w => !minimized.has(w.key))
        .map(win => (
          <AppWindow
            key={win.key}
            appId={win.id}
            label={DOCK_APPS.find(a => a.id === win.id)?.label ?? win.id}
            zIndex={win.zIndex}
            isMinimizing={minimizingKeys.has(win.key)}
            onClose={() => closeWindow(win.key)}
            onMinimize={() => minimizeWindow(win.key)}
            onFocus={() => focusWindow(win.key)}
          >
            {win.id === 'finder'       && <PortfolioClone onEject={() => closeWindow(win.key)} isMobile={false} />}
            {win.id === 'terminal'     && <TerminalPage onLaunch={() => openApp('finder')} onLegacy={() => {}} skipBoot />}
            {win.id === 'brickbreaker' && <BrickBreaker onClose={() => closeWindow(win.key)} />}
            {win.id === 'jarvis'       && <ChatOverlay mode="jarvis" onClose={() => closeWindow(win.key)} />}
            {win.id === 'gordon'       && <ChatOverlay mode="gordon" onClose={() => closeWindow(win.key)} />}
            {win.id === 'matrix'       && <MatrixCanvas onExit={() => closeWindow(win.key)} />}
            {win.id === 'readme'       && <ReadmeViewer />}
          </AppWindow>
        ))}

      {/* Dock */}
      <div className="mac-dock-wrap">
        <div className="mac-dock">
          {DOCK_APPS.map(app => (
            <DockIcon
              key={app.id}
              app={app}
              isOpen={windows.some(w => w.id === app.id)}
              isBouncing={bouncing === app.id}
              onClick={() => openApp(app.id)}
            />
          ))}
          <div className="mac-dock-sep" />
          <DockIcon
            app={{ id: 'switch', label: 'Switch UI', imgSrc: '/images/Icon-64.svg', color: '#888' }}
            isOpen={false}
            isBouncing={false}
            onClick={onSwitchInterface}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DraggableDesktopIcon({ imgSrc, emoji, label, initPos, imgStyle, onDoubleClick }) {
  const [pos, setPos]   = useState(initPos);
  const posRef          = useRef(initPos);
  const hasDragged      = useRef(false);
  const originRef       = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  useEffect(() => { posRef.current = pos; }, [pos]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    hasDragged.current  = false;
    originRef.current   = { mx: e.clientX, my: e.clientY, px: posRef.current.x, py: posRef.current.y };

    const onMove = (ev) => {
      const dx = ev.clientX - originRef.current.mx;
      const dy = ev.clientY - originRef.current.my;
      if (!hasDragged.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasDragged.current = true;
      }
      if (hasDragged.current) {
        setPos({ x: originRef.current.px + dx, y: originRef.current.py + dy });
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, []);

  const handleDblClick = (e) => {
    if (!hasDragged.current) onDoubleClick(e);
  };

  return (
    <div
      className="mac-dicon"
      style={{ position: 'absolute', left: pos.x, top: pos.y }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDblClick}
    >
      {imgSrc
        ? <img src={imgSrc} alt={label} className="mac-dicon-img mac-dicon-svg" draggable={false} style={imgStyle} />
        : <span className="mac-dicon-img">{emoji}</span>
      }
      <span className="mac-dicon-label">{label}</span>
    </div>
  );
}

function DockIcon({ app, isOpen, isBouncing, onClick }) {
  const hasImg = Boolean(app.imgSrc);
  return (
    <button
      className={`mac-dock-btn ${isBouncing ? 'mac-bounce' : ''}`}
      onClick={onClick}
      title={app.label}
    >
      <div
        className={`mac-dock-icon ${hasImg ? 'mac-dock-icon-img' : ''}`}
        style={
          app.iconBg ? { background: app.iconBg } :
          hasImg     ? {}                          :
                       { color: app.color, background: `${app.color}1a` }
        }
      >
        {hasImg
          ? <img src={app.imgSrc} alt={app.label} className="mac-dock-svg" draggable={false} />
          : app.textIcon
            ? <span className="mac-dock-text">{app.textIcon}</span>
            : <span className="mac-dock-emoji">{app.emoji}</span>
        }
      </div>
      {isOpen && <span className="mac-dock-dot" />}
    </button>
  );
}
