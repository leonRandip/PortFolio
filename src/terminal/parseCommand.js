/**
 * Parses raw terminal input against a command registry.
 * Supports multi-word commands like "sudo init project-black".
 *
 * @param {string} input - Raw user input string
 * @param {object} registry - Command registry object (keys are command names)
 * @returns {{ command: string, args: string[] }}
 */
export function parseCommand(input, registry) {
  const trimmed = input.trim();
  if (!trimmed) return { command: '', args: [] };

  // Try exact full match first (handles "sudo init project-black" etc.)
  if (registry[trimmed]) {
    return { command: trimmed, args: [] };
  }

  // Try progressively shorter prefix matches
  const parts = trimmed.split(/\s+/);
  for (let i = parts.length; i >= 1; i--) {
    const candidate = parts.slice(0, i).join(' ');
    if (registry[candidate]) {
      return { command: candidate, args: parts.slice(i) };
    }
  }

  // No match found — return empty so caller shows "command not found"
  return { command: '', args: [] };
}
