import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { Cloud, Sun, Moon, ShieldCheck, Database, HardDrive, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageLoader } from '../components/common/LoadingSpinner';

export function AuthLayout() {
  const { currentUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return <PageLoader />;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            CloudVault
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-center gap-6 mb-1">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Storage</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-brand-500" /> Cloud Firestore</span>
          <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-sky-500" /> Firebase Cloud</span>
        </div>
        <p>© 2026 CloudVault. College Cloud Computing Mini Project.</p>
      </footer>
    </div>
  );
}
