// ─────────────────────────────────────────────────────────────────────────────
// Theme definitions — each entry is a flat map of CSS custom property → value.
// Applied to :root via useTheme.js.
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES = {
  default: {
    '--term-bg':           '#000000',
    '--term-fg':           '#00ff41',
    '--term-error':        '#ff4444',
    '--term-warning':      '#ffb800',
    '--term-dim':          'rgba(0,255,65,0.35)',
    '--term-success-glow': 'rgba(0,255,65,0.35)',
    '--term-cursor-glow':  'rgba(0,255,65,0.55)',
    '--term-select-bg':    '#00ff41',
    '--term-select-color': '#000d00',
    '--term-btn-border':   'rgba(0,255,65,0.35)',
    '--term-btn-bg':       'rgba(0,255,65,0.07)',
  },
  tva: {
    '--term-bg':           '#1A0A00',
    '--term-fg':           '#FF6B00',
    '--term-error':        '#FF3300',
    '--term-warning':      '#FFB347',
    '--term-dim':          'rgba(255,107,0,0.35)',
    '--term-success-glow': 'rgba(255,107,0,0.4)',
    '--term-cursor-glow':  'rgba(255,107,0,0.6)',
    '--term-select-bg':    '#FF6B00',
    '--term-select-color': '#1A0A00',
    '--term-btn-border':   'rgba(255,107,0,0.35)',
    '--term-btn-bg':       'rgba(255,107,0,0.08)',
  },
};
