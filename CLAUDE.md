# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend
npm run dev        # Vite dev server (localhost:5173)
npm run build      # Production build
npm run lint       # ESLint

# Backend (separate process)
cd backend && node server.js   # Express + WebSocket server on :3001

# E2E tests
npx playwright test
npx playwright test --ui        # Interactive mode
```

No unit test framework is configured — tests are Playwright E2E only.

## Environment

Frontend reads from `.env`:
- `VITE_RENDER_URL` — backend base URL (e.g. `https://portfolio-4myk.onrender.com`)
- `VITE_WS_URL` — WebSocket URL for the backend

Backend (`backend/.env`):
- `RESEND_API_KEY` — email delivery for `/hire` endpoint
- `INGEST_SECRET` — bearer token to protect `POST /ingest`
- `OPENAI_API_KEY` (or equivalent) — used by `backend/lib/chat.js` for AI chat streaming

## Architecture

The app has two distinct surfaces controlled by `App.jsx`:

**Terminal** (`src/terminal/`) — the default landing on desktop. A fully custom terminal emulator with:
- `TerminalPage.jsx` — master state: output lines, active overlays, multiplayer session, theme, sound
- `commands.js` — command registry (plain objects, not classes)
- `parseCommand.js` — multi-word prefix matching

**Portfolio** (`src/portfolio.jsx`) — the visual portfolio page launched from the terminal via the `launch` command, or directly on mobile.

### View Transitions
`App.jsx` owns a `view` state (`terminal | portfolio | deconstructing | legacy`) and drives animated transitions with Framer Motion. `DeconstructOverlay` plays a cinematic tear-down animation before returning to the terminal. `RetroPortfolio` is the "legacy" green-screen view.

### Terminal Overlays
Full-screen components mounted on top of `TerminalPage`, each gated by a boolean state:
- `MatrixCanvas` — digital rain
- `HackSequence` — hacking animation
- `TopProcess` — fake `top` process monitor
- `BrickBreaker` — playable game
- `ChatOverlay` — JARVIS or Gordon AI chat (mode prop)
- `MissMinutes` / `MissMinutes3D` — TVA assistant with optional 3D model
- `PeerChat` — multiplayer peer-to-peer chat panel

### Theme System
`src/themes/useTheme.js` reads `localStorage` and applies CSS custom properties to `:root`. `src/themes/themes.js` defines `default` and `tva` palettes. `TerminalPage` calls `useTheme()` and changes the prompt label based on the active theme.

### Sound Engine
`src/audio/soundEngine.js` is a singleton wrapping the Web Audio API. It lazy-inits the `AudioContext` on first user gesture (browser autoplay policy). Components call `soundEngine.play(key)` or `soundEngine.loop(key)`.

### Backend (`backend/server.js`)
Express + `ws` WebSocket server deployed on Render. Key routes:
- `GET /health` — wake-up ping (frontend fires this on mount)
- `POST /hire` — "Hire Me" easter egg; sends email via Resend, rate-limits by IP in-memory
- `POST /ingest` — re-indexes knowledge base (protected by `INGEST_SECRET`)
- WebSocket — handles AI chat streaming (`JARVIS`, `Gordon`, `Miss Minutes`) and multiplayer terminal sessions via rooms (`backend/lib/rooms.js`)

### Multiplayer Rooms
`backend/lib/rooms.js` manages a `Map<roomId, {host, guest}>`. The frontend tracks session state in `multiplayerMode` (`null | { roomId, role }`). `session start` / `session join <code>` / `session end` are terminal commands.
