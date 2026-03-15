import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './terminal.css';
import { parseCommand } from './parseCommand';
import { commands } from './commands';
import MatrixCanvas from '../components/MatrixCanvas';
import BashrcPopup from '../components/BashrcPopup';
import HackSequence from '../components/HackSequence';
import TopProcess from '../components/TopProcess';
import BrickBreaker from '../components/BrickBreaker';
import ChatOverlay from '../components/ChatOverlay';

const BOOT_SEQUENCE = [
  { text: '[BIOS] Initializing hardware...', delay: 0 },
  { text: '[BIOS] Memory check: 16384 MB OK', delay: 160 },
  { text: '[BOOT] Loading kernel modules...', delay: 380 },
  { text: '[BOOT] Mounting filesystem...    OK', delay: 640 },
  { text: '[NET]  Network interface eth0: connected', delay: 960 },
  { text: '[SYS]  Starting randip-leon/portfolio v2.0.0', delay: 1280 },
  { text: '[SYS]  System ready.', delay: 1680 },
  { text: '', delay: 1950 },
  { text: "Welcome. Type 'help' for available commands.", delay: 2060 },
  { text: '', delay: 2200 },
];

const REINIT_SEQUENCE = [
  { text: '[SYS] Re-initializing terminal...', delay: 0 },
  { text: '[OK]  Session restored.', delay: 280 },
  { text: '', delay: 440 },
];

// Module-level: computed once, not per render
const COMMAND_KEYS = Object.keys(commands);

let lineIdCounter = 0;
const makeId = () => ++lineIdCounter;

