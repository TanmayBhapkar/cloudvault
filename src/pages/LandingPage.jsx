import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  ShieldCheck,
  Zap,
  Share2,
  HardDrive,
  FileCheck,
  Lock,
  ArrowRight,
  Database,
  Users,
  CheckCircle,
  Eye,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function LandingPage() {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                CloudVault
              </span>
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Cloud Mini Project
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-400/20 to-sky-300/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 text-xs font-semibold mb-6 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Next-Gen Cloud File Storage & Real-Time Sharing System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Secure cloud storage built for students, teams, and enterprises.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload, preview, organize, and share documents, images, and videos with enterprise-grade Firebase Cloud Storage, Firestore database metadata, and role-based permissions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={currentUser ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-2xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 text-white shadow-xl shadow-brand-500/25 active:scale-95 transition-all"
            >
              Start Using CloudVault
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 transition-all shadow-sm"
            >
              Sign In to Your Vault
            </Link>
          </div>

          {/* Interactive Feature Preview Card */}
          <div className="relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-brand-200/50 via-slate-200/30 to-transparent dark:from-slate-800 dark:via-slate-900 shadow-2xl">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-left overflow-hidden">
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-slate-400">cloudvault-dashboard.app</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Firestore & Storage Synchronized
                </div>
              </div>

              {/* Mock Dashboard Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase">Storage Used</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">384.5 MB</p>
                  <p className="text-xs text-slate-500 mt-1">of 5.0 GB Quota</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Files</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">12 Files</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Encrypted on Google Cloud</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Shared Files</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">4 Shares</p>
                  <p className="text-xs text-slate-500 mt-1">Viewer & Editor roles</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Security Check</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">100% Secure</p>
                  <p className="text-xs text-slate-500 mt-1">Rules validated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Computing Architecture Overview */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              Cloud Computing Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Powered by Google Cloud & Firebase Backend
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Designed according to modern cloud principles: scalability, high availability, security rules, and real-time synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Cloud Firestore NoSQL
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Stores structured metadata for users, files, shares, and activity logs. Features real-time listeners and granular security rules.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4">
                <HardDrive className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Firebase Cloud Storage
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Binary object storage with resumable chunked uploads, progress callbacks, and signed download URLs for multimedia and documents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Firebase Authentication & Rules
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                JWT-backed identity management, password reset flows, and strict server-enforced security rules preventing unauthorized file access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              Comprehensive Feature Set
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything expected from a cloud storage mini project
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Chunked & Resumable Uploads', desc: 'Drag-and-drop single or multiple files with live progress percentage indicators.' },
              { icon: Eye, title: 'Multi-Format File Preview', desc: 'Direct in-browser preview for PDFs, JPG/PNG, MP4 videos, MP3 audio, and source code.' },
              { icon: Share2, title: 'Controlled Email Sharing', desc: 'Share files with registered emails with Viewer or Editor permissions and link expiration.' },
              { icon: Layers, title: 'Storage Quota Tracking', desc: 'Detailed breakdown by file type (Documents, Images, Videos, Archives) with usage warnings.' },
              { icon: FileCheck, title: 'Two-Stage Safe Trash', desc: 'Soft-delete files into Trash with 1-click restoration before permanent cloud removal.' },
              { icon: Users, title: 'Admin Governance Console', desc: 'Role-based access control to view all users, total files, and audit platform activities.' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">{feat.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* College Project Viva / Examination Ready Callout */}
      <section className="py-12 bg-gradient-to-r from-brand-600 to-sky-600 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold">
            Ready for College Practical Examination & Viva Voce
          </h3>
          <p className="text-sm sm:text-base text-sky-100 max-w-2xl mx-auto">
            Includes fully functional frontend code, Firebase integration, security rules, database schema documentation, and deployment configurations.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-lg hover:bg-slate-100 transition-colors"
            >
              Launch Mini Project Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">CloudVault</span>
            <span>— College Cloud Computing Mini Project</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
