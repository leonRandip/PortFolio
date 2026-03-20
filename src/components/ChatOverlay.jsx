import React, { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://portfolio-4myk.onrender.com/ws';

const overlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: '#000',
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  color: '#00ff41',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 2rem 1rem',
  fontSize: '0.82rem',
};

const GORDON = {
  accent:      '#ff4500',
  dim:         'rgba(255,69,0,0.35)',
  border:      'rgba(255,69,0,0.25)',
  label:       '[GORDON]',
  header:      '[GORDON RAMSAY] Unhinged Mode v1.0',
  statusReady: 'fury loaded',
  placeholder: 'Type something. I dare you.',
  exitMsg:     'GORDON: Get out of my kitchen.',
  disclaimer:  '\u26A0 WARNING: Gordon has entered Unhinged Mode. Feelings will not be spared.',
  msgColor:    '#ffcfb3',
};

const JARVIS = {
  accent:      '#ffb800',
  dim:         'rgba(0,255,65,0.4)',
  border:      'rgba(0,255,65,0.2)',
  label:       '[JARVIS]',
  header:      '[JARVIS] randip-agent v1.0',
  statusReady: 'knowledge loaded',
  placeholder: 'Ask me anything...',
  exitMsg:     'JARVIS: session terminated.',
  disclaimer:  null,
  msgColor:    '#00ff41',
};

export default function ChatOverlay({ onClose, mode = 'jarvis' }) {
  const cfg = mode === 'gordon' ? GORDON : JARVIS;

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const [wsStatus, setWsStatus]   = useState('connecting'); // 'connecting' | 'open' | 'error'

  const wsRef       = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const onCloseRef  = useRef(onClose);
  const retriesRef  = useRef(0);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // ── WebSocket setup ─────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('open');
      retriesRef.current = 0;
      console.log('[ChatOverlay] WS connected');
    };

    ws.onmessage = (event) => {
      let payload;
      try { payload = JSON.parse(event.data); } catch { return; }

      if (payload.type === 'token') {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'agent') {
            return [...prev.slice(0, -1), { ...last, content: last.content + payload.content }];
          }
          return [...prev, { role: 'agent', content: payload.content }];
        });
      } else if (payload.type === 'done') {
        setStreaming(false);
      } else if (payload.type === 'error') {
        setMessages(prev => [...prev, { role: 'agent', content: `[ERROR] ${payload.message}` }]);
        setStreaming(false);
      }
    };

    ws.onerror = () => {
      setWsStatus('error');
    };

    ws.onclose = () => {
      // Single reconnect attempt
      if (retriesRef.current < 1) {
        retriesRef.current++;
        setTimeout(connect, 1500);
      } else {
        setWsStatus('error');
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  // ── Keyboard: Escape exits ──────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape') onCloseRef.current(cfg.exitMsg);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // ── Auto-scroll to bottom ───────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input on mount ────────────────────────────────────────────────────
  useEffect(() => {
    // Double-rAF ensures the overlay is painted before we steal focus,
    // which matters on iOS where programmatic focus needs the paint cycle.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    });
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setMessages(prev => [...prev, { role: 'agent', content: `${cfg.label} I'm not connected right now. Try again in a moment.` }]);
      return;
    }
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setStreaming(true);
    wsRef.current.send(JSON.stringify({ type: 'chat', message: text, mode }));
  }, [input, streaming]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  // ── Status colour ───────────────────────────────────────────────────────────
  const statusColor = wsStatus === 'open' ? '#00ff41' : wsStatus === 'error' ? '#ff4444' : '#ffb800';
  const statusText  = wsStatus === 'open' ? cfg.statusReady : wsStatus === 'error' ? 'connection failed' : 'connecting...';

  return (
    <div style={overlay} onClick={e => { e.stopPropagation(); inputRef.current?.focus(); }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ color: cfg.accent, marginBottom: '0.4rem', letterSpacing: '0.06em', flexShrink: 0 }}>
        {cfg.header}
        <span style={{ color: statusColor, marginLeft: '1rem', fontSize: '0.72rem' }}>
          ● {statusText}
        </span>
      </div>
      <div style={{ borderTop: `1px solid ${cfg.border}`, marginBottom: cfg.disclaimer ? '0.4rem' : '0.75rem', flexShrink: 0 }} />

      {/* ── Gordon disclaimer ───────────────────────────────────────────── */}
      {cfg.disclaimer && (
        <div style={{ color: cfg.accent, fontSize: '0.74rem', marginBottom: '0.6rem', fontWeight: 'bold', flexShrink: 0 }}>
          {cfg.disclaimer}
        </div>
      )}

      {/* ── Message history ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: '0.5rem' }}>
        {messages.length === 0 && (
          <div style={{ color: cfg.dim, fontSize: '0.76rem', marginTop: '0.5rem' }}>
            {mode === 'gordon'
              ? "Say something. He's watching. He's judging."
              : "Ask me about Randip's skills, projects, experience, or anything else."}
            <br />Press Esc to exit.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            {msg.role === 'user' ? (
              <div style={{ color: '#ffffff' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: '0.5rem' }}>visitor@randip:</span>
                {msg.content}
              </div>
            ) : (
              <div style={{ color: cfg.msgColor, paddingLeft: '1rem', borderLeft: `2px solid ${cfg.border}` }}>
                <span style={{ color: cfg.accent, marginRight: '0.5rem' }}>{cfg.label}</span>
                <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
              </div>
            )}
          </div>
        ))}

        {/* Streaming indicator */}
        {streaming && (
          <div style={{ color: cfg.accent, paddingLeft: '1rem', borderLeft: `2px solid ${cfg.border}` }}>
            <span style={{ marginRight: '0.5rem' }}>{cfg.label}</span>
            <span className="jarvis-typing">...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${cfg.border}`, margin: '0.5rem 0', flexShrink: 0 }} />

      {/* ── Input row ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{ color: mode === 'gordon' ? cfg.accent : '#00ff41', flexShrink: 0 }}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
          placeholder={streaming ? '' : cfg.placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: '0.82rem',
            letterSpacing: '0.025em',
            caretColor: mode === 'gordon' ? cfg.accent : '#00ff41',
          }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', flexShrink: 0 }}>
          Esc exit
        </span>
      </div>

      {/* Blinking cursor dot when streaming */}
      <style>{`
        .jarvis-typing { animation: jarvisBlink 0.8s step-end infinite; }
        @keyframes jarvisBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
