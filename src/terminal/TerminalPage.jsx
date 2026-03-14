import React, { useState, useEffect, useRef, useCallback } from 'react';
import './terminal.css';
import { parseCommand } from './parseCommand';
import { commands } from './commands';
import MatrixCanvas from '../components/MatrixCanvas';

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

let lineIdCounter = 0;
const makeId = () => ++lineIdCounter;

export default function TerminalPage({ onLaunch, onLegacy, skipBoot }) {
  const [outputLines, setOutputLines] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const skipRef = useRef(false);
  const bootDoneRef = useRef(false);

  const addLine = useCallback((text, type = 'system') => {
    setOutputLines(prev => [...prev, { text, type, id: makeId() }]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputLines([]);
  }, []);

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

    // Echo the input line
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
          clearOutput,
          onLaunch,
          onMatrix: () => setIsMatrixActive(true),
          onLegacy,
        });
      } else {
        addLine(`command not found: ${raw}`, 'error');
        addLine("Type 'help' for available commands.", 'system');
      }
    }

    setInputValue('');
    setHistoryIndex(-1);
  }, [inputValue, addLine, clearOutput, onLaunch, onLegacy]);

  // ── Keyboard handling ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (isBooting) {
      if (e.key === 'Enter') skipBoot_();
      return;
    }

    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCmdHistory(prev => {
        const newIndex = Math.min(historyIndex + 1, prev.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(prev[newIndex] ?? '');
        return prev;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInputValue(newIndex === -1 ? '' : cmdHistory[newIndex] ?? '');
    }
  }, [isBooting, historyIndex, cmdHistory, handleSubmit, skipBoot_]);

  return (
    <div
      className="terminal-container"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="terminal-scanlines" />

      {/* Scrollable output area */}
      <div className="terminal-output">
        {outputLines.map(({ text, type, id }) => (
          <div key={id} className={`terminal-line terminal-${type}`}>
            {text || '\u00A0'}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row — only visible after boot */}
      {!isBooting && (
        <div className="terminal-input-row">
          <span className="terminal-prompt">visitor@randip:~$</span>
          <span className="terminal-input-text">{inputValue}</span>
          <span className="terminal-cursor" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-hidden-input"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            inputMode="text"
            aria-label="Terminal input"
          />
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

      {/* Boot skip hint */}
      {isBooting && (
        <>
          <div className="terminal-skip-hint">Press Enter to skip</div>
          {/* Invisible input to capture Enter during boot */}
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
