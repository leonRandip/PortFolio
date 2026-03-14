// ─────────────────────────────────────────────────────────────────────────────
// Command registry
// Each key   = the full command string the user types
// Each value = handler(context) where context is:
//   { args, addOutput, addLink, clearOutput, onLaunch, onMatrix, onBashrc, onLegacy }
//
// To add a new command: add one entry here. That's it.
// ─────────────────────────────────────────────────────────────────────────────

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
    '  │  Login : randip           Name  : Maria Randip Leon        │',
    '  │  Shell : /bin/zsh         Home  : /home/randip             │',
    '  ├─────────────────────────────────────────────────────────────┤',
    '  │  Status : Hired @ yavar.ai — Frontend Dev Intern           │',
    '  │  After  : Open after internship concludes                  │',
    '  │  Hire me: leonrandip@gmail.com                             │',
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
      '  │                      AVAILABLE COMMANDS                        │',
      '  ├─────────────────────────────────────────────────────────────────┤',
      '  │  sudo init project-black    Launch portfolio                   │',
      '  │  sudo init self-destruct    ...                                │',
      '  │  whoami                     About me                           │',
      '  │  finger <name>              Status & contact info              │',
      '  │  ls                         List files                         │',
      '  │  ls -a                      List all files (incl. hidden)      │',
      '  │  ls portfolio/              Explore portfolio directory        │',
      '  │  cat <filename>             Read a file                        │',
      '  │  grep -r "<skill>" .        Search projects by skill           │',
      '  │  hack                       Initiate a breach sequence         │',
      '  │  fullscreen                 Toggle fullscreen mode             │',
      '  │  matrix                     Enter the Matrix                   │',
      '  │  ssh guest@legacy           Connect to legacy portfolio        │',
      '  │  clear                      Clear terminal                     │',
      '  │  help                       Show this message                  │',
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
      [1300, () => addOutput('  │              .env_hopes_and_dreams                      │', 'success')],
      [1350, () => addOutput('  ├──────────────────────────────────────────────────────────┤', 'success')],
      [1400, () => addOutput('  │  CAREER_GOAL_01 = "Open a cafe —                        │', 'success')],
      [1450, () => addOutput('  │    a cozy space for people to connect"                  │', 'success')],
      [1500, () => addOutput('  │  CAREER_GOAL_02 = "Open a gym —                         │', 'success')],
      [1550, () => addOutput('  │    help people transform their lives"                   │', 'success')],
      [1600, () => addOutput('  │  CURRENT_PATH   = "Developer → Tech Lead → Entrepreneur"│', 'success')],
      [1650, () => addOutput('  │  STATUS         = "In progress. Building skills.        │', 'success')],
      [1700, () => addOutput('  │    Stacking capital."                                   │', 'success')],
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
    } catch (_) {
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
