import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  HardDrive,
  Users2,
  UploadCloud,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { formatBytes, formatDate, formatRelativeTime } from '../utils/formatters';
import { DEFAULT_QUOTA_BYTES, getStoragePercentage, getQuotaStatus } from '../utils/storageQuota';
import { getUserActivities } from '../services/activityService';
import { getFilesSharedWithUser, getFilesSharedByOwner } from '../services/shareService';
import { FileCard } from '../components/files/FileCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { files, storageStats, loadingFiles } = useFiles();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    async function loadDashboardExtras() {
      if (!currentUser?.uid) return;
      setLoadingExtras(true);
      try {
        const [acts, sharedByMe, sharedWithMe] = await Promise.all([
          getUserActivities(currentUser.uid, 6),
          getFilesSharedByOwner(currentUser.uid),
          getFilesSharedWithUser(currentUser.email),
        ]);
        setActivities(acts || []);
        setSharedCount((sharedByMe?.length || 0) + (sharedWithMe?.length || 0));
      } catch (err) {
        console.error('Error loading dashboard extras:', err);
      } finally {
        setLoadingExtras(false);
      }
    }
    loadDashboardExtras();
  }, [currentUser]);

  const usedBytes = storageStats.totalStorageUsed || 0;
  const availableBytes = Math.max(0, DEFAULT_QUOTA_BYTES - usedBytes);
  const percentage = getStoragePercentage(usedBytes, DEFAULT_QUOTA_BYTES);
  const quotaInfo = getQuotaStatus(usedBytes, DEFAULT_QUOTA_BYTES);

  const recentFiles = storageStats.recentUploads || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Quick Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-brand-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5" />
              CloudVault Drive Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {currentUser?.name || currentUser?.displayName || 'Scholar'}!
            </h1>
            <p className="text-sm text-sky-100">
              Welcome to your personal cloud repository. All files are securely stored in Google Firebase Cloud Storage and indexed in Cloud Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-slate-50 active:scale-95 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Quick Upload
            </button>
            <button
              onClick={() => navigate('/files')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              View All Files
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Uploaded Files
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {files.length}
            </h3>
            <span className="text-xs text-slate-500">active objects</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Synchronized with Cloud Firestore
          </p>
        </div>

        {/* Total Storage Used */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Storage Used
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatBytes(usedBytes)}
            </h3>
            <span className="text-xs font-mono text-brand-600 dark:text-brand-400">
              ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full ${quotaInfo.color} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Available Storage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Free Capacity
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatBytes(availableBytes)}
            </h3>
            <span className="text-xs text-slate-500">remaining</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Total quota: {formatBytes(DEFAULT_QUOTA_BYTES)}
          </p>
        </div>

        {/* Shared Files */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shared Files
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {sharedCount}
            </h3>
            <span className="text-xs text-slate-500">shares active</span>
          </div>
          <Link
            to="/shared-with-me"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 inline-block"
          >
            Manage shared items &rarr;
          </Link>
        </div>
      </div>

      {/* Storage Breakdown Quick Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Storage Usage & File Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(usedBytes)} of {formatBytes(DEFAULT_QUOTA_BYTES)} used ({percentage}%)
            </p>
          </div>
          <Link
            to="/storage"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Multi-segmented bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${(storageStats.categorySizes.documents / (usedBytes || 1)) * percentage}%` }}
            title={`Documents: ${formatBytes(storageStats.categorySizes.documents)}`}
          />
          <div
            className="bg-purple-500 h-full transition-all"
            style={{ width: `${(storageStats.categorySizes.images / (usedBytes || 1)) * percentage}%` }}
            title={`Images: ${formatBytes(storageStats.categorySizes.images)}`}
          />
          <div
            className="bg-rose-500 h-full transition-all"
            style={{ width: `${(storageStats.categorySizes.videos / (usedBytes || 1)) * percentage}%` }}
            title={`Videos: ${formatBytes(storageStats.categorySizes.videos)}`}
          />
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${(storageStats.categorySizes.archives / (usedBytes || 1)) * percentage}%` }}
            title={`Archives: ${formatBytes(storageStats.categorySizes.archives)}`}
          />
          <div
            className="bg-cyan-500 h-full transition-all"
            style={{ width: `${(storageStats.categorySizes.code / (usedBytes || 1)) * percentage}%` }}
            title={`Code: ${formatBytes(storageStats.categorySizes.code)}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Documents ({formatBytes(storageStats.categorySizes.documents)})
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Images ({formatBytes(storageStats.categorySizes.images)})
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Videos ({formatBytes(storageStats.categorySizes.videos)})
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Archives ({formatBytes(storageStats.categorySizes.archives)})
          </span>
        </div>
      </div>

      {/* Recent Files & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Uploaded Files
              </h2>
            </div>
            <Link
              to="/files"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              See all files &rarr;
            </Link>
          </div>

          {loadingFiles ? (
            <LoadingSpinner message="Fetching your cloud files..." />
          ) : recentFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentFiles.map((file) => (
                <FileCard key={file.fileId || file.id} file={file} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No files in your vault yet"
              description="Upload research papers, images, code, or datasets to start using CloudVault."
              actionLabel="Upload Files"
              onAction={() => navigate('/upload')}
            />
          )}
        </div>

        {/* Recent Activity Log (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.activityId || Math.random()} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {act.action}
                  </p>
                  {act.fileName && (
                    <p className="text-xs text-brand-600 dark:text-brand-400 truncate mt-0.5">
                      {act.fileName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatRelativeTime(act.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
