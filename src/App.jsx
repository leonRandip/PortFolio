import './App.css';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PortfolioClone from './portfolio';
import TerminalPage from './terminal/TerminalPage';
import DeconstructOverlay from './components/DeconstructOverlay';
import TrafficLights from './components/TrafficLights';
import RetroPortfolio from './components/RetroPortfolio';

// Determined once at module level — avoids render flicker from useEffect
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

export default function App() {
  const [view, setView] = useState(IS_MOBILE ? 'portfolio' : 'terminal');
  const [skipBoot, setSkipBoot] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConnectionClosed, setShowConnectionClosed] = useState(false);
  const isTransitioning = useRef(false);

  // Browser back button — trigger deconstruct when on portfolio (desktop only)
  useEffect(() => {
    const handlePop = () => {
      if (!IS_MOBILE && view === 'portfolio' && !isTransitioning.current) {
        handleEject();
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── View transition handlers ───────────────────────────────────────────────

  const handleLaunch = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setIsMinimized(false);
    window.history.pushState({ view: 'portfolio' }, '');
    setView('portfolio');
    setTimeout(() => { isTransitioning.current = false; }, 1000);
  };

  const handleEject = () => {
    if (isTransitioning.current || view !== 'portfolio') return;
    isTransitioning.current = true;
    setIsMinimized(false);
    setView('deconstructing');
  };

  const handleDeconstructComplete = () => {
    setSkipBoot(true);
    setView('terminal');
    setTimeout(() => { isTransitioning.current = false; }, 500);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setSkipBoot(true);
    setView('terminal');
  };

  const handleLegacy = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setView('legacy');
    setTimeout(() => { isTransitioning.current = false; }, 600);
  };

  const handleLegacyExit = () => {
    setShowConnectionClosed(true);
    setTimeout(() => {
      setShowConnectionClosed(false);
      setSkipBoot(true);
      setView('terminal');
    }, 900);
  };

  const handleFullscreen = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (_) {
      // fullscreen not supported (e.g. iOS Safari) — silently ignore
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <AnimatePresence mode="wait">

        {view === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scaleY: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <TerminalPage
              onLaunch={handleLaunch}
              onLegacy={handleLegacy}
              skipBoot={skipBoot}
            />
          </motion.div>
        )}

        {view === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <PortfolioClone onEject={handleEject} isMobile={IS_MOBILE} />
          </motion.div>
        )}

        {view === 'deconstructing' && (
          <motion.div
            key="deconstructing"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, zIndex: 200 }}
          >
            <DeconstructOverlay onComplete={handleDeconstructComplete} />
          </motion.div>
        )}

        {view === 'legacy' && (
          <motion.div
            key="legacy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <RetroPortfolio onExit={handleLegacyExit} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* macOS traffic lights — desktop portfolio view only */}
      {view === 'portfolio' && !IS_MOBILE && (
        <TrafficLights
          onClose={handleEject}
          onMinimize={handleMinimize}
          onFullscreen={handleFullscreen}
        />
      )}

      {/* Minimized dock bar */}
      <AnimatePresence>
        {isMinimized && view === 'terminal' && (
          <motion.button
            key="minimized-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => { setIsMinimized(false); setView('portfolio'); }}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              background: 'rgba(20,20,20,0.92)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: '0.4rem 1.1rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}
          >
            ▣ project-black — click to restore
          </motion.button>
        )}
      </AnimatePresence>

      {/* "Connection closed." flash overlay after legacy exit */}
      {showConnectionClosed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            color: '#00ff41',
            fontSize: '1rem',
            letterSpacing: '0.06em',
          }}
        >
          Connection closed.
        </div>
      )}
    </div>
  );
}
