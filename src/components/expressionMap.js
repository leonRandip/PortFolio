// ─────────────────────────────────────────────────────────────────────────────
// Maps command keys (from parseCommand) → Miss Minutes expression name.
// Used by MissMinutes.jsx to tell MissMinutes3D how to animate.
// ─────────────────────────────────────────────────────────────────────────────

export const COMMAND_EXPRESSIONS = {
  // ── Angry ────────────────────────────────────────────────────────────────
  hack:                      'angry',
  gordon:                    'angry',
  'sudo init self-destruct': 'angry',

  // ── Laugh / very happy ───────────────────────────────────────────────────
  'hire randip':             'laugh',
  brickbreaker:              'laugh',
  fortune:                   'laugh',
  cowsay:                    'laugh',

  // ── Happy ────────────────────────────────────────────────────────────────
  whoami:                    'happy',
  timeline:                  'happy',
  neofetch:                  'happy',
  'finger randip':           'happy',
  'finger maria':            'happy',
  'finger leonrandip':       'happy',
  'npm install randip':      'happy',
  'man randip':              'happy',
  'curl api.randip.dev/me':  'happy',

  // ── Surprised ────────────────────────────────────────────────────────────
  matrix:                    'surprised',
  'theme tva':               'surprised',
  'session start':           'surprised',
  'session join':            'surprised',
  'sudo init project-black': 'surprised',

  // ── Suspicious ───────────────────────────────────────────────────────────
  'ls -a':                          'suspicious',
  'cat .secret_crush':              'suspicious',
  'cat .env_hopes_and_dreams':      'suspicious',
  'cat portfolio/top_secret.txt':   'suspicious',
  'grep -r':                        'suspicious',

  // ── Excited ──────────────────────────────────────────────────────────────
  'session end':   'excited',
  'theme default': 'excited',
  'sound on':      'excited',
  open:            'excited',
  contact:         'excited',
};

// Fall back to 'idle' for any command not in the map
