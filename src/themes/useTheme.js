import { useState, useEffect } from 'react';
import { THEMES } from './themes';

function applyTheme(id) {
  const vars = THEMES[id] ?? THEMES.default;
  Object.entries(vars).forEach(([key, val]) => {
    document.documentElement.style.setProperty(key, val);
  });
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') ?? 'default';
    return THEMES[saved] ? saved : 'default';
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const switchTheme = (id) => {
    const next = THEMES[id] ? id : 'default';
    localStorage.setItem('theme', next);
    setTheme(next);
    applyTheme(next);
  };

  return [theme, switchTheme];
}
