import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  HardDrive,
  Shield,
  Cloud,
  Check,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { isConfigured } = useAuth();
  const { toastSuccess } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [downloadConfirm, setDownloadConfirm] = useState(false);
  const [quotaWarningThreshold, setQuotaWarningThreshold] = useState('80');

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toastSuccess('Preferences updated successfully.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure appearance, cloud storage alerts, notification preferences, and system parameters.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            Theme & Appearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between light mode and dark mode to suit your study environment.
          </p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Light Mode</h4>
              <p className="text-[11px] text-slate-500">Google Drive inspired clean white and sky blue interface.</p>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Moon className="w-5 h-5 text-purple-400" />
                {theme === 'dark' && <Check className="w-4 h-4 text-brand-400" />}
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark Mode</h4>
              <p className="text-[11px] text-slate-500">Eye-friendly contrast theme for low-light lab conditions.</p>
            </button>
          </div>
        </div>

        {/* Cloud Notification Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" />
            Notification & Warning Controls
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Storage Quota Warning Threshold
                </p>
                <p className="text-[11px] text-slate-400">
                  Notify when total stored files exceed this storage percentage.
                </p>
              </div>
              <select
                value={quotaWarningThreshold}
                onChange={(e) => setQuotaWarningThreshold(e.target.value)}
                className="py-1 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="75">75% Quota</option>
                <option value="80">80% Quota (Default)</option>
                <option value="90">90% Quota</option>
              </select>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  File Share Email Alerts
                </p>
                <p className="text-[11px] text-slate-400">
                  Receive simulated email dispatch notifications when users share files.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Download Confirmation Prompt
                </p>
                <p className="text-[11px] text-slate-400">
                  Prompt for confirmation before launching large binary downloads.
                </p>
              </div>
              <input
                type="checkbox"
                checked={downloadConfirm}
                onChange={(e) => setDownloadConfirm(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Project Details & Cloud Viva Credits */}
        <div className="p-6 rounded-3xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 space-y-3">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            About CloudVault Mini Project
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p><strong>Project Title:</strong> Cloud-Based File Storage and Sharing System</p>
            <p><strong>Domain:</strong> Cloud Computing, Full-Stack Web Development, Distributed Storage</p>
            <p><strong>Cloud Stack:</strong> React.js, Vite, Tailwind CSS, Lucide Icons, Google Firebase Cloud Storage, Cloud Firestore, Firebase Authentication, Firebase Hosting</p>
            <p><strong>Version:</strong> 1.0.0 (Mini Project Build)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
