import { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  indigo: {
    name: 'Indigo',
    vars: {
      '--primary': '#6366f1',
      '--primary-50': '#eef2ff',
      '--primary-100': '#e0e7ff',
      '--primary-200': '#c7d2fe',
      '--primary-300': '#a5b4fc',
      '--primary-400': '#818cf8',
      '--primary-500': '#6366f1',
      '--primary-600': '#4f46e5',
      '--primary-700': '#4338ca',
      '--primary-800': '#3730a3',
      '--primary-900': '#312e81',
      '--gradient': 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
      '--gradient-hover': 'linear-gradient(135deg, #4f46e5, #9333ea, #db2777)',
    },
  },
  blue: {
    name: 'Ocean',
    vars: {
      '--primary': '#0ea5e9',
      '--primary-50': '#f0f9ff',
      '--primary-100': '#e0f2fe',
      '--primary-200': '#bae6fd',
      '--primary-300': '#7dd3fc',
      '--primary-400': '#38bdf8',
      '--primary-500': '#0ea5e9',
      '--primary-600': '#0284c7',
      '--primary-700': '#0369a1',
      '--primary-800': '#075985',
      '--primary-900': '#0c4a6e',
      '--gradient': 'linear-gradient(135deg, #0ea5e9, #06b6d4, #22d3ee)',
      '--gradient-hover': 'linear-gradient(135deg, #0284c7, #0891b2, #06b6d4)',
    },
  },
  emerald: {
    name: 'Forest',
    vars: {
      '--primary': '#10b981',
      '--primary-50': '#ecfdf5',
      '--primary-100': '#d1fae5',
      '--primary-200': '#a7f3d0',
      '--primary-300': '#6ee7b7',
      '--primary-400': '#34d399',
      '--primary-500': '#10b981',
      '--primary-600': '#059669',
      '--primary-700': '#047857',
      '--primary-800': '#065f46',
      '--primary-900': '#064e3b',
      '--gradient': 'linear-gradient(135deg, #10b981, #14b8a6, #06b6d4)',
      '--gradient-hover': 'linear-gradient(135deg, #059669, #0d9488, #0891b2)',
    },
  },
  rose: {
    name: 'Rose',
    vars: {
      '--primary': '#f43f5e',
      '--primary-50': '#fff1f2',
      '--primary-100': '#ffe4e6',
      '--primary-200': '#fecdd3',
      '--primary-300': '#fda4af',
      '--primary-400': '#fb7185',
      '--primary-500': '#f43f5e',
      '--primary-600': '#e11d48',
      '--primary-700': '#be123c',
      '--primary-800': '#9f1239',
      '--primary-900': '#881337',
      '--gradient': 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef)',
      '--gradient-hover': 'linear-gradient(135deg, #e11d48, #db2777, #c026d3)',
    },
  },
  amber: {
    name: 'Sunset',
    vars: {
      '--primary': '#f59e0b',
      '--primary-50': '#fffbeb',
      '--primary-100': '#fef3c7',
      '--primary-200': '#fde68a',
      '--primary-300': '#fcd34d',
      '--primary-400': '#fbbf24',
      '--primary-500': '#f59e0b',
      '--primary-600': '#d97706',
      '--primary-700': '#b45309',
      '--primary-800': '#92400e',
      '--primary-900': '#78350f',
      '--gradient': 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)',
      '--gradient-hover': 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)',
    },
  },
  violet: {
    name: 'Twilight',
    vars: {
      '--primary': '#8b5cf6',
      '--primary-50': '#f5f3ff',
      '--primary-100': '#ede9fe',
      '--primary-200': '#ddd6fe',
      '--primary-300': '#c4b5fd',
      '--primary-400': '#a78bfa',
      '--primary-500': '#8b5cf6',
      '--primary-600': '#7c3aed',
      '--primary-700': '#6d28d9',
      '--primary-800': '#5b21b6',
      '--primary-900': '#4c1d95',
      '--gradient': 'linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6)',
      '--gradient-hover': 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)',
    },
  },
  slate: {
    name: 'Graphite',
    vars: {
      '--primary': '#64748b',
      '--primary-50': '#f8fafc',
      '--primary-100': '#f1f5f9',
      '--primary-200': '#e2e8f0',
      '--primary-300': '#cbd5e1',
      '--primary-400': '#94a3b8',
      '--primary-500': '#64748b',
      '--primary-600': '#475569',
      '--primary-700': '#334155',
      '--primary-800': '#1e293b',
      '--primary-900': '#0f172a',
      '--gradient': 'linear-gradient(135deg, #64748b, #71717a, #78716c)',
      '--gradient-hover': 'linear-gradient(135deg, #475569, #52525b, #57534e)',
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'indigo');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const selected = themes[colorTheme];
    if (selected) {
      Object.entries(selected.vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = themes[colorTheme];

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      colorTheme, 
      setColorTheme, 
      currentTheme,
      themes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};