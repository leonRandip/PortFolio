# Future Plans — randip-leon/portfolio

> Implementation roadmap for upcoming terminal features.
> Each section covers requirements, architecture, phases, risks, and complexity.

---

## Feature 1: Terminal Multiplayer

### Overview
Two visitors can type in the same terminal session simultaneously via WebSocket. Both see each other's keystrokes in real-time with colour-coded prompts. Wild conversation starter — the terminal becomes a shared space.

### Requirements
- Session rooms identified by a short shareable code (e.g. `ABC-42`)
- Visitor 1 spawns a session and shares the URL/code; Visitor 2 joins via `join <code>`
- Each visitor gets a distinct prompt colour and label (`visitor1@randip` / `visitor2@randip`)
- Both see all output — commands run by either party appear for both
- Command execution happens server-side (only host can run commands; guest sees output)
- Session expires after 30 min of inactivity
- Max 2 participants per room (portfolio vibe, not a chat app)

### Architecture

```
Frontend (React)
  └─ TerminalPage
       ├─ multiplayerSession state { roomId, role: 'host'|'guest', peerLabel }
       └─ sends/receives { type: 'keystroke' | 'command' | 'output' | 'peer_joined' | 'peer_left' }

Backend (existing Express + ws server)
  └─ rooms Map<roomId, { host: ws, guest: ws | null, lastActivity: Date }>
       ├─ POST /rooms         → creates room, returns roomId
       ├─ WS join { roomId }  → attaches guest to room
       └─ broadcast()         → fans message out to both sockets

Commands
  └─ `session start` → creates room, prints shareable link
  └─ `session join <code>` → connects as guest
  └─ `session end` → destroys room
```

### Implementation Phases

**Phase 1 — Backend room manager**
- Add `rooms.js` to `backend/lib/` — Map-based room store with TTL cleanup
- `POST /rooms` creates a 6-char alphanumeric room ID
- WS protocol extended: on `{ type: 'join', roomId }` attach socket to room
- `broadcast(roomId, payload, senderWs)` fans to the other socket
- Heartbeat ping every 20s; clear room on both sockets closing

**Phase 2 — Frontend session state**
- Add `multiplayerMode` state to `TerminalPage` (`null | { roomId, role }`)
- When active, input changes are sent as `{ type: 'keystroke', value }` before Enter
- Received `keystroke` events render a ghost line for the peer (dimmer colour, peer label)
- Received `output` events append to local `outputLines`

**Phase 3 — Commands**
- `session start` → calls `POST /rooms`, stores roomId, prints:
  ```
  [NET] Session created. Share this code: ABC-42
  [NET] Waiting for guest... (expires in 30 min)
  ```
- `session join <code>` → sends WS join, on `peer_joined` both terminals print:
  ```
  [NET] visitor2@randip has joined the session.
  ```
- `session end` / Escape → graceful teardown with broadcast

**Phase 4 — UX polish**
- Peer's label shown in a different colour (e.g. `#00cfff`) vs host (`#00ff41`)
- Peer typing indicator: `visitor2@randip is typing...` while keystroke stream active
- Add `session` to help table and autocomplete

### Risks
- **HIGH**: Render free tier spins down — multiplayer needs persistent WS. Consider upgrading or using Fly.io
- **MEDIUM**: Race conditions if both users submit at the same millisecond — queue commands per room
- **LOW**: Room code collisions — use `nanoid` with 6 chars (68B combinations, fine at this scale)

### Complexity: MEDIUM
- Backend: ~150 lines
- Frontend: ~80 lines across TerminalPage + commands
- No new dependencies beyond existing ws server

---

## Feature 2: Ambient Sound Mode

### Overview
Atmospheric audio layer tied to terminal interactions — keystrokes, command execution, certain processes, and overlays each have their own sound. Adds serious hacker-movie atmosphere.

### Requirements
- Toggle via `sound on` / `sound off` command (off by default, persisted to localStorage)
- Keystroke tick (subtle, like a mechanical keyboard)
- Enter/submit: distinct confirm sound
- Error output: glitch/buzz sound
- `hack` command: full dramatic sequence audio (already has visuals)
- `matrix` command: digital rain ambience loop while active
- `top` command: subtle CPU fan whir while active
- JARVIS/Gordon: connection beep on open, disconnect on close
- BrickBreaker: paddle hit, brick break, ball bounce, game over, level up
- Boot sequence: BIOS beep at start, rising completion chime

### Architecture

