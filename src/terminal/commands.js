// ─────────────────────────────────────────────────────────────────────────────
// Command registry
// Each key   = the full command string the user types
// Each value = handler(context) where context is:
//   { args, addOutput, addLink, clearOutput, onLaunch, onMatrix, onBashrc, onLegacy }
//
// To add a new command: add one entry here. That's it.
// ─────────────────────────────────────────────────────────────────────────────

// ── Project URLs ─────────────────────────────────────────────────────────────

const OPEN_PROJECTS = {
  'quiz':        'https://leonrandip.github.io/Quiz-Site/',
  'quiz-app':    'https://leonrandip.github.io/Quiz-Site/',
  'chatbot':     'https://personalised-chatbot.vercel.app',
  'ded-lift':    'https://ded-lift.vercel.app/',
  'soulstitch':  'https://soul-stitch.vercel.app/',
  'scrollr3f':   'https://scroll-r3f.vercel.app',
  'parkinsons':  'https://parkinsonsdetection.up.railway.app/',
};

// ── Fortune quotes ────────────────────────────────────────────────────────────

const FORTUNES = [
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
  '"It works on my machine." — Every Developer, always',
  '"Delete dead code before it deletes you." — unknown',
  '"console.log is a perfectly valid debugging strategy." — Randip, probably',
  '"Programming is the art of telling another human what one wants the computer to do." — Donald Knuth',
  '"The best code is no code at all." — Jeff Atwood',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"Software is never finished, only abandoned." — unknown',
  '"Before software can be reusable it first has to be usable." — Ralph Johnson',
  '"Simplicity is the soul of efficiency." — Austin Freeman',
  '"It\'s not a bug — it\'s an undocumented feature." — anonymous',
  '"The most disastrous thing that you can ever learn is your first programming language." — Alan Kay',
  '"Weeks of coding can save you hours of planning." — unknown',
];

// ── Backend URL (same env var used by TerminalPage + ChatOverlay) ────────────
const API_URL = import.meta.env.VITE_RENDER_URL || 'https://portfolio-4myk.onrender.com';

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomHex() {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase()
  ).join('  ');
}

function randomBase64Line() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const len = 48 + Math.floor(Math.random() * 16);
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '==';
}

function stagger(pairs) {
  pairs.forEach(([delay, fn]) => setTimeout(fn, delay));
}

// ── Skill → projects mapping ──────────────────────────────────────────────────

const SKILL_MAP = {
  JAVASCRIPT: [
    { path: './projects/quiz-app',            match: 'HTML, CSS, JAVASCRIPT' },
    { path: './projects/personalised-chatbot', match: 'HTML, CSS, JAVASCRIPT' },
  ],
  HTML: [
    { path: './projects/quiz-app',            match: 'HTML, CSS, JAVASCRIPT' },
    { path: './projects/personalised-chatbot', match: 'HTML, CSS, JAVASCRIPT' },
  ],
  CSS: [
    { path: './projects/quiz-app',            match: 'HTML, CSS, JAVASCRIPT' },
    { path: './projects/personalised-chatbot', match: 'HTML, CSS, JAVASCRIPT' },
  ],
  REACT: [
    { path: './projects/ded-lift',   match: 'MERN STACK (React)' },
    { path: './projects/soulstitch', match: 'REACT' },
    { path: './projects/scrollr3f',  match: 'REACT, REACT THREE FIBER' },
  ],
  MERN: [
    { path: './projects/ded-lift', match: 'MERN STACK' },
  ],
  PYTHON: [
    { path: './projects/parkinsons-detection', match: 'PYTHON, FLASK' },
  ],
  FLASK: [
    { path: './projects/parkinsons-detection', match: 'PYTHON, FLASK' },
  ],
  R3F: [
    { path: './projects/scrollr3f', match: 'REACT, REACT THREE FIBER' },
  ],
  REDUX: [
    { path: './skills/redux', match: 'REDUX (listed in skills — no dedicated project yet)' },
  ],
};

const SKILL_ALIASES = {
  JS: 'JAVASCRIPT', HTML5: 'HTML', CSS3: 'CSS',
  REACTJS: 'REACT', NODEJS: 'MERN', NODE: 'MERN',
  EXPRESS: 'MERN', EXPRESSJS: 'MERN', MONGODB: 'MERN',
  THREE: 'R3F', THREEJS: 'R3F',
};

function resolveSkill(term) {
  const canonical = SKILL_ALIASES[term] ?? term;
  return SKILL_MAP[canonical] ?? null;
}

// ── Shared finger handler ─────────────────────────────────────────────────────

