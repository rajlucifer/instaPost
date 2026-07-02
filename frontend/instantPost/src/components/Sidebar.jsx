import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Grid, PlusCircle, Palette, Sun, Moon, ChevronLeft, ChevronRight, Settings, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme, colorTheme, setColorTheme, themes, currentTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <>
      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/30 dark:border-slate-800/40 flex items-center justify-between px-4 z-40 md:hidden">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl theme-gradient text-white shadow-[0_4px_12px_rgba(99,102,241,0.15)]">
            <Camera className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            InstaPost
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-45 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r 
        border-slate-200/30 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl
        shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Logo + Collapse Button */}
            <div className={`relative flex h-20 items-center px-4 border-b border-slate-200/30 dark:border-slate-800/40 
              ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              {!collapsed ? (
                <div className="flex w-full items-center justify-between">
                  <Link to="/feed" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-gradient text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] dark:shadow-[0_4px_12px_rgba(99,102,241,0.15)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <Camera className="h-5 w-5 animate-pulse-glow" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                        InstaPost
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Beta Studio</span>
                    </div>
                  </Link>
                  {/* Close Button on mobile */}
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 md:hidden transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/feed" className="flex h-10 w-10 items-center justify-center rounded-xl theme-gradient text-white shadow-lg transition-transform duration-300 hover:scale-105" onClick={() => setMobileOpen(false)}>
                  <Camera className="h-5 w-5" />
                </Link>
              )}

              {/* Collapse Trigger Button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`absolute -right-3 top-7 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hidden md:flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:scale-110`}
              >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="py-6 px-4">
              <ul className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} className="group relative">
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 
                          ${collapsed ? 'justify-center' : ''}
                          ${isActive 
                            ? 'theme-bg-light theme-text shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-slate-100/50 dark:border-slate-800/30' 
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/40 dark:hover:bg-slate-900/40'
                          }`}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'theme-text' : ''}`} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>

                      {/* Tooltip for collapsed mode */}
                      {collapsed && (
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-slate-800/10 dark:border-slate-200/10">
                          {item.label}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Footer / Theme & Profile */}
          <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/20" ref={themeRef}>
            {/* Theme Palette Container */}
            <div className="mb-4">
              {!collapsed ? (
                <div className="bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/20 dark:border-slate-800/20">
                  <div className="flex items-center gap-1.5 mb-2 px-0.5">
                    <Palette className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Color Palette</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Object.entries(themes).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => setColorTheme(key)}
                        className={`h-6 rounded-lg transition-all duration-300 hover:scale-110 relative overflow-hidden group
                          ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950' : 'opacity-70 hover:opacity-100'}`}
                        style={{ 
                          background: t.vars['--gradient'],
                          ringColor: t.vars['--primary'],
                          '--tw-ring-color': t.vars['--primary']
                        }}
                        title={t.name}
                      >
                        {colorTheme === key && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative group flex justify-center">
                  <button
                    onClick={() => setThemeOpen(!themeOpen)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 border border-slate-200/20 dark:border-slate-800/20
                      ${themeOpen ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white' : 'text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'}`}
                  >
                    <Palette className="h-4.5 w-4.5" />
                  </button>

                  {themeOpen && (
                    <div className="absolute bottom-12 left-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/40 dark:border-slate-800/40 p-2.5 z-50 animate-fade-in w-44">
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Palette className="h-3 w-3 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Themes</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {Object.entries(themes).map(([key, t]) => (
                          <button
                            key={key}
                            onClick={() => { setColorTheme(key); setThemeOpen(false); }}
                            className={`h-7 rounded-lg transition-all relative
                              ${colorTheme === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'opacity-70 hover:opacity-100'}`}
                            style={{ 
                              background: t.vars['--gradient'],
                              ringColor: t.vars['--primary'],
                              '--tw-ring-color': t.vars['--primary']
                            }}
                            title={t.name}
                          >
                            {colorTheme === key && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Sparkles className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!themeOpen && (
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-slate-800/10 dark:border-slate-200/10">
                      Choose Palette
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <div className="mb-4">
              {!collapsed ? (
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/20 dark:border-slate-800/20 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-500 rotate-0 hover:rotate-90" />
                      ) : (
                        <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-500 rotate-0 hover:rotate-12" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 ${theme === 'dark' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </button>
              ) : (
                <div className="relative group flex justify-center">
                  <button
                    onClick={toggleTheme}
                    className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-all duration-300 border border-slate-200/10 dark:border-slate-800/10"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4.5 w-4.5 text-amber-500 transition-all duration-500 hover:rotate-90" />
                    ) : (
                      <Moon className="h-4.5 w-4.5 transition-all duration-500 hover:rotate-12" />
                    )}
                  </button>

                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-slate-800/10 dark:border-slate-200/10">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Widget */}
            <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800/40">
              {!collapsed ? (
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/10 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-xl theme-gradient p-0.5 shadow-md">
                        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center text-white text-xs font-black tracking-wider uppercase">
                          AM
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Alex Mercer</span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">@alexmercer</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Settings" onClick={() => setMobileOpen(false)}>
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Logout" onClick={() => setMobileOpen(false)}>
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group flex justify-center">
                  <div className="relative cursor-pointer transition-transform duration-300 hover:scale-105">
                    <div className="h-10 w-10 rounded-xl theme-gradient p-0.5 shadow-md">
                      <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center text-white text-xs font-black uppercase">
                        AM
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                  </div>

                  <div className="absolute left-full ml-4 bottom-0 p-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-950 text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-slate-800/10 dark:border-slate-200/10 flex flex-col gap-1.5 min-w-36">
                    <div className="pb-1 border-b border-white/10 dark:border-slate-900/10">
                      <p className="font-bold text-white dark:text-slate-950">Alex Mercer</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">@alexmercer</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300 dark:text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Active Now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;