```
src/audio/
  ├─ soundEngine.js       — singleton AudioContext, load/play/loop/stop API
  ├─ sounds/              — source audio files (mp3/ogg, <50KB each)
  │    ├─ keystroke.mp3
  │    ├─ submit.mp3
  │    ├─ error.mp3
  │    ├─ boot-beep.mp3
  │    ├─ boot-complete.mp3
  │    ├─ hack-ambient.mp3
  │    ├─ matrix-loop.mp3
  │    ├─ cpu-fan.mp3
  │    ├─ jarvis-connect.mp3
  │    ├─ jarvis-disconnect.mp3
  │    ├─ brick-hit.mp3
  │    ├─ brick-break.mp3
  │    └─ game-over.mp3
  └─ useSoundEnabled.js   — React hook reading/writing localStorage 'sound'
```

**`soundEngine.js` API:**
```js
soundEngine.play('keystroke')     // one-shot
soundEngine.loop('matrix-loop')   // returns stopFn
soundEngine.stop('matrix-loop')
soundEngine.setVolume(0.4)
soundEngine.isEnabled()           // reads localStorage
```

### Implementation Phases

**Phase 1 — Sound engine**
- `soundEngine.js`: lazy AudioContext creation (fixes autoplay policy — only init on first user gesture), preload all assets via `AudioBuffer`, cache in a Map
- `useSoundEnabled` hook: reads `localStorage.getItem('sound') === 'on'`, exposes `[enabled, toggle]`

**Phase 2 — Source audio**
- Source or generate royalty-free sounds (recommend: freesound.org CC0 sounds or Web Audio API procedural generation for keystrokes/beeps to keep bundle small)
- Keystroke: generate procedurally with Web Audio (no file needed — white noise burst, 8ms, filtered)
- Boot beep: 440Hz sine, 80ms
- Others: small MP3s, ≤30KB each

**Phase 3 — Wire into components**
- `TerminalPage`: keystroke tick in `onChange`, submit sound on Enter, error sound when `addLine(..., 'error')`
- `TerminalPage` boot: beep at line 0, chime at `[SYS] System ready.`
- `HackSequence`: import and play `hack-ambient` on mount, stop on unmount
- `MatrixCanvas`: loop `matrix-loop` on mount, stop on unmount
- `TopProcess`: loop `cpu-fan` on mount, stop on unmount
- `ChatOverlay`: `jarvis-connect` on WS open, `jarvis-disconnect` on close
- `BrickBreaker`: wire sounds to game events

**Phase 4 — Commands + UI**
- `sound on` / `sound off` commands in `commands.js`
- Small `[SFX ON]` / `[SFX OFF]` indicator in terminal header corner (CSS only, no new component)
- Persist preference across sessions via localStorage

### Risks
- **HIGH**: Autoplay policy — AudioContext must be created inside a user gesture. First keystroke or click initialises it; subsequent calls work fine
- **MEDIUM**: Bundle size — all MP3s loaded eagerly. Fix with lazy loading (only load a sound when first needed)
- **LOW**: iOS quirks — use `webkitAudioContext` fallback, already handled by most wrappers

### Complexity: MEDIUM
- Engine: ~100 lines
- Wiring: ~50 lines spread across 6 components
- Audio assets: sourcing/generating takes most of the time

---

## Feature 3: Miss Minutes Theme (TVA / Loki)

### Overview
A full theme switcher with a "Time Variance Authority" skin — deep amber/orange palette, TVA bureaucratic typography, and Miss Minutes as an in-terminal AI assistant who reacts to commands with TVA flavour.

### Requirements
- `theme tva` / `theme default` commands to switch
- Theme persisted in localStorage
- TVA colour palette: `#FF6B00` (amber), `#FFB347` (gold), `#1A0A00` (deep brown-black background), `#FF8C00` (accent)
- Typography: monospace stays but accent headings feel like TVA paperwork stamps
- Miss Minutes assistant: activated by `minutes` command (like `jarvis` / `gordon`)
- Miss Minutes reacts to ANY other terminal command typed while TVA theme is active with TVA-flavoured commentary (optional ambient mode)
- Miss Minutes personality: Southern-belle charm, ominous undercurrent, TVA bureaucracy obsession, "sugah" / "honey" / "the Sacred Timeline" references
- On `theme tva` activation: dramatic TVA intro sequence (scanline flash, amber flood, Miss Minutes greeting)

### Architecture

