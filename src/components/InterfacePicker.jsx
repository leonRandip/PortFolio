import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './InterfacePicker.css';

const IS_MOBILE = window.innerWidth < 768;

export default function InterfacePicker({ onPick }) {
  const [selected,  setSelected]  = useState(null);
  const [booting,   setBooting]   = useState(false);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  const boot = useCallback((mode) => {
    if (booting) return;
    setSelected(mode);
    setBooting(true);
    localStorage.setItem('ui-mode', mode);
    if (mode === 'gui') {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    setTimeout(() => onPick(mode), 1000);
  }, [booting, onPick]);

  useEffect(() => {
    const handler = (e) => {
      if (booting) return;
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setSelected('terminal');
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  setSelected('gui');
      if (e.key === 'Enter' && selected) boot(selected);
      if (e.key === '1') boot('terminal');
      if (e.key === '2') boot('gui');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [booting, selected, boot]);

  const cursor  = tick % 2 === 0 ? '█' : ' ';
  const dots    = '.'.repeat((tick % 3) + 1);

  return (
    <motion.div
      className="ip-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="ip-scanlines" />

      <div className="ip-header">
        <div className="ip-bios-line ip-dim">randip.dev BIOS v2.4.1 — All timelines reserved.</div>
        <div className="ip-bios-line ip-dim">Memory OK — 1x Developer detected — ∞ potential</div>
        <div className="ip-bios-divider">──────────────────────────────────────────────────</div>
        <div className="ip-bios-prompt">Select a boot disk{cursor}</div>
      </div>

      <div className="ip-disks">
        {/* ── Terminal disk ── */}
        <motion.div
          className={[
            'ip-disk ip-disk-terminal',
            selected === 'terminal' ? 'ip-selected' : '',
            booting  && selected === 'terminal' ? 'ip-booting' : '',
          ].join(' ')}
          onClick={() => boot('terminal')}
          whileHover={!booting ? { y: -6 } : {}}
          whileTap={!booting ? { scale: 0.97 } : {}}
        >
          <div className="ip-disk-num">[1]</div>

          <div className="ip-icon-wrap ip-icon-terminal">
            <span className="ip-icon-text">&gt;_</span>
          </div>

          <div className="ip-disk-name ip-green">TERMINAL_OS</div>
          <div className="ip-disk-tag">[ HACKER MODE ]</div>
          <div className="ip-disk-desc">
            Retro terminal.<br />Commands, glitch, chaos.
          </div>

          {selected === 'terminal' && !booting && (
            <div className="ip-check ip-green">✓ Selected — press ENTER</div>
          )}
          {booting && selected === 'terminal' && (
            <div className="ip-booting-text">Booting{dots}</div>
          )}
        </motion.div>

        {/* ── GUI disk ── */}
        <motion.div
          className={[
            'ip-disk ip-disk-gui',
            selected === 'gui' ? 'ip-selected' : '',
            booting  && selected === 'gui' ? 'ip-booting' : '',
          ].join(' ')}
          onClick={() => boot('gui')}
          whileHover={!booting ? { y: -6 } : {}}
          whileTap={!booting ? { scale: 0.97 } : {}}
        >
          <div className="ip-disk-num">[2]</div>

          <div className="ip-icon-wrap ip-icon-gui">
            <span className="ip-icon-text">{IS_MOBILE ? '⬡' : '⌘'}</span>
          </div>

          <div className="ip-disk-name ip-blue">{IS_MOBILE ? 'iOS_UI' : 'macOS_UI'}</div>
          <div className="ip-disk-tag">[ NORMIE MODE ]</div>
          <div className="ip-disk-desc">
            {IS_MOBILE ? 'iOS-style home screen.' : 'macOS-style desktop.'}<br />
            Pretty. Clickable. Easy.
          </div>

          {selected === 'gui' && !booting && (
            <div className="ip-check ip-blue">✓ Selected — press ENTER</div>
          )}
          {booting && selected === 'gui' && (
            <div className="ip-booting-text">Booting{dots}</div>
          )}
        </motion.div>
      </div>

      <div className="ip-footer">
        Click or press [1] [2] to select · ← → arrows to navigate · ENTER to boot
      </div>
    </motion.div>
  );
}
