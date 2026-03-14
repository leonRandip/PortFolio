/**
 * Command registry. Each key is the full command string the user types.
 * Each value is a handler function receiving a context object.
 *
 * Context: { args, addOutput, clearOutput, onLaunch }
 *   - addOutput(text, type)  — append a line to the terminal output
 *   - clearOutput()          — clear all terminal output
 *   - onLaunch()             — transition to the portfolio view
 *
 * To add a new command, just add a new entry here.
 */
export const commands = {
  help: ({ addOutput }) => {
    const lines = [
      '',
      '  ┌─────────────────────────────────────────────────┐',
      '  │              AVAILABLE COMMANDS                 │',
      '  ├─────────────────────────────────────────────────┤',
      '  │  sudo init project-black   Launch portfolio     │',
      '  │  sudo init self-destruct   ...                  │',
      '  │  whoami                    About me             │',
      '  │  clear                     Clear terminal       │',
      '  │  help                      Show this message    │',
      '  └─────────────────────────────────────────────────┘',
      '',
    ];
    lines.forEach(line => addOutput(line, 'system'));
  },

  clear: ({ clearOutput }) => {
    clearOutput();
  },

  whoami: ({ addOutput }) => {
    const lines = [
      '',
      '  Maria Randip Leon',
      '  ─────────────────────────────────────',
      '  Full-Stack Web Developer',
      '',
      '  Stack  →  React · Node.js · Express · MongoDB · PostgreSQL',
      '  Focus  →  Clean code, great UX, and scalable systems.',
      '  Status →  Open to opportunities.',
      '',
    ];
    lines.forEach(line => addOutput(line, 'success'));
  },

  'sudo init project-black': ({ addOutput, onLaunch }) => {
    const lines = [
      '',
      '[AUTH] Authenticating credentials...',
      '[AUTH] Access granted.',
      '[SYS]  Initializing project-black...',
      '[SYS]  Loading assets...',
      '',
    ];
    lines.forEach((line, i) => {
      setTimeout(() => addOutput(line, 'success'), i * 120);
    });
    setTimeout(onLaunch, lines.length * 120 + 400);
  },

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
          // Browsers block window.close() unless opened by script
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
};
