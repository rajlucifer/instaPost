import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Grid, PlusCircle, Palette, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme, colorTheme, setColorTheme, themes, currentTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/feed', label: 'Feed Gallery', icon: Grid },
    { path: '/', label: 'Create Post', icon: PlusCircle },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r 
      border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl
      ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex h-full flex-col">
        {/* Logo + Collapse */}
        <div className={`flex h-16 items-center px-4 border-b border-slate-200/60 dark:border-slate-800/60 
          ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <Link to="/feed" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg theme-gradient text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Camera className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient)' }}
              >
                InstaPost
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 
                      ${collapsed ? 'justify-center' : ''}
                      ${isActive 
                        ? 'theme-bg-light theme-text shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                      }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Section */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60" ref={themeRef}>
          {/* Mini Theme Selector */}
          {!collapsed && (
            <div className="mb-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Theme</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setColorTheme(key)}
                    className={`h-6 w-6 rounded-md transition-all duration-200 
                      ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950' : 'opacity-60 hover:opacity-100'}`}
                    style={{ 
                      background: t.vars['--gradient'],
                      ringColor: t.vars['--primary'],
                      '--tw-ring-color': t.vars['--primary']
                    }}
                    title={t.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Collapsed version: single button to open selector */}
          {collapsed && (
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Palette className="h-4 w-4" />
              </button>
            </div>
          )}

          {collapsed && themeOpen && (
            <div className="absolute bottom-16 left-20 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => { setColorTheme(key); setThemeOpen(false); }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${colorTheme === key ? 'theme-bg-light theme-text' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className="h-4 w-4 rounded" style={{ background: t.vars['--gradient'] }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dark/Light + Footer */}
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {theme === 'dark' ? 'Light' : 'Dark'} mode
                </span>
              </div>
            )}
            {collapsed && (
              <div className="flex justify-center w-full">
                <button
                  onClick={toggleTheme}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;