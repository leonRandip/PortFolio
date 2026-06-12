import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './IOSHome.css';
import TerminalPage from '../terminal/TerminalPage';
import PortfolioClone from '../portfolio';
import BrickBreaker from '../components/BrickBreaker';
import ChatOverlay from '../components/ChatOverlay';
import MatrixCanvas from '../components/MatrixCanvas';

// ── Clock ─────────────────────────────────────────────────────────────────────
function iosTime() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ── App grid ──────────────────────────────────────────────────────────────────
const GRID_APPS = [
  { id: 'portfolio',    label: 'Portfolio',    imgSrc: '/images/Finder Icon.svg', bg: null      },
  { id: 'terminal',     label: 'Terminal',     imgSrc: '/images/Design.svg',      bg: null      },
  { id: 'brickbreaker', label: 'BrickBreaker', imgSrc: '/images/brickbreaker.svg',            bg: null },
  { id: 'jarvis',       label: 'J.A.R.V.I.S', imgSrc: '/images/jarvis.png',   bg: '#a00' },
  { id: 'gordon',       label: 'Gordon',       imgSrc: '/images/gordon.png',   bg: 'linear-gradient(145deg, #0a0a0a 0%, #1a0500 35%, #7a1e00 65%, #c43b00 100%)' },
  { id: 'matrix',       label: 'Matrix',       imgSrc: '/images/Matrix Background Vector.svg', bg: null },
];

export default function IOSHome({ onSwitchInterface }) {
  const [activeApp, setActiveApp] = useState(null);
  const [time]     = useState(iosTime);

  const openApp  = useCallback((id) => setActiveApp(id), []);
  const closeApp = useCallback(() => setActiveApp(null), []);

  return (
    <div className="ios-root">
      {/* Wallpaper */}
      <div className="ios-wallpaper" />

      {/* Status bar */}
      <div className="ios-statusbar">
        <span className="ios-time">{time}</span>
        <div className="ios-status-icons">
          <span>●●●</span>
          <span>WiFi</span>
          <span>⬛</span>
        </div>
      </div>

      {/* Date header */}
      <div className="ios-date-header">
        <div className="ios-date-weekday">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
        <div className="ios-date-number">{new Date().getDate()}</div>
      </div>

      {/* App grid */}
      <div className="ios-grid">
        {GRID_APPS.map((app, i) => (
          <motion.button
            key={app.id}
            className="ios-app-btn"
            onClick={() => openApp(app.id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            whileTap={{ scale: 0.88 }}
          >
            <div
              className={`ios-icon ${app.imgSrc ? 'ios-icon-img' : ''}`}
              style={app.bg ? { background: app.bg } : {}}
            >
              {app.imgSrc
                ? <img src={app.imgSrc} alt={app.label} className="ios-icon-svg" draggable={false} />
                : <span className="ios-icon-emoji">{app.emoji}</span>
              }
            </div>
            <span className="ios-icon-label">{app.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Dock */}
      <div className="ios-dock-bar">
        <motion.button
          className="ios-app-btn"
          onClick={onSwitchInterface}
          whileTap={{ scale: 0.88 }}
          title="Switch Interface"
        >
          <div className="ios-icon ios-icon-img">
            <img src="/images/Icon-64.svg" alt="Switch" className="ios-icon-svg" draggable={false} />
          </div>
          <span className="ios-icon-label">Switch</span>
        </motion.button>
      </div>

      {/* Home indicator */}
      <div className="ios-home-bar" />

      {/* Full-screen app */}
      <AnimatePresence>
        {activeApp && (
          <motion.div
            key={activeApp}
            className="ios-app-fs"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0,    y: 40, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button className="ios-back-btn" onClick={closeApp}>← Back</button>

            {activeApp === 'portfolio'    && <PortfolioClone onEject={closeApp} isMobile />}
            {activeApp === 'terminal'     && <TerminalPage onLaunch={() => openApp('portfolio')} onLegacy={() => {}} skipBoot />}
            {activeApp === 'brickbreaker' && <BrickBreaker onClose={closeApp} />}
            {activeApp === 'jarvis'       && <ChatOverlay mode="jarvis" onClose={closeApp} />}
            {activeApp === 'gordon'       && <ChatOverlay mode="gordon" onClose={closeApp} />}
            {activeApp === 'matrix'       && <MatrixCanvas onExit={closeApp} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
