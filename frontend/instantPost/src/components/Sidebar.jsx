import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Camera, Grid, PlusCircle, Palette, Sun, Moon,
  ChevronLeft, ChevronRight, Settings, LogOut,
  Sparkles, Menu, X, Zap, TrendingUp, Hash
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme, colorTheme, setColorTheme, themes } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const themeRef = useRef(null);

  // Sync collapse state to document so App.jsx main can react via CSS
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-sidebar',
      collapsed ? 'collapsed' : 'expanded'
    );
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
    { path: '/feed', label: 'Feed Gallery', icon: Grid, desc: 'Browse all posts', live: true },
    { path: '/', label: 'Create Post', icon: PlusCircle, desc: 'Share a moment' },
  ];

  // Fetch trending tags from localStorage (set by Feed page)
  const trendingTags = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('trendingTags') || '[]').slice(0, 5);
    } catch { return []; }
  }, []);

  return (
    <>
      {/* ── Mobile Top Bar ─────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-14 md:hidden z-40 flex items-center justify-between px-4
        bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl
        border-b border-white/30 dark:border-slate-800/40">
        <Link to="/feed" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl theme-gradient flex items-center justify-center shadow-md glow-sm
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-base tracking-tight gradient-text">InstaPost</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile backdrop ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        sidebar
        ${collapsed ? 'collapsed' : ''}
        ${mobileOpen
          ? 'translate-x-0 visible pointer-events-auto'
          : '-translate-x-full md:translate-x-0 invisible md:visible pointer-events-none md:pointer-events-auto'
        }
      `}>

        {/* ── Logo area ───────────────────────────────── */}
        <div className={`relative flex items-center h-[72px] px-4 shrink-0
          border-b border-white/20 dark:border-slate-800/40
          ${collapsed ? 'justify-center' : 'justify-between'}`}>

          {!collapsed ? (
            <Link to="/feed" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 group min-w-0">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-2xl theme-gradient flex items-center justify-center
                  shadow-lg glow-sm transition-all duration-500
                  group-hover:scale-110 group-hover:rotate-6">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                {/* Spinning ring */}
                <div className="absolute inset-[-3px] rounded-[18px] border-2 border-dashed
                  border-white/30 dark:border-slate-600/50 animate-spin-slow pointer-events-none" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-[17px] tracking-tight leading-none gradient-text">InstaPost</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-0.5">
                  Beta Studio
                </p>
              </div>
              {/* Mobile close */}
              <button onClick={(e) => { e.preventDefault(); setMobileOpen(false); }}
                className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white
                  hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-all">
                <X className="h-4 w-4" />
              </button>
            </Link>
          ) : (
            <Link to="/feed" onClick={() => setMobileOpen(false)}
              className="h-10 w-10 rounded-2xl theme-gradient flex items-center justify-center
                shadow-lg glow-sm transition-all duration-300 hover:scale-110 hover:rotate-6">
              <Camera className="h-5 w-5 text-white" />
            </Link>
          )}

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2
              h-7 w-7 rounded-full hidden md:flex items-center justify-center
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700
              shadow-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-100
              transition-all hover:scale-110 hover:shadow-lg z-10"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* ── Navigation ──────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
          {/* Label */}
          {!collapsed && (
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600 px-3 mb-3">
              Navigation
            </p>
          )}

          {navItems.map(({ path, label, icon: Icon, desc, live }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path} className="group relative list-none">
                <Link
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold
                    transition-all duration-300 overflow-hidden
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'text-white shadow-lg glow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }
                  `}
                  style={isActive ? { background: 'var(--gradient)' } : {}}
                >
                  {/* Active shimmer */}
                  {isActive && (
                    <span className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none" />
                  )}
                  <Icon className={`h-5 w-5 shrink-0 transition-all duration-300
                    ${isActive ? 'text-white' : ''}
                    group-hover:scale-110`} />
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="leading-none">{label}</p>
                      {!isActive && (
                        <p className="text-[10px] font-normal text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{desc}</p>
                      )}
                    </div>
                  )}
                  {/* Active dot */}
                  {isActive && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
                  )}
                  {/* Live badge */}
                  {live && !isActive && !collapsed && (
                    <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Live</span>
                    </span>
                  )}
                </Link>

                {/* Tooltip (collapsed) */}
                {collapsed && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none
                    opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                    <div className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900
                      text-xs font-bold shadow-xl border border-slate-800/20 dark:border-slate-200/20 whitespace-nowrap">
                      {label}
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {/* Divider */}
          <div className="my-4 border-t border-slate-200/40 dark:border-slate-800/40" />

          {/* Trending tags */}
          {!collapsed && trendingTags.length > 0 && (
            <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-white/40 to-white/10
              dark:from-slate-800/40 dark:to-slate-900/20
              border border-white/30 dark:border-slate-700/30 animate-slide-up delay-200">
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
                      text-slate-600 dark:text-slate-300 hover:text-white transition-all duration-200
                      hover:scale-105"
                    style={{ '--hover-bg': 'var(--gradient)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gradient)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <Hash className="h-2.5 w-2.5" />{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick create shortcut */}
          {!collapsed && (
            <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-white/40 to-white/10
              dark:from-slate-800/40 dark:to-slate-900/20
              border border-white/30 dark:border-slate-700/30 animate-slide-up delay-300">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Tip</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Use the <span className="font-bold text-slate-700 dark:text-slate-300">✨ Magic Caption</span> button for instant inspiration!
              </p>
            </div>
          )}
        </nav>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="shrink-0 border-t border-white/20 dark:border-slate-800/40 p-3 space-y-2.5" ref={themeRef}>

          {/* Color palette */}
          {!collapsed ? (
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40
              border border-white/30 dark:border-slate-800/30">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Palette className="h-3 w-3 text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Color Theme
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setColorTheme(key)}
                    title={t.name}
                    className={`relative h-5 rounded-full transition-all duration-300 hover:scale-125
                      ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
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
          ) : (
            <div className="relative group flex justify-center">
              <button
                onClick={() => setThemeOpen(t => !t)}
                className="h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300
                  text-slate-400 hover:text-slate-700 dark:hover:text-white
                  bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                  border border-white/30 dark:border-slate-700/30"
              >
                <Palette className="h-4 w-4" />
              </button>
              {themeOpen && (
                <div className="absolute bottom-14 left-16 z-50 animate-scale-in
                  p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                  shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-52">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">Theme</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.entries(themes).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => { setColorTheme(key); setThemeOpen(false); }}
                        title={t.name}
                        className={`h-7 rounded-xl transition-all duration-200 hover:scale-110
                          ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'opacity-60 hover:opacity-100'}`}
                        style={{ background: t.vars['--gradient'], '--tw-ring-color': t.vars['--primary'] }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dark / light toggle */}
          {!collapsed ? (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl
                bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-800/70
                border border-white/30 dark:border-slate-800/30
                transition-all duration-300 group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-500
                  ${theme === 'dark' ? 'bg-amber-400/20 rotate-0' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {theme === 'dark'
                    ? <Sun className="h-3.5 w-3.5 text-amber-400" />
                    : <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              {/* Toggle pill */}
              <div className={`relative h-5 w-9 rounded-full transition-all duration-300
                ${theme === 'dark' ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300
                  ${theme === 'dark' ? 'left-4' : 'left-0.5'}`} />
              </div>
            </button>
          ) : (
            <div className="relative group flex justify-center">
              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300
                  text-slate-400 hover:text-slate-700 dark:hover:text-white
                  bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800
                  border border-white/30 dark:border-slate-700/30"
              >
                {theme === 'dark'
                  ? <Sun className="h-4 w-4 text-amber-400" />
                  : <Moon className="h-4 w-4" />}
              </button>
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50
                opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white
                  text-white dark:text-slate-900 text-xs font-bold shadow-xl whitespace-nowrap">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
              </div>
            </div>
          )}

          {/* User profile */}
          <div className="pt-2 border-t border-white/20 dark:border-slate-800/40">
            {!collapsed ? (
              <div className="flex items-center justify-between p-2.5 rounded-2xl
                bg-white/40 dark:bg-slate-900/40
                border border-white/20 dark:border-slate-800/20
                hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl theme-gradient p-0.5 shadow-md glow-sm">
                      <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center
                        text-white text-[10px] font-black tracking-wide uppercase">
                        AM
                      </div>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                      bg-emerald-400 border-2 border-white dark:border-slate-900" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">Alex Mercer</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">@alexmercer</p>
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Settings">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group flex justify-center">
                <div className="relative cursor-pointer transition-all duration-300 hover:scale-105">
                  <div className="h-10 w-10 rounded-2xl theme-gradient p-0.5 shadow-md glow-sm">
                    <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center
                      text-white text-[10px] font-black uppercase">
                      AM
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                    bg-emerald-400 border-2 border-white dark:border-slate-900" />
                </div>
                <div className="absolute left-full ml-4 bottom-0 z-50
                  opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200">
                  <div className="p-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 backdrop-blur
                    text-xs shadow-2xl border border-slate-800/10 dark:border-slate-200/10 min-w-36">
                    <p className="font-bold text-white dark:text-slate-900">Alex Mercer</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">@alexmercer</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300 dark:text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active Now
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;