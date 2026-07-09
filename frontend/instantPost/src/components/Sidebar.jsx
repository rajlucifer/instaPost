import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Camera, Grid, PlusCircle, Palette, Sun, Moon,
  Settings, LogOut, Sparkles, Menu, X, Zap, TrendingUp, Hash
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme, colorTheme, setColorTheme, themes } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const themeRef = useRef(null);
  const userRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/feed', label: 'Feed Gallery', icon: Grid, desc: 'Browse all posts', live: true },
    { path: '/', label: 'Create Post', icon: PlusCircle, desc: 'Share a moment' },
  ];

  const trendingTags = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('trendingTags') || '[]').slice(0, 4);
    } catch { return []; }
  }, []);

  return (
    <>
      {/* ── Top Navbar ──────────────────────────────────── */}
      <header className="navbar fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between px-4 lg:px-6 gap-4">

          {/* ── Logo ──────────────────────────────── */}
          <Link to="/feed" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl theme-gradient flex items-center justify-center
                shadow-lg glow-sm transition-all duration-500
                group-hover:scale-110 group-hover:rotate-6">
                <Camera className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              {/* Spinning ring */}
              <div className="absolute inset-[-3px] rounded-[14px] border-2 border-dashed
                border-white/30 dark:border-slate-600/50 animate-spin-slow pointer-events-none" />
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-[17px] tracking-tight leading-none gradient-text">InstaPost</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-0.5">
                Beta Studio
              </p>
            </div>
          </Link>

          {/* ── Desktop Nav Links ─────────────────── */}
          <nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
            {navItems.map(({ path, label, icon: Icon, live }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                    transition-all duration-300 overflow-hidden group
                    ${isActive
                      ? 'text-white shadow-lg glow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }
                  `}
                  style={isActive ? { background: 'var(--gradient)' } : {}}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none" />
                  )}
                  <Icon className={`h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                  <span>{label}</span>
                  {/* Live badge */}
                  {live && !isActive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 ml-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Live</span>
                    </span>
                  )}
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80 shrink-0 ml-0.5" />
                  )}
                </Link>
              );
            })}

            {/* Trending tags (desktop) */}
            {trendingTags.length > 0 && (
              <>
                <div className="h-5 w-px bg-slate-200/60 dark:bg-slate-700/50 mx-1" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {trendingTags.map(tag => (
                    <Link
                      key={tag}
                      to="/feed"
                      className="flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold
                        bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30
                        text-slate-600 dark:text-slate-300 hover:text-white transition-all duration-200
                        hover:scale-105"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gradient)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <Hash className="h-2.5 w-2.5" />{tag}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* ── Right Controls ────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Color Theme Picker */}
            <div className="relative hidden md:block" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(t => !t)}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300
                  text-slate-400 hover:text-slate-700 dark:hover:text-white
                  bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                  border border-white/30 dark:border-slate-700/30
                  hover:scale-105 hover:shadow-md
                  ${themeOpen ? 'bg-white dark:bg-slate-800 shadow-md' : ''}`}
                title="Color theme"
              >
                <Palette className="h-4 w-4" />
              </button>
              {themeOpen && (
                <div className="absolute top-12 right-0 z-50 animate-scale-in
                  p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                  shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-56">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2.5">Color Theme</p>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(themes).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => { setColorTheme(key); setThemeOpen(false); }}
                        title={t.name}
                        className={`relative h-6 rounded-full transition-all duration-300 hover:scale-125
                          ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                        style={{
                          background: t.vars['--gradient'],
                          '--tw-ring-color': t.vars['--primary'],
                        }}
                      >
                        {colorTheme === key && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-2 w-2 text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 rounded-xl flex items-center gap-2 px-2.5
                bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                border border-white/30 dark:border-slate-700/30
                text-slate-400 hover:text-slate-700 dark:hover:text-white
                transition-all duration-300 hover:scale-105 hover:shadow-md"
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-500
                ${theme === 'dark' ? 'bg-amber-400/20' : 'bg-slate-200/70 dark:bg-slate-700'}`}>
                {theme === 'dark'
                  ? <Sun className="h-3.5 w-3.5 text-amber-400" />
                  : <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
              </div>
              {/* Toggle pill */}
              <div className={`relative h-4 w-7 rounded-full transition-all duration-300 hidden sm:block
                ${theme === 'dark' ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-300
                  ${theme === 'dark' ? 'left-3.5' : 'left-0.5'}`} />
              </div>
            </button>

            {/* User Profile */}
            <div className="relative hidden md:block" ref={userRef}>
              <button
                onClick={() => setUserOpen(u => !u)}
                className={`flex items-center gap-2 h-9 px-2 rounded-xl transition-all duration-300
                  bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                  border border-white/30 dark:border-slate-700/30
                  hover:scale-105 hover:shadow-md group
                  ${userOpen ? 'bg-white dark:bg-slate-800 shadow-md' : ''}`}
              >
                <div className="relative">
                  <div className="h-7 w-7 rounded-lg theme-gradient p-0.5 shadow-sm glow-sm">
                    <div className="h-full w-full rounded-md bg-slate-950 flex items-center justify-center
                      text-white text-[9px] font-black tracking-wide uppercase">
                      AM
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full
                    bg-emerald-400 border-2 border-white dark:border-slate-900" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden lg:block">Alex Mercer</span>
              </button>

              {userOpen && (
                <div className="absolute top-12 right-0 z-50 animate-scale-in
                  p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                  shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-52">
                  {/* Profile header */}
                  <div className="flex items-center gap-3 p-2.5 mb-1">
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-xl theme-gradient p-0.5 shadow-md glow-sm">
                        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center
                          text-white text-[10px] font-black uppercase">
                          AM
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                        bg-emerald-400 border-2 border-white dark:border-slate-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Alex Mercer</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">@alexmercer</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-semibold text-emerald-500">Active Now</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                    text-slate-600 dark:text-slate-300
                    hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-800 dark:hover:text-white
                    transition-all duration-200 group">
                    <Settings className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                    text-slate-600 dark:text-slate-300
                    hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400
                    transition-all duration-200 group">
                    <LogOut className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center
                bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                border border-white/30 dark:border-slate-700/30
                text-slate-500 dark:text-slate-400 transition-all duration-300 hover:scale-105"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Quick Tip strip (desktop only) ──────────────── */}
        <div className="hidden lg:flex items-center justify-center gap-2 h-7 px-4
          border-t border-white/20 dark:border-slate-800/30
          bg-gradient-to-r from-transparent via-white/20 dark:via-slate-800/20 to-transparent">
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Use <span className="font-bold text-slate-700 dark:text-slate-300">✨ Magic Caption</span> button for instant AI inspiration!
          </span>
          <TrendingUp className="h-3 w-3 ml-2" style={{ color: 'var(--primary)' }} />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">InstaPost Beta Studio</span>
        </div>
      </header>

      {/* ── Mobile Backdrop ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ───────────────────────────────── */}
      <div className={`
        fixed top-0 right-0 z-50 h-full w-72 flex flex-col md:hidden
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        mobile-drawer
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Drawer header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/20 dark:border-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl theme-gradient flex items-center justify-center shadow-md glow-sm">
              <Camera className="text-white" style={{ width: 16, height: 16 }} />
            </div>
            <span className="font-black text-base gradient-text tracking-tight">InstaPost</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400
              hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600 px-2 mb-3">Navigation</p>
          {navItems.map(({ path, label, icon: Icon, desc, live }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold
                  transition-all duration-300 overflow-hidden group
                  ${isActive
                    ? 'text-white shadow-lg glow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }
                `}
                style={isActive ? { background: 'var(--gradient)' } : {}}
              >
                {isActive && <span className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none" />}
                <Icon className={`h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                <div className="min-w-0">
                  <p className="leading-none">{label}</p>
                  {!isActive && (
                    <p className="text-[10px] font-normal text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{desc}</p>
                  )}
                </div>
                {live && !isActive && (
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Live</span>
                  </span>
                )}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />}
              </Link>
            );
          })}

          {/* Trending tags */}
          {trendingTags.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-white/40 to-white/10
              dark:from-slate-800/40 dark:to-slate-900/20
              border border-white/30 dark:border-slate-700/30">
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Trending</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map(tag => (
                  <Link
                    key={tag}
                    to="/feed"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold
                      bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-slate-700/30
                      text-slate-600 dark:text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gradient)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <Hash className="h-2.5 w-2.5" />{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile footer */}
        <div className="shrink-0 border-t border-white/20 dark:border-slate-800/40 p-4 space-y-3">
          {/* Color theme picker */}
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/30 dark:border-slate-800/30">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Palette className="h-3 w-3 text-slate-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Color Theme</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  title={t.name}
                  className={`relative h-5 rounded-full transition-all duration-300 hover:scale-125
                    ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  style={{ background: t.vars['--gradient'], '--tw-ring-color': t.vars['--primary'] }}
                >
                  {colorTheme === key && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-2 w-2 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dark/light toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl
              bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-800/70
              border border-white/30 dark:border-slate-800/30
              transition-all duration-300"
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-500
                ${theme === 'dark' ? 'bg-amber-400/20' : 'bg-slate-200'}`}>
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className={`relative h-5 w-9 rounded-full transition-all duration-300
              ${theme === 'dark' ? 'bg-amber-400' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300
                ${theme === 'dark' ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>

          {/* User card */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl
            bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/20">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl theme-gradient p-0.5 shadow-md glow-sm">
                  <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center
                    text-white text-[10px] font-black uppercase">
                    AM
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                  bg-emerald-400 border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Alex Mercer</p>
                <p className="text-[10px] text-slate-400">@alexmercer</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Settings">
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;