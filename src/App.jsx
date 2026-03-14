import './App.css';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PortfolioClone from './portfolio';
import TerminalPage from './terminal/TerminalPage';
import DeconstructOverlay from './components/DeconstructOverlay';

// Determine once at module level to avoid flicker from useEffect delay
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

export default function App() {
  // Start terminal on desktop, portfolio directly on mobile
  const [view, setView] = useState(IS_MOBILE ? 'portfolio' : 'terminal');
  const [skipBoot, setSkipBoot] = useState(false);
  const isTransitioning = useRef(false);

  // Browser back button → trigger deconstruct from portfolio
  useEffect(() => {
    const handlePop = () => {
      if (!IS_MOBILE && view === 'portfolio' && !isTransitioning.current) {
        handleEject();
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called by TerminalPage when "sudo init project-black" completes
  const handleLaunch = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    // Push history so browser back triggers popstate
    window.history.pushState({ view: 'portfolio' }, '');
    setView('portfolio');
    setTimeout(() => { isTransitioning.current = false; }, 1000);
  };

  // Called by back button overlay or EjectFooter
  const handleEject = () => {
    if (isTransitioning.current || view !== 'portfolio') return;
    isTransitioning.current = true;
    setView('deconstructing');
  };

  // Called by DeconstructOverlay when the sequence finishes
  const handleDeconstructComplete = () => {
    setSkipBoot(true);
    setView('terminal');
    setTimeout(() => { isTransitioning.current = false; }, 500);
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
            <TerminalPage onLaunch={handleLaunch} skipBoot={skipBoot} />
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

            {/* Desktop-only back button */}
            {!IS_MOBILE && (
              <button
                onClick={handleEject}
                style={{
                  position: 'fixed',
                  top: '1rem',
                  left: '1rem',
                  zIndex: 40,
                  background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(0,255,65,0.5)',
                  color: '#00ff41',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.68rem',
                  padding: '0.35rem 0.7rem',
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  opacity: 0.45,
                  transition: 'opacity 0.2s ease, border-color 0.2s ease',
                  lineHeight: 1.5,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.borderColor = '#00ff41';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '0.45';
                  e.currentTarget.style.borderColor = 'rgba(0,255,65,0.5)';
                }}
              >
                ← TERMINAL
              </button>
            )}
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

      </AnimatePresence>
    </div>
  );
}
