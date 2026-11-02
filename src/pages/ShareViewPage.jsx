import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Eye,
  Calendar,
  User,
  HardDrive,
  Cloud,
  ArrowLeft,
  Clock,
  Lock,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { useToast } from '../context/ToastContext';
import { getShareById } from '../services/shareService';
import { triggerFileDownload } from '../services/fileService';
import { formatBytes, formatDate } from '../utils/formatters';
import { FileIcon } from '../utils/fileIcons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ShareViewPage() {
  const { shareId } = useParams();
  const { currentUser, loading: authLoading } = useAuth();
  const { setPreviewFile } = useFiles();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); // 'not_found' | 'expired' | 'unauthorized'

  useEffect(() => {
    async function loadShareDetails() {
      if (!shareId) return;
      setLoading(true);
      setErrorStatus(null);

      try {
        const data = await getShareById(shareId);
        if (!data) {
          setErrorStatus('not_found');
          return;
        }
        if (data.expired) {
          setErrorStatus('expired');
          return;
        }

        // Authorization check if link was restricted to a specific email
        if (data.sharedWithEmail) {
          if (!currentUser) {
            // Must log in first
            setErrorStatus('auth_required');
            setShare(data);
            return;
          }
          if (currentUser.email.toLowerCase() !== data.sharedWithEmail.toLowerCase()) {
            setErrorStatus('unauthorized');
            setShare(data);
            return;
          }
        }

        setShare(data);
      } catch (err) {
        console.error('Error fetching share link:', err);
        setErrorStatus('not_found');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadShareDetails();
    }
  }, [shareId, currentUser, authLoading]);

  if (loading || authLoading) {
    return <LoadingSpinner message="Verifying secure cloud share authorization..." />;
  }

  if (errorStatus === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Share Link Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This sharing link may have been revoked by the owner, deleted, or does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Share Link Has Expired
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The owner set an expiration date on this link which has passed. Please contact the owner for a refreshed link.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === 'auth_required') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This file is restricted to authorized registered users ({share?.sharedWithEmail}). Please sign in to verify your identity.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Sign In to Access
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (errorStatus === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Unauthorized
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You are signed in as <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.email}</span>, but this file is strictly restricted to <span className="font-semibold text-slate-700 dark:text-slate-200">{share?.sharedWithEmail}</span>.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors text-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            CloudVault
          </span>
        </Link>

        {currentUser ? (
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Go to My Dashboard &rarr;
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main Shared File Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center shadow-inner border border-slate-200/60 dark:border-slate-700/60">
            <FileIcon fileName={share.fileName} mimeType={share.fileType} className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Cloud Share ({share.permission} permission)
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate" title={share.fileName}>
              {share.fileName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatBytes(share.fileSize)} • Shared by {share.ownerEmail}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Owner</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{share.ownerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Access Expiry</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {share.expiresAt ? formatDate(share.expiresAt) : 'Never (Permanent)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Firebase Storage Token Protected</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPreviewFile(share)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Online
            </button>
            <button
              onClick={() => triggerFileDownload(share)}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
        CloudVault Secure Cloud File Sharing • College Mini Project
      </footer>
    </div>
  );
}
