import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <span className="toggle-icon">☀️</span> // Sun icon for light mode
      ) : (
        <span className="toggle-icon">🌙</span> // Moon icon for dark mode
      )}
      <span className="toggle-text">{isDark ? 'Light' : 'Dark'} Mode</span>
    </button>
  );
};

export default DarkModeToggle;