function fingerHandler({ addOutput }) {
  const lines = [
    '',
    '  ┌─────────────────────────────────────────────────────────────┐',
    '  │  Login : randip           Name  : Maria Randip Leon         │',
    '  │  Shell : /bin/zsh         Home  : /home/randip              │',
    '  ├─────────────────────────────────────────────────────────────┤',
    '  │  Status : Hired @ yavar.ai — Frontend Dev Intern            │',
    '  │  After  : Open after internship concludes                   │',
    '  │  Hire me: leonrandip@gmail.com                              │',
    '  └─────────────────────────────────────────────────────────────┘',
    '',
  ];
  lines.forEach(l => addOutput(l, 'success'));
}

// ─────────────────────────────────────────────────────────────────────────────

export const commands = {

  // ── help ─────────────────────────────────────────────────────────────────────
  help: ({ addOutput }) => {
    const lines = [
      '',
      '  ┌─────────────────────────────────────────────────────────────────┐',
      '  │                      AVAILABLE COMMANDS                         │',
      '  ├─────────────────────────────────────────────────────────────────┤',
      '  │  sudo init project-black    Launch portfolio                    │',
      '  │  sudo init self-destruct    ...                                 │',
      '  │  whoami                     About me                            │',
      '  │  finger <name>              Status & contact info               │',
      '  │  ls                         List files                          │',
      '  │  ls -a                      List all files (incl. hidden)       │',
      '  │  ls portfolio/              Explore portfolio directory         │',
      '  │  cat <filename>             Read a file                         │',
      '  │  grep -r "<skill>" .        Search projects by skill            │',
      '  │  hack                       Initiate a breach sequence          │',
      '  │  fullscreen                 Toggle fullscreen mode              │',
      '  │  matrix                     Enter the Matrix                    │',
      '  │  timeline                   Career & education timeline         │',
      '  │  open <project>             Open a project in browser           │',
      '  │  contact                    Get in touch                        │',
      '  │  neofetch                   System info                         │',
      '  │  cowsay <text>              Make the cow speak                  │',
      '  │  fortune                    Random dev wisdom                   │',
      '  │  man randip                 Read the manual                     │',
      '  │  npm install randip         Install the developer               │',
      '  │  curl api.randip.dev/me     Fetch JSON profile                  │',
      '  │  chat                       Chat with JARVIS AI agent           │',
      '  │  jarvis                     Summon JARVIS directly              │',
      '  │  gordon                     Gordon Ramsay mode (unhinged)       │',
      '  │  minutes                    Summon Miss Minutes (TVA theme only) │',
      '  │  top                        Process monitor                     │',
      '  │  brickbreaker               Play brick breaker                  │',
      '  │  ssh guest@legacy           Connect to legacy portfolio         │',
      '  ├─────────────────────────────────────────────────────────────────┤',
      '  │  hire randip <msg> @ <org>  Hire Randip from the terminal       │',
      '  │  sound on / sound off       Toggle ambient sounds               │',
      '  │  theme tva / theme default  Switch terminal theme               │',
      '  │  session start              Start a multiplayer session         │',
      '  │  session join <code>        Join a multiplayer session          │',
      '  │  session end                End current session                 │',
      '  │  [chat panel appears bottom-right during active sessions]       │',
      '  ├─────────────────────────────────────────────────────────────────┤',
      '  │  clear                      Clear terminal                      │',
      '  │  help                       Show this message                   │',
      '  └─────────────────────────────────────────────────────────────────┘',
      '',
    ];
    lines.forEach(l => addOutput(l, 'system'));
  },

  // ── clear ─────────────────────────────────────────────────────────────────────
  clear: ({ clearOutput }) => {
    clearOutput();
  },

  // ── whoami ────────────────────────────────────────────────────────────────────
  whoami: ({ addOutput }) => {
    const lines = [
      '',
      '  Maria Randip Leon',
      '  ─────────────────────────────────────────────────',
      '  Full-Stack Web Developer',
      '  Currently employed @ yavar.ai — Frontend Dev Intern',
      '',
      '  Stack  →  React · Node.js · Express · MongoDB · PostgreSQL',
      '  Focus  →  Clean code, great UX, and scalable systems.',
      '',
    ];
    lines.forEach(l => addOutput(l, 'success'));
  },

  // ── sudo init project-black ───────────────────────────────────────────────────
  'sudo init project-black': ({ addOutput, onLaunch }) => {
    const lines = [
      '',
      '[AUTH] Authenticating credentials...',
      '[AUTH] Access granted.',
      '[SYS]  Initializing project-black...',
      '[SYS]  Loading assets...',
      '',
    ];
    lines.forEach((line, i) => setTimeout(() => addOutput(line, 'success'), i * 120));
    setTimeout(onLaunch, lines.length * 120 + 400);
  },

  // ── sudo init self-destruct ───────────────────────────────────────────────────
  'sudo init self-destruct': ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('[SYS] Initiating self-destruct sequence...', 'warning');
    addOutput('[WARN] This action is irreversible.', 'warning');

    let count = 3;
    const tick = () => {
      if (count > 0) {
        addOutput(`        Destruction in ${count}...`, 'error');
        count--;
        setTimeout(tick, 1000);
      } else {
        addOutput('        Executing...', 'error');
        setTimeout(() => {
          window.close();
          setTimeout(() => {
            addOutput('', 'error');
            addOutput('[ERROR] Permission denied. The browser refused to comply.', 'error');
            addOutput('        You are trapped here. Forever.', 'error');
            addOutput('', 'error');
          }, 300);
        }, 800);
      }
    };
    setTimeout(tick, 600);
  },

  // ── matrix ────────────────────────────────────────────────────────────────────
  matrix: ({ addOutput, onMatrix }) => {
    addOutput('', 'system');
    addOutput('[SYS] Entering the Matrix...', 'success');
    addOutput('      Press any key to exit.', 'system');
    addOutput('', 'system');
    setTimeout(() => onMatrix?.(), 500);
  },

  // ── ls ────────────────────────────────────────────────────────────────────────
  ls: ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('  portfolio/    resume.pdf    .bashrc', 'system');
    addOutput('', 'system');
    addOutput("  Tip: 'ls -a' reveals hidden files · 'ls portfolio/' to explore", 'warning');
    addOutput('', 'system');
  },

  // ── ls -a ─────────────────────────────────────────────────────────────────────
  'ls -a': ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('Scanning filesystem...', 'system');

    stagger([
      [350,  () => addOutput('[=====          ]  33%', 'system')],
      [700,  () => addOutput('[==========     ]  66%', 'system')],
      [1050, () => addOutput('[===============] 100%', 'system')],
      [1200, () => addOutput('', 'system')],
      [1300, () => addOutput('  .                           (current dir)', 'system')],
      [1380, () => addOutput('  ..                          (parent dir)', 'system')],
      [1460, () => addOutput('  portfolio/', 'system')],
      [1540, () => addOutput('  resume.pdf', 'system')],
      [1620, () => addOutput('  .bashrc', 'system')],
      [1700, () => addOutput('  .secret_crush               [HIDDEN]', 'warning')],
      [1780, () => addOutput('  .env_hopes_and_dreams       [HIDDEN]', 'warning')],
      [1900, () => addOutput('', 'system')],
      [1950, () => addOutput("  Type 'cat <filename>' to read file contents.", 'system')],
      [2000, () => addOutput('', 'system')],
    ]);
  },

  // ── ls portfolio/ ─────────────────────────────────────────────────────────────
  'ls portfolio/': ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('  top_secret.txt   [CLASSIFIED]', 'warning');
    addOutput('', 'system');
    addOutput("  Type 'cat portfolio/top_secret.txt' to read.", 'system');
    addOutput('', 'system');
  },

  // ── cat (bare) ────────────────────────────────────────────────────────────────
  cat: ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('Usage: cat <filename>', 'system');
    addOutput("Try:   cat resume.pdf", 'warning');
    addOutput("       cat .secret_crush", 'warning');
    addOutput("       cat .env_hopes_and_dreams", 'warning');
    addOutput("       cat portfolio/top_secret.txt", 'warning');
    addOutput('', 'system');
  },

  // ── cat resume.pdf ────────────────────────────────────────────────────────────
  'cat resume.pdf': ({ addOutput, addLink }) => {
    addOutput('', 'system');
    addOutput('[PDF] randips_resume.pdf  (44 KB)', 'success');
    addOutput('', 'system');
    addLink('  → [VIEW IN BROWSER]', '/files/randips_resume.pdf');
    addLink('  → [DOWNLOAD]', '/files/randips_resume.pdf', 'randips_resume.pdf');
    addOutput('', 'system');
  },

  // ── cat .bashrc ───────────────────────────────────────────────────────────────
  'cat .bashrc': ({ addOutput, onBashrc }) => {
    addOutput('', 'system');
    addOutput('[SYS] Opening ~/.bashrc...', 'system');
    setTimeout(() => onBashrc?.(), 400);
  },

  // ── cat .env_hopes_and_dreams ─────────────────────────────────────────────────
  'cat .env_hopes_and_dreams': ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('[SYS] Analyzing file: .env_hopes_and_dreams', 'warning');

    for (let i = 0; i < 6; i++) {
      setTimeout(() => addOutput(`  0x${randomHex()}`, 'system'), 200 + i * 150);
    }

    stagger([
      [1200, () => addOutput('', 'system')],
      [1250, () => addOutput('  ┌──────────────────────────────────────────────────────────┐', 'success')],
      [1300, () => addOutput('  │              .env_hopes_and_dreams                       │', 'success')],
      [1350, () => addOutput('  ├──────────────────────────────────────────────────────────┤', 'success')],
      [1400, () => addOutput('  │  CAREER_GOAL_01 = "Open a cafe —                         │', 'success')],
      [1450, () => addOutput('  │    a cozy space for people to connect"                   │', 'success')],
      [1500, () => addOutput('  │  CAREER_GOAL_02 = "Open a gym —                          │', 'success')],
      [1550, () => addOutput('  │    help people transform their lives"                    │', 'success')],
      [1600, () => addOutput('  │  CURRENT_PATH   = "Developer → Tech Lead → Entrepreneur" │', 'success')],
      [1650, () => addOutput('  │  STATUS         = "In progress. Building skills.         │', 'success')],
      [1700, () => addOutput('  │    Stacking capital."                                    │', 'success')],
      [1750, () => addOutput('  └──────────────────────────────────────────────────────────┘', 'success')],
      [1800, () => addOutput('', 'system')],
    ]);
  },

  // ── cat .secret_crush ─────────────────────────────────────────────────────────
  'cat .secret_crush': ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('[WARN] Accessing classified file: .secret_crush...', 'warning');

    const frames = ['/', '—', '\\', '|'];
    for (let i = 0; i < 13; i++) {
      setTimeout(
        () => addOutput(`  Searching... [${frames[i % frames.length]}]`, 'system'),
        400 + i * 200
      );
    }

    stagger([
      [3100, () => addOutput('', 'system')],
      [3150, () => addOutput('[ERR] Decryption failed. Information corrupted.', 'error')],
      [3250, () => addOutput('[ERR] The following fragment could not be recovered:', 'error')],
      [3350, () => addOutput('', 'error')],
      [3400, () => addOutput(`  ${randomBase64Line()}`, 'error')],
      [3450, () => addOutput(`  ${randomBase64Line()}`, 'error')],
      [3500, () => addOutput(`  ${randomBase64Line()}`, 'error')],
      [3550, () => addOutput(`  ${randomBase64Line()}`, 'error')],
      [3650, () => addOutput('', 'system')],
    ]);
  },

  // ── cat portfolio/top_secret.txt ──────────────────────────────────────────────
  'cat portfolio/top_secret.txt': ({ addOutput, addLink }) => {
    stagger([
      [0,   () => addOutput('', 'warning')],
      [50,  () => addOutput('  ██████████████████████████████████████████', 'warning')],
      [100, () => addOutput('  TOP SECRET // CLEARANCE LEVEL: PUBLIC     ', 'warning')],
      [150, () => addOutput('  ██████████████████████████████████████████', 'warning')],
      [250, () => addOutput('', 'warning')],
      [300, () => addOutput("  You found it. Here's the source of everything:", 'success')],
      [350, () => addLink('  → github.com/leonRandip', 'https://github.com/leonRandip')],
      [400, () => addOutput('', 'system')],
    ]);
  },

  // ── finger (bare) ─────────────────────────────────────────────────────────────
  finger: ({ addOutput }) => {
    addOutput('', 'system');
    addOutput('Usage: finger <username>', 'system');
    addOutput('Try:   finger randip', 'warning');
    addOutput('', 'system');
  },

  // ── finger <name> variants ────────────────────────────────────────────────────
  'finger randip':     fingerHandler,
  'finger maria':      fingerHandler,
  'finger leonrandip': fingerHandler,

  // ── ssh guest@legacy ──────────────────────────────────────────────────────────
  'ssh guest@legacy': ({ addOutput, onLegacy }) => {
    stagger([
      [0,    () => addOutput('', 'system')],
      [50,   () => addOutput('[NET] Connecting to legacy.randip-leon.dev...', 'system')],
      [650,  () => addOutput('[NET] Establishing SSH tunnel...', 'system')],
      [1250, () => addOutput('[OK]  Connected. Welcome, guest.', 'success')],
      [1800, () => addOutput('[SYS] Loading legacy interface...', 'system')],
      [2400, () => onLegacy?.()],
    ]);
  },

  // ── fullscreen ────────────────────────────────────────────────────────────────
  fullscreen: ({ addOutput }) => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        stagger([
          [0,   () => addOutput('', 'system')],
          [80,  () => addOutput('[SYS] Exiting fullscreen...', 'system')],
          [220, () => addOutput('[OK]  Fullscreen disabled.', 'success')],
          [320, () => addOutput('', 'system')],
        ]);
      } else {
        document.documentElement.requestFullscreen().catch(() => {
          addOutput('[ERR] Fullscreen request denied by browser.', 'error');
        });
        stagger([
          [0,   () => addOutput('', 'system')],
          [80,  () => addOutput('[SYS] Requesting fullscreen...', 'system')],
          [280, () => addOutput('[OK]  Fullscreen enabled. Press Esc to exit.', 'success')],
          [380, () => addOutput('', 'system')],
        ]);
      }
    } catch {
      addOutput('[ERR] Fullscreen not supported in this browser.', 'error');
    }
  },

  // ── hack ──────────────────────────────────────────────────────────────────────
  hack: ({ addOutput, onHack }) => {
    stagger([
      [0,    () => addOutput('', 'system')],
      [80,   () => addOutput('[NET] Scanning target network...', 'warning')],
      [380,  () => addOutput('[SYS] Identifying vulnerabilities...', 'warning')],
      [760,  () => addOutput('[SYS] Target located. Preparing breach.', 'warning')],
      [1100, () => addOutput('', 'system')],
    ]);
    setTimeout(() => onHack?.(), 1200);
  },

  // ── timeline ──────────────────────────────────────────────────────────────────
  timeline: ({ addOutput }) => {
    const lines = [
      [0,    ['', 'system']],
      [60,   ['  ──── CAREER / EDUCATION TIMELINE ────', 'success']],
      [120,  ['', 'system']],
      [200,  ['  2021  ┬  Started B.Tech IT @ Karpagam College of Engineering', 'warning']],
      [380,  ['        │', 'system']],
      [560,  ['  2022  ┤  Built Quiz App · Personalised Chatbot', 'warning']],
      [740,  ['        │', 'system']],
      [920,  ['  2023  ┤  Internship @ Prime Solutions — MERN Task Manager', 'warning']],
      [1100, ['        │  Built: Ded-Lift · SoulStitch · ScrollR3F', 'system']],
      [1280, ['        │', 'system']],
      [1460, ['  2024  ┤  Parkinsons Detection (Python + Flask)', 'warning']],
      [1640, ['        │  Frontend Dev Intern @ yavar.ai  ◀ current', 'system']],
      [1820, ['        │', 'system']],
      [2000, ['  2025  └  B.Tech IT graduation (expected)', 'warning']],
      [2180, ['', 'system']],
    ];
    lines.forEach(([delay, [text, type]]) => setTimeout(() => addOutput(text, type), delay));
  },

  // ── open ──────────────────────────────────────────────────────────────────────
  open: ({ args, addOutput, addLink }) => {
    if (!args || !args[0]) {
      addOutput('', 'system');
      addOutput('Usage: open <project-name>', 'system');
      addOutput('Available: ' + Object.keys(OPEN_PROJECTS).join(', '), 'warning');
      addOutput('', 'system');
      return;
    }
    const arg = args.join(' ').toLowerCase().trim();
    const key = Object.keys(OPEN_PROJECTS).find(k => k.includes(arg) || arg.includes(k));
    if (!key) {
      addOutput('', 'system');
      addOutput(`[ERR] Unknown project: "${arg}"`, 'error');
      addOutput('Available: ' + Object.keys(OPEN_PROJECTS).join(', '), 'warning');
      addOutput('', 'system');
      return;
    }
    const url = OPEN_PROJECTS[key];
    window.open(url, '_blank');
    stagger([
      [0,   () => addOutput('', 'system')],
      [60,  () => addOutput(`[SYS] Opening ${key}...`, 'system')],
      [200, () => addOutput(`[OK]  Launched in new tab.`, 'success')],
      [280, () => addLink(`  → ${url}`, url)],
      [360, () => addOutput('', 'system')],
    ]);
  },

  // ── contact ───────────────────────────────────────────────────────────────────
  contact: ({ addOutput, addLink }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [60,  () => addOutput('  ┌──────────────────────────────────────────────┐', 'success')],
      [120, () => addOutput('  │  CONTACT — Maria Randip Leon                 │', 'success')],
      [180, () => addOutput('  │                                              │', 'success')],
      [240, () => addLink(  '  │  ✉   leonrandip@gmail.com                    │', 'mailto:leonrandip@gmail.com')],
      [300, () => addLink(  '  │  in  linkedin.com/in/leonrandip              │', 'https://linkedin.com/in/leonrandip')],
      [360, () => addLink(  '  │  gh  github.com/leonRandip                   │', 'https://github.com/leonRandip')],
      [420, () => addOutput('  │                                              │', 'success')],
      [480, () => addOutput('  │  Response time: usually within 24h           │', 'success')],
      [540, () => addOutput('  └──────────────────────────────────────────────┘', 'success')],
      [600, () => addOutput('', 'system')],
    ]);
  },

  // ── neofetch ──────────────────────────────────────────────────────────────────
  neofetch: ({ addOutput }) => {
    const lines = [
      ['', 'system'],
      ['         .          visitor@randip', 'success'],
      ['        /X\\         ──────────────', 'success'],
      ['       /XXX\\        OS:       Arch btw', 'success'],
      ['      / XXX \\       Host:     randip-portfolio v2.0.0', 'success'],
      ['     /  XXX  \\      Shell:    zsh 5.9', 'success'],
      ['    /___XXX___\\     WM:       yavar.ai', 'success'],
      ['                    Uptime:   since 2021', 'success'],
      ['                    Packages: 1337 (npm)', 'success'],
      ['                    CPU:      Ryzen 5 3600 @ 3.60GHz', 'success'],
      ['                    Memory:   8192MiB / 16384MiB', 'success'],
      ['                    Theme:    Terminal Green', 'success'],
      ['', 'system'],
    ];
    lines.forEach(([text, type], i) => setTimeout(() => addOutput(text, type), i * 60));
  },

  // ── cowsay ────────────────────────────────────────────────────────────────────
  cowsay: ({ args, addOutput }) => {
    const text = args && args.length ? args.join(' ') : 'moo';
    const len = text.length;
    const top    = ' ' + '_'.repeat(len + 2);
    const middle = `< ${text} >`;
    const bottom = ' ' + '-'.repeat(len + 2);
    const lines = [
      '',
      top,
      middle,
      bottom,
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||',
      '',
    ];
    lines.forEach((l, i) => setTimeout(() => addOutput(l, 'system'), i * 40));
  },

  // ── fortune ───────────────────────────────────────────────────────────────────
  fortune: ({ addOutput }) => {
    const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    addOutput('', 'system');
    addOutput('  » ' + quote, 'success');
    addOutput('', 'system');
  },

  // ── man ───────────────────────────────────────────────────────────────────────
  man: ({ args, addOutput }) => {
    if (!args || !args[0] || args[0] !== 'randip') {
      addOutput('', 'system');
      addOutput('Usage: man randip', 'system');
      addOutput('', 'system');
      return;
    }
    // fall through to 'man randip' key
    addOutput('[ERR] use: man randip', 'error');
  },

  // ── man randip ────────────────────────────────────────────────────────────────
  'man randip': ({ addOutput }) => {
    const lines = [
      '',
      'RANDIP(1)              User Commands              RANDIP(1)',
      '',
      'NAME',
      '       randip - Full-Stack Developer & Frontend Intern',
      '',
      'SYNOPSIS',
      '       randip [--coffee] [--react] [--debug] [project]',
      '',
      'DESCRIPTION',
      '       Maria Randip Leon is a full-stack web developer currently',
      '       serving as a Frontend Dev Intern at yavar.ai. Specialises',
      '       in React, Node.js, Express, MongoDB, and PostgreSQL.',
      '',
      'OPTIONS',
      '       --coffee        Increases productivity by 200%',
      '       --react         Renders everything as a component',
      '       --mern          Deploys to prod at 2am',
      '       --overthink     Default flag. Cannot be disabled.',
      '',
      'BUGS',
      '       Occasionally over-engineers simple solutions.',
      '       See also: top(1) — check overthinking.exe CPU usage.',
      '',
      'SEE ALSO',
      '       whoami(1), finger(1), curl(1), fortune(1)',
      '',
      'RANDIP(1)               2025               RANDIP(1)',
      '',
    ];
    lines.forEach((l, i) => setTimeout(() => addOutput(l, 'system'), i * 40));
  },

  // ── npm install randip ────────────────────────────────────────────────────────
  'npm install randip': ({ addOutput }) => {
    stagger([
      [0,    () => addOutput('', 'system')],
      [80,   () => addOutput('npm warn deprecated node_feelings@∞: please stop', 'warning')],
      [400,  () => addOutput('npm notice ⠙ resolving dependencies...', 'system')],
      [900,  () => addOutput('npm notice ⠹ fetching packages...', 'system')],
      [1400, () => addOutput('npm notice ⠸ linking binaries...', 'system')],
      [1900, () => addOutput('added 9 packages in 4.2s', 'system')],
      [2100, () => addOutput('', 'system')],
      [2200, () => addOutput('randip@2.0.0', 'success')],
      [2300, () => addOutput('  ├── react@19.0.0', 'success')],
      [2400, () => addOutput('  ├── nodejs@22.0.0', 'success')],
      [2500, () => addOutput('  ├── express@5.0.0', 'success')],
      [2600, () => addOutput('  ├── mongodb@8.0.0', 'success')],
      [2700, () => addOutput('  ├── postgresql@16.0.0', 'success')],
      [2800, () => addOutput('  ├── css3@∞', 'success')],
      [2900, () => addOutput('  ├── zsh@5.9', 'success')],
      [3000, () => addOutput('  └── overthinking (optional peer dep, auto-installed)', 'success')],
      [3200, () => addOutput('', 'system')],
      [3300, () => addOutput('✓ randip installed successfully', 'success')],
      [3400, () => addOutput('', 'system')],
    ]);
  },

  // ── curl api.randip.dev/me ────────────────────────────────────────────────────
  'curl api.randip.dev/me': ({ addOutput }) => {
    const lines = [
      '',
      '{',
      '  "name": "Maria Randip Leon",',
      '  "alias": "randip",',
      '  "role": "Frontend Dev Intern @ yavar.ai",',
      '  "stack": ["React", "Node.js", "Express", "MongoDB", "PostgreSQL"],',
      '  "education": "B.Tech IT — Karpagam College of Engineering (2021–2025)",',
      '  "internships": ["Prime Solutions (2023)", "yavar.ai (current)"],',
      '  "projects": 6,',
      '  "github": "github.com/leonRandip",',
      '  "email": "leonrandip@gmail.com",',
      '  "status": "employed",',
      '  "open_to_work": false,',
      '  "coffee_dependency": true,',
      '  "goals": ["Tech Lead", "Entrepreneur", "Open a cafe", "Open a gym"]',
      '}',
      '',
    ];
    lines.forEach((l, i) => setTimeout(() => addOutput(l, 'success'), i * 40));
  },

  // ── chat ──────────────────────────────────────────────────────────────────────
  chat: ({ addOutput, onChat }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput('[JARVIS] Initializing randip-agent v1.0...', 'warning')],
      [320, () => addOutput('[JARVIS] Knowledge base loaded. Stand by.', 'warning')],
      [500, () => onChat?.()],
    ]);
  },

  // ── jarvis ────────────────────────────────────────────────────────────────────
  jarvis: ({ addOutput, onChat }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput("[JARVIS] Yes? I was hoping you'd call.", 'warning')],
      [400, () => onChat?.()],
    ]);
  },

  // ── gordon ────────────────────────────────────────────────────────────────────
  gordon: ({ addOutput, onGordon }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput('⚠ WARNING: Gordon has entered Unhinged Mode. Feelings will not be spared.', 'error')],
      [400, () => addOutput("[GORDON] This terminal is a bloody disaster. Let's see what you've got.", 'warning')],
      [650, () => onGordon?.()],
    ]);
  },

  // ── top ───────────────────────────────────────────────────────────────────────
  top: ({ addOutput, onTop }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput('[SYS] Launching process monitor...', 'system')],
      [200, () => onTop?.()],
    ]);
  },

  // ── brickbreaker ──────────────────────────────────────────────────────────────
  brickbreaker: ({ addOutput, onBrickBreaker }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput('[SYS] Loading Brick Breaker...', 'success')],
      [200, () => onBrickBreaker?.()],
    ]);
  },

  // ── hire randip ───────────────────────────────────────────────────────────────
  'hire randip': ({ args, addOutput, onHireLock, onHireUnlock }) => {
    const atIdx = args.indexOf('@');
    if (atIdx <= 0 || atIdx >= args.length - 1) {
      addOutput('', 'system');
      addOutput('Usage:   hire randip <message> @ <org>', 'warning');
      addOutput('Example: hire randip I love your portfolio @ Acme Corp', 'system');
      addOutput('', 'system');
      return;
    }

    const message = args.slice(0, atIdx).join(' ');
    const org     = args.slice(atIdx + 1).join(' ');

    onHireLock?.();

    stagger([
      [0,    () => addOutput('', 'system')],
      [80,   () => addOutput('  ██ INCOMING TRANSMISSION — PRIORITY: URGENT ██', 'error')],
      [600,  () => addOutput('[NET] Parsing payload...', 'system')],
      [1100, () => addOutput('[ENC] Encrypting message...  [████████░░]  80%', 'system')],
      [1550, () => addOutput('[ENC] Encrypting message...  [██████████] 100%', 'system')],
      [1900, () => addOutput('[NET] Routing to leonrandip@gmail.com...', 'system')],
      [1900, () => {
        fetch(`${API_URL}/hire`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ message, org }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.ok) {
              setTimeout(() => addOutput('[OK]  Transmission received. Randip has been paged.', 'success'), 900);
              setTimeout(() => addOutput('[SYS] "Bold move using a terminal to hire someone. I respect it."', 'warning'), 1300);
              setTimeout(() => onHireUnlock?.(), 1700);
            } else if (data.error === 'rate_limited') {
              setTimeout(() => addOutput('[ERR] One transmission per 24h, chief. Cool it.', 'error'), 300);
              setTimeout(() => onHireUnlock?.(), 700);
            } else {
              setTimeout(() => addOutput('[ERR] Transmission lost. Try leonrandip@gmail.com directly.', 'error'), 300);
              setTimeout(() => onHireUnlock?.(), 700);
            }
          })
          .catch(() => {
            setTimeout(() => addOutput('[ERR] Transmission lost. Try leonrandip@gmail.com directly.', 'error'), 2500);
            setTimeout(() => onHireUnlock?.(), 2900);
          });
      }],
    ]);
  },

  // ── sound on / off ────────────────────────────────────────────────────────────
  'sound on': ({ addOutput }) => {
    localStorage.setItem('sound', 'on');
    addOutput('', 'system');
    addOutput('[SFX] Ambient sounds enabled. Keystroke ticks and more.', 'success');
    addOutput("      Type 'sound off' to disable.", 'system');
    addOutput('', 'system');
  },

  'sound off': ({ addOutput }) => {
    localStorage.setItem('sound', 'off');
    addOutput('', 'system');
    addOutput('[SFX] Ambient sounds disabled.', 'system');
    addOutput('', 'system');
  },

  // ── theme tva / default ───────────────────────────────────────────────────────
  'theme tva': ({ addOutput, onTheme }) => {
    stagger([
      [0,    () => addOutput('', 'system')],
      [100,  () => addOutput('[TVA] Initiating temporal reset...', 'warning')],
      [550,  () => addOutput("[TVA] You've been living outside of time, sugah.", 'warning')],
      [1050, () => addOutput('[TVA] Welcome to the Time Variance Authority.', 'warning')],
      [1500, () => {
        onTheme?.('tva');
        addOutput('[TVA] Temporal realignment complete. Welcome aboard.', 'warning');
      }],
      [1900, () => addOutput('', 'system')],
    ]);
  },

  'theme default': ({ addOutput, onTheme }) => {
    onTheme?.('default');
    addOutput('', 'system');
    addOutput('[SYS] Theme reset to default.', 'system');
    addOutput('', 'system');
  },

  // ── minutes ───────────────────────────────────────────────────────────────────
  minutes: ({ addOutput }) => {
    stagger([
      [0,   () => addOutput('', 'system')],
      [80,  () => addOutput("[MINUTES] I'm already here, sugah. I see everything.", 'warning')],
      [320, () => addOutput('[MINUTES] Activate TVA theme to summon me: theme tva', 'warning')],
      [560, () => addOutput('', 'system')],
    ]);
  },

  // ── session start ─────────────────────────────────────────────────────────────
  'session start': ({ addOutput, onSessionStart }) => {
    addOutput('', 'system');
    addOutput('[NET] Initializing multiplayer session...', 'system');
    onSessionStart?.();
  },

  // ── session join ──────────────────────────────────────────────────────────────
  'session join': ({ args, addOutput, onSessionJoin }) => {
    const code = args[0]?.toUpperCase();
    if (!code) {
      addOutput('', 'system');
      addOutput('Usage: session join <code>', 'warning');
      addOutput('', 'system');
      return;
    }
    addOutput('', 'system');
    addOutput(`[NET] Connecting to session ${code}...`, 'system');
    onSessionJoin?.(code);
  },

  // ── session end ───────────────────────────────────────────────────────────────
  'session end': ({ addOutput, onSessionEnd }) => {
    addOutput('', 'system');
    addOutput('[NET] Ending multiplayer session...', 'system');
    onSessionEnd?.();
  },

  // ── grep -r ───────────────────────────────────────────────────────────────────
  'grep -r': ({ args, addOutput }) => {
    if (!args || !args[0]) {
      addOutput('', 'system');
      addOutput('Usage: grep -r "<skill>" .', 'system');
      addOutput('Example: grep -r "react" .', 'warning');
      addOutput('', 'system');
      return;
    }

    const raw     = args[0].replace(/^["']|["']$/g, '');
    const term    = raw.toUpperCase();
    const results = resolveSkill(term);

    addOutput('', 'system');
    addOutput(`Searching for "${raw}" in ./projects...`, 'system');

    stagger([
      [300, () => addOutput('  scanning ./projects/...', 'system')],
      [550, () => addOutput('  scanning ./skills/...', 'system')],
      [750, () => addOutput('', 'system')],
      [800, () => {
        if (!results || results.length === 0) {
          addOutput(`0 matches found for '${raw}'.`, 'error');
          addOutput('', 'system');
          return;
        }
        results.forEach(({ path, match }) => {
          addOutput(`  ${path.padEnd(38)} match: ${match}`, 'success');
        });
        addOutput('', 'system');
        addOutput(`${results.length} match${results.length > 1 ? 'es' : ''} found.`, 'success');
        addOutput('', 'system');
      }],
    ]);
  },
};