```
src/themes/
  ├─ themes.js            — theme definitions { id, cssVars, label }
  └─ useTheme.js          — hook: reads localStorage, applies CSS vars to :root

backend/lib/chat.js
  └─ MINUTES_PROMPT       — Miss Minutes system prompt (no RAG, pure personality)
  └─ streamMinutes()      — same pattern as streamGordon

ChatOverlay.jsx
  └─ mode='minutes'       — amber palette config entry

commands.js
  └─ 'theme'              — subcommand dispatch ('tva' | 'default')
  └─ 'minutes'            — launches Miss Minutes overlay
```

**CSS variable approach** — all colours in `terminal.css` become vars:
```css
:root {
  --term-bg:      #000000;
  --term-fg:      #00ff41;
  --term-accent:  #ffb800;
  --term-error:   #ff4444;
  --term-success: #00ff41;
  --term-dim:     rgba(0,255,65,0.35);
}
/* TVA theme applied via JS: document.documentElement.style.setProperty('--term-bg', '#1A0A00') */
```

### Implementation Phases

**Phase 1 — CSS variable refactor**
- Replace all hardcoded colour values in `terminal.css` with `var(--term-*)` tokens
- Define default values on `:root`
- Do the same in `ChatOverlay.jsx` inline styles (replace hex literals with CSS vars where possible)

**Phase 2 — Theme engine**
- `themes.js`: export `THEMES` object with `default` and `tva` entries, each a flat map of CSS var → value
- `useTheme.js`: reads `localStorage.getItem('theme')`, calls `applyTheme(id)` which loops the var map and sets on `:root`
- Call `useTheme()` at the top of `TerminalPage`

**Phase 3 — TVA activation sequence**
- `theme tva` command triggers a staggered sequence:
  ```
  [TVA] Initiating temporal reset...
  [TVA] You've been living outside of time, sugah.
  [TVA] Welcome to the Time Variance Authority.
  ```
- Then applies theme vars, changes prompt to `tva-agent@sacred-timeline:~$`
- Scanline overlay colour shifts to amber

**Phase 4 — Miss Minutes assistant**
- `MINUTES_PROMPT` in `backend/lib/chat.js`: Southern belle, TVA bureaucrat, ominous warmth, 1-2 sentences max
- `streamMinutes()` export — no RAG, `temperature: 0.9`, `max_tokens: 100`
- Add `mode='minutes'` config to `ChatOverlay.jsx` (amber `#FF6B00` accent, `[MISS MINUTES]` label, header `"TVA — Miss Minutes v∞"`)
- `minutes` command in `commands.js` → `onMinutes?.()`
- Server routes `payload.mode === 'minutes'` → `streamMinutes`

**Phase 5 — Ambient TVA commentary (stretch)**
- While TVA theme is active, certain commands trigger a one-liner from Miss Minutes printed in amber below the output
- e.g. running `hack` → `[MISS MINUTES] That's a TVA violation, sugah. We'll be seeing you.`
- Implemented as a post-command hook in `handleSubmit`: after output settles, if TVA theme active + command in `TVA_REACTIONS` map, append amber line

### Risks
- **MEDIUM**: CSS var refactor touches every colour in the app — needs careful testing across all components and overlays
- **MEDIUM**: Miss Minutes ambient commentary could feel spammy — gate it behind a `minutes verbose on/off` sub-setting
- **LOW**: Theme persistence across hard reload — straightforward localStorage

### Complexity: HIGH (mostly due to CSS var refactor)
- CSS refactor: ~2 hours
- Theme engine: ~50 lines
- Miss Minutes backend: ~40 lines
- TVA overlay sequence: ~30 lines
- Ambient commentary: ~40 lines

---

## Feature 4: "Hire Me" Easter Egg Flow

### Overview
A recruiter easter egg: typing `hire randip <message> @ <org>` locks the terminal, plays a dramatic multi-stage sequence, then fires an actual email notification to Randip — all without leaving the terminal.

### Requirements
- Command: `hire randip <message> @ <org>` — message and org both required
- On submit: terminal input locks (no further commands accepted during sequence)
- Sequence phases:
  1. Scramble/glitch effect on existing output
  2. `[SYS] INCOMING TRANSMISSION — PRIORITY: URGENT` flashing in red
  3. Fake "encrypting message"  progress bar
  4. `[NET] Routing to leonrandip@gmail.com...`
  5. Actual email fires via serverless function
  6. `[OK]  Message delivered. Randip has been notified.` in green
  7. Terminal unlocks with a witty sign-off line
