import { useState, useRef, useEffect } from 'react';
import { LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export type AppRoute = 'dashboard' | 'library' | 'categories' | 'visualizer' | 'problem';

interface TopBarProps {
  currentRoute: AppRoute;
  onNavigate: (route: Exclude<AppRoute, 'problem'>) => void;
}

export function TopBar({ currentRoute, onNavigate }: TopBarProps) {
  const { user, profile, isSigningIn, signInWithGoogle, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: Exclude<AppRoute, 'problem'>; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'library', label: 'Problems' },
    { id: 'categories', label: 'Categories' },
    { id: 'visualizer', label: 'Visualizer Lab' },
  ];

  const displayName = profile?.displayName || user?.displayName || 'Account';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-md px-1 dark:text-slate-50"
        >
          CodeRecall
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav aria-label="Primary navigation" className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive =
              currentRoute === item.id ||
              (currentRoute === 'problem' && item.id === 'library');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-sm ${
                  isActive
                    ? 'text-sky-700 dark:text-sky-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-sky-600 dark:bg-sky-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="relative shrink-0" ref={menuRef}>
          {!user ? (
            <button
              type="button"
              disabled={isSigningIn}
              onClick={() => void signInWithGoogle()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {user.photoURL && !avatarFailed ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[11px] font-semibold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  {initials || <UserIcon className="h-3.5 w-3.5" />}
                </span>
              )}
              <span className="max-w-[120px] truncate">{displayName}</span>
            </button>
          )}

          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                }}
                className="mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {theme === 'light' ? 'Off' : 'On'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
