
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ICONS } from '../constants';

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-light hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-highlight"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? ICONS.sun : ICONS.moon}
    </button>
  );
};

export default ThemeSwitcher;