- Email contains: sender message, org name, timestamp, visitor IP (from serverless context)
- Rate-limit: 1 hire attempt per IP per 24h (prevent spam)
- Graceful error: if email fails, show `[ERR] Transmission lost. Try leonrandip@gmail.com directly.`

### Architecture

```
Serverless function (Vercel Edge Function or existing Render backend)
  └─ POST /hire
       ├─ Body: { message, org, timestamp }
       ├─ Rate-limit: check Supabase 'hire_attempts' table (ip + created_at)
       ├─ Send email via Resend API (free tier: 3000/mo)
       └─ Returns: { ok: true } | { error: 'rate_limited' | 'send_failed' }

Supabase
  └─ hire_attempts table: id, ip, created_at
       └─ Row-level: delete rows older than 24h on insert (or pg_cron cleanup)

Frontend
  └─ commands.js: 'hire randip' parser + sequence runner
  └─ TerminalPage: isHireActive state (locks input during sequence)
```

**Email template (Resend)**
```
Subject: 🖥️ Terminal transmission from <org>

Someone typed into your terminal, Randip.

Message: <message>
Organization: <org>
Time: <timestamp>
IP: <ip>

---
Sent via randip-leon.dev terminal easter egg
```

### Implementation Phases

**Phase 1 — Supabase table**
```sql
create table hire_attempts (
  id         bigserial primary key,
  ip         text not null,
  created_at timestamptz default now()
);
create index on hire_attempts(ip, created_at);
```

**Phase 2 — Serverless endpoint**
- Add `POST /hire` to existing Render Express backend
- Parse `{ message, org }` from body, read IP from `req.headers['x-forwarded-for'] ?? req.socket.remoteAddress`
- Check `hire_attempts` for this IP in last 24h → 429 if hit
- Insert new row
- Call Resend API with email template
- Return `{ ok: true }` or appropriate error

**Phase 3 — Command parser**
- `parseCommand.js` already handles multi-word commands — add `'hire randip'` as a prefix match
- Parse: everything before `@` = message, everything after `@` = org; both required
- If missing parts: print usage hint without launching sequence

**Phase 4 — Dramatic sequence**
- `isHireActive` state in `TerminalPage` — while true, `handleKeyDown` returns early (terminal locked)
- Sequence via `stagger()`:
  ```
  [0]     clearOutput()
  [200]   '[SYS] ██ INCOMING TRANSMISSION ██'  (error colour, blinking via CSS)
  [700]   '[NET] Parsing payload...'
  [1200]  '[ENC] Encrypting message...  [████████░░]  80%'
  [1600]  '[ENC] Encrypting message...  [██████████] 100%'
  [2000]  '[NET] Routing to leonrandip@gmail.com...'
  [2000]  → fire fetch POST /hire
  [3000]  (on response ok) '[OK]  Transmission received. Randip has been paged.'
  [3400]  '[SYS] "Bold move using a terminal to hire someone. I respect it."'
  [3800]  setIsHireActive(false)  ← unlock
  ```
- On error: skip to `[ERR]` line, unlock immediately

**Phase 5 — Resend integration**
- Sign up at resend.com (free: 3000 emails/mo, 100/day)
- Add `RESEND_API_KEY` to Render env vars
- `npm install resend` in backend
- ~15 lines to send the email

### Risks
- **HIGH**: Email spam — rate-limit by IP is the primary guard. Also add a honeypot: if `message` contains URLs or obvious spam patterns, silently drop and still show success UI
- **MEDIUM**: Render cold start during sequence — the `fetch POST /hire` might take 3-5s if server is cold. Add a longer timeout and show a `[NET] Establishing secure channel...` hold line while waiting
- **LOW**: IP spoofing via `x-forwarded-for` — acceptable at this scale; not a security-critical endpoint
- **LOW**: Resend free tier (100/day) — more than enough for a portfolio

### Complexity: LOW-MEDIUM
- Backend endpoint: ~60 lines
- Supabase table: 5 lines SQL
- Frontend sequence: ~50 lines
- Total: smallest of the four features

---

## Priority Order (suggested)

| # | Feature | Complexity | Impact |
|---|---------|------------|--------|
| 1 | **Hire Me Easter Egg** | Low-Medium | High — directly useful |
| 2 | **Ambient Sound Mode** | Medium | High — huge atmosphere boost |
| 3 | **Miss Minutes / TVA Theme** | High | High — most unique feature |
| 4 | **Terminal Multiplayer** | Medium | Medium — needs two people online simultaneously |