export default function TerminalPage({ onLaunch, onLegacy, skipBoot }) {
  const [outputLines, setOutputLines] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isBashrcActive, setIsBashrcActive] = useState(false);
  const [isHackActive, setIsHackActive] = useState(false);
  const [isTopActive, setIsTopActive] = useState(false);
  const [isBrickBreakerActive, setIsBrickBreakerActive] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isGordonActive, setIsGordonActive] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const containerRef   = useRef(null);
  const skipRef        = useRef(false);
  const bootDoneRef    = useRef(false);

  // Read cursor + selection from the hidden input (after browser processes the event)
  const syncCursor = useCallback(() => {
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      setCursorPos(el.selectionStart ?? 0);
      setSelectionEnd(el.selectionEnd ?? 0);
    }, 0);
  }, []);

  const addLine = useCallback((text, type = 'system') => {
    setOutputLines(prev => [...prev, { text, type, id: makeId() }]);
  }, []);

  const addLink = useCallback((text, href, download) => {
    setOutputLines(prev => [...prev, { text, type: 'link', href, download, id: makeId() }]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputLines([]);
  }, []);

  // ── Autocomplete suggestion (derived, no extra state) ───────────────────────
  const suggestion = useMemo(() => {
    if (!inputValue || cursorPos !== inputValue.length) return '';
    const lower = inputValue.toLowerCase();
    const matches = COMMAND_KEYS.filter(k => k.startsWith(lower) && k !== lower);
    if (!matches.length) return '';
    matches.sort((a, b) => a.length - b.length);
    return matches[0];
  }, [inputValue, cursorPos]);

  // ── Boot sequence ──────────────────────────────────────────────────────────
  useEffect(() => {
    skipRef.current = false;
    bootDoneRef.current = false;

    const sequence = skipBoot ? REINIT_SEQUENCE : BOOT_SEQUENCE;
    const timers = [];

    sequence.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        if (skipRef.current) return;
        addLine(text, 'system');
      }, delay);
      timers.push(t);
    });

    const lastDelay = (sequence[sequence.length - 1]?.delay ?? 0) + 200;
    const doneTimer = setTimeout(() => {
      if (skipRef.current) return;
      bootDoneRef.current = true;
      setIsBooting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, lastDelay);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [skipBoot, addLine]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines]);

  // ── Restore terminal focus whenever any overlay closes ─────────────────────
  useEffect(() => {
    if (!isChatActive && !isGordonActive && !isHackActive && !isTopActive && !isBrickBreakerActive && !isMatrixActive) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isChatActive, isGordonActive, isHackActive, isTopActive, isBrickBreakerActive, isMatrixActive]);

  // ── Keyboard-aware resize (mobile) ────────────────────────────────────────
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      containerRef.current?.style.setProperty('--terminal-h', `${vv.height}px`);
      // Scroll output to bottom so input stays visible when keyboard opens
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // ── Skip boot ─────────────────────────────────────────────────────────────
  const skipBoot_ = useCallback(() => {
    skipRef.current = true;
    setOutputLines([]);
    setIsBooting(false);
    bootDoneRef.current = true;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Submit command ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const raw = inputValue.trim();

    addLine(`visitor@randip:~$ ${raw || ''}`, 'user');

    if (raw) {
      setCmdHistory(prev => [raw, ...prev]);
      setHistoryIndex(-1);

      const { command, args } = parseCommand(raw, commands);
      const handler = commands[command];

      if (handler) {
        handler({
          args,
          addOutput: addLine,
          addLink,
          clearOutput,
          onLaunch,
          onMatrix: () => setIsMatrixActive(true),
          onBashrc: () => setIsBashrcActive(true),
          onHack: () => setIsHackActive(true),
          onTop: () => setIsTopActive(true),
          onBrickBreaker: () => setIsBrickBreakerActive(true),
          onChat: () => setIsChatActive(true),
          onGordon: () => setIsGordonActive(true),
          onLegacy,
        });
      } else {
        addLine(`command not found: ${raw}`, 'error');
        addLine("Type 'help' for available commands.", 'system');
      }
    }

    setInputValue('');
    setCursorPos(0);
    setSelectionEnd(0);
    setHistoryIndex(-1);
  }, [inputValue, addLine, addLink, clearOutput, onLaunch, onLegacy]);

  // ── Keyboard handling ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (isBooting || isHackActive || isTopActive || isBrickBreakerActive || isChatActive || isGordonActive) {
      if (e.key === 'Enter' && isBooting) skipBoot_();
      return;
    }

    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCmdHistory(prev => {
        const newIndex = Math.min(historyIndex + 1, prev.length - 1);
        setHistoryIndex(newIndex);
        const val = prev[newIndex] ?? '';
        setInputValue(val);
        setCursorPos(val.length);
        setSelectionEnd(val.length);
        return prev;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      const val = newIndex === -1 ? '' : cmdHistory[newIndex] ?? '';
      setInputValue(val);
      setCursorPos(val.length);
      setSelectionEnd(val.length);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        setInputValue(suggestion);
        setCursorPos(suggestion.length);
        setSelectionEnd(suggestion.length);
      }
    } else if (
      e.key === ' ' &&
      suggestion &&
      window.matchMedia('(max-width: 768px)').matches
    ) {
      // Mobile: space completes the autocomplete suggestion instead of adding a space.
      // Only fires when ghost text is visible (suggestion !== ''), so typing
      // arguments after a completed command (e.g. "cowsay hello") is unaffected.
      e.preventDefault();
      setInputValue(suggestion);
      setCursorPos(suggestion.length);
      setSelectionEnd(suggestion.length);
    } else if (e.key === 'ArrowRight' && cursorPos === inputValue.length && suggestion) {
      e.preventDefault();
      setInputValue(suggestion);
      setCursorPos(suggestion.length);
      setSelectionEnd(suggestion.length);
    } else {
      syncCursor();
    }
  }, [isBooting, isHackActive, isTopActive, isBrickBreakerActive, isChatActive, isGordonActive, historyIndex, cmdHistory, handleSubmit, skipBoot_, syncCursor, suggestion, cursorPos, inputValue.length]);

  return (
    <div
      ref={containerRef}
      className="terminal-container"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-scanlines" />

      {/* Scrollable output area */}
      <div className="terminal-output">
        {outputLines.map((item) => (
          <div key={item.id} className={`terminal-line terminal-${item.type}`}>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                download={item.download || undefined}
                style={{ color: '#00ffff', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {item.text}
              </a>
            ) : (item.text || '\u00A0')}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row — only visible after boot */}
      {!isBooting && (
        <div className="terminal-input-row">
          <span className="terminal-prompt">visitor@randip:~$</span>

          {/* Cursor / selection rendering */}
          {cursorPos === selectionEnd ? (
            <>
              <span className="terminal-input-text">{inputValue.slice(0, cursorPos)}</span>
              <span className="terminal-cursor" />
              <span className="terminal-input-text">{inputValue.slice(cursorPos)}</span>
            </>
          ) : (
            <>
              <span className="terminal-input-text">{inputValue.slice(0, cursorPos)}</span>
              <span className="terminal-selected-text">{inputValue.slice(cursorPos, selectionEnd)}</span>
              <span className="terminal-input-text">{inputValue.slice(selectionEnd)}</span>
            </>
          )}

          {/* Autocomplete ghost text */}
          {suggestion && (
            <span className="terminal-ghost-text">
              {suggestion.slice(inputValue.length)}
            </span>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setCursorPos(e.target.selectionStart ?? e.target.value.length);
              setSelectionEnd(e.target.selectionEnd ?? e.target.value.length);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCursor}
            onSelect={e => {
              setCursorPos(e.target.selectionStart);
              setSelectionEnd(e.target.selectionEnd);
            }}
            className="terminal-hidden-input"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
            aria-label="Terminal input"
          />

          {/* Send button — mobile only (hidden via CSS on desktop) */}
          <button
            className="terminal-send-btn"
            onPointerDown={e => { e.preventDefault(); handleSubmit(); inputRef.current?.focus(); }}
            aria-label="Send"
            tabIndex={-1}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="#00ff41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Matrix overlay */}
      {isMatrixActive && (
        <MatrixCanvas
          onExit={() => {
            setIsMatrixActive(false);
            addLine('', 'system');
            addLine('Matrix exited.', 'system');
          }}
        />
      )}

      {/* .bashrc popup */}
      {isBashrcActive && (
        <BashrcPopup onClose={() => setIsBashrcActive(false)} />
      )}

      {/* Hack sequence overlay */}
      {isHackActive && (
        <HackSequence
          onClose={(msg) => {
            setIsHackActive(false);
            addLine(msg, 'success');
          }}
        />
      )}

      {/* JARVIS AI chat */}
      {isChatActive && (
        <ChatOverlay onClose={(msg) => {
          setIsChatActive(false);
          if (msg) addLine(msg, 'success');
        }} />
      )}

      {/* Gordon Ramsay mode */}
      {isGordonActive && (
        <ChatOverlay mode="gordon" onClose={(msg) => {
          setIsGordonActive(false);
          if (msg) addLine(msg, 'error');
        }} />
      )}

      {/* Top process monitor */}
      {isTopActive && (
        <TopProcess onClose={() => {
          setIsTopActive(false);
          addLine('', 'system');
          addLine('top: exited.', 'system');
        }} />
      )}

      {/* Brick Breaker game */}
      {isBrickBreakerActive && (
        <BrickBreaker onClose={(msg) => {
          setIsBrickBreakerActive(false);
          addLine(msg, 'success');
        }} />
      )}

      {/* Boot skip hint */}
      {isBooting && (
        <>
          <div className="terminal-skip-hint">Press Enter to skip</div>
          <input
            type="text"
            onKeyDown={handleKeyDown}
            style={{ position: 'fixed', opacity: 0, top: 0, left: 0, width: 1, height: 1, pointerEvents: 'none' }}
            autoFocus
            readOnly
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}
