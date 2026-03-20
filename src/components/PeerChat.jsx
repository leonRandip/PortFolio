import React, { useState, useEffect, useRef } from 'react';
import './PeerChat.css';

export default function PeerChat({ wsRef, roomId, role, messages, onSend, unread, onOpen }) {
  const [collapsed, setCollapsed] = useState(true);
  const [input, setInput]         = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError]         = useState('');
  const listRef                   = useRef(null);
  const inputRef                  = useRef(null);
  const errorTimerRef             = useRef(null);

  const myLabel   = role === 'host' ? 'visitor1@randip' : 'visitor2@randip';
  const peerLabel = role === 'host' ? 'visitor2@randip' : 'visitor1@randip';

  // Poll WebSocket readyState every 500ms to update connection indicator
  useEffect(() => {
    const id = setInterval(() => {
      setConnected(wsRef.current?.readyState === 1);
    }, 500);
    return () => clearInterval(id);
  }, [wsRef]);

  // Auto-scroll messages list when new messages arrive and panel is open
  useEffect(() => {
    if (!collapsed && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, collapsed]);

  const handleOpen = () => {
    setCollapsed(false);
    onOpen?.();
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const showError = (msg) => {
    setError(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 2500);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      showError('Not connected — wait for session to establish');
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'room_chat', roomId, text }));
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); send(); }
  };

  return (
    <div
      className={`peer-chat${collapsed ? ' peer-chat--collapsed' : ''}`}
      onClick={e => e.stopPropagation()}
    >
      {/* Header bar */}
      <div
        className="peer-chat__header"
        onClick={collapsed ? handleOpen : () => setCollapsed(true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && (collapsed ? handleOpen() : setCollapsed(true))}
      >
        <span className="peer-chat__title">
          &#9632; CHAT &mdash; {roomId}
        </span>
        <span className="peer-chat__controls">
          <span className={`peer-chat__status ${connected ? 'peer-chat__status--ok' : 'peer-chat__status--err'}`}>
            ● {connected ? 'live' : 'offline'}
          </span>
          {collapsed && unread > 0 && (
            <span className="peer-chat__badge">{unread}</span>
          )}
          <span className="peer-chat__toggle">{collapsed ? '▲' : '▼'}</span>
        </span>
      </div>

      {/* Body — hidden when collapsed */}
      {!collapsed && (
        <>
          <div className="peer-chat__messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="peer-chat__empty">No messages yet. Say hi!</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`peer-chat__msg peer-chat__msg--${m.from}`}
              >
                <span className="peer-chat__msg-label">
                  {m.from === 'me' ? myLabel : peerLabel}
                </span>
                <span className="peer-chat__msg-text">{m.text}</span>
              </div>
            ))}
          </div>

          <div className="peer-chat__input-row">
            <input
              ref={inputRef}
              className="peer-chat__input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? 'type a message...' : 'waiting for connection...'}
              maxLength={500}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              className="peer-chat__send"
              onClick={send}
              tabIndex={-1}
              aria-label="Send message"
            >
              &#9658;
            </button>
          </div>

          {error && (
            <div className="peer-chat__error">{error}</div>
          )}
        </>
      )}
    </div>
  );
}
