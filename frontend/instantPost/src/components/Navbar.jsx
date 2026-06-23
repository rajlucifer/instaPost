import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, PlusCircle, Grid, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617'; // slate-950
      root.style.color = '#f8fafc'; // slate-50
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc'; // slate-50
      root.style.color = '#0f172a'; // slate-900
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/75 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
            <Camera className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text font-black text-2xl tracking-tight text-transparent">
            InstaPost
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Link
              to="/feed"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                location.pathname === '/feed'
                  ? 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Feed Gallery</span>
            </Link>

            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Post</span>
            </Link>
          </nav>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
