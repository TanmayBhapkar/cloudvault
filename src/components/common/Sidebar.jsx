import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Users2,
  Share2,
  HardDrive,
  Trash2,
  User,
  Settings,
  ShieldAlert,
  Plus,
  Cloud,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFiles } from '../../context/FileContext';
import { formatBytes } from '../../utils/formatters';
import { DEFAULT_QUOTA_BYTES, getStoragePercentage, getQuotaStatus } from '../../utils/storageQuota';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { currentUser, isAdmin } = useAuth();
  const { storageStats } = useFiles();
  const navigate = useNavigate();

  const usedBytes = storageStats.totalStorageUsed || 0;
  const percentage = getStoragePercentage(usedBytes, DEFAULT_QUOTA_BYTES);
  const quotaInfo = getQuotaStatus(usedBytes, DEFAULT_QUOTA_BYTES);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/files', label: 'My Files', icon: FolderOpen },
    { to: '/upload', label: 'Upload Files', icon: UploadCloud },
    { to: '/shared-with-me', label: 'Shared With Me', icon: Users2 },
    { to: '/shared-by-me', label: 'Shared By Me', icon: Share2 },
    { to: '/storage', label: 'Storage', icon: HardDrive },
    { to: '/trash', label: 'Trash', icon: Trash2 },
  ];

  const secondaryLinks = [
    { to: '/profile', label: 'User Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    secondaryLinks.push({ to: '/admin', label: 'Admin Console', icon: ShieldAlert, badge: 'Admin' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                  CloudVault
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  Cloud Storage
                </p>
              </div>
            </Link>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: New / Upload Button */}
          <div className="p-4">
            <button
              onClick={() => {
                navigate('/upload');
                onCloseMobile?.();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Upload New File</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
            <div>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Core Workspace
              </p>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Account & Management
              </p>
              <nav className="space-y-1">
                {secondaryLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Storage Quota Meter */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-brand-500" />
                  Cloud Storage
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${quotaInfo.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>{formatBytes(usedBytes)} used</span>
                <span>{formatBytes(DEFAULT_QUOTA_BYTES)}</span>
              </div>

              <Link
                to="/storage"
                onClick={onCloseMobile}
                className="block text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-1"
              >
                Manage & Clean Storage &rarr;
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
