import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Code2,
  UploadCloud,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  DEFAULT_QUOTA_BYTES,
  CLOUD_PLANS,
  getStoragePercentage,
  getQuotaStatus
} from '../utils/storageQuota';
import { FileCard } from '../components/files/FileCard';

export function StoragePage() {
  const { storageStats } = useFiles();
  const navigate = useNavigate();

  const usedBytes = storageStats.totalStorageUsed || 0;
  const percentage = getStoragePercentage(usedBytes, DEFAULT_QUOTA_BYTES);
  const quotaInfo = getQuotaStatus(usedBytes, DEFAULT_QUOTA_BYTES);
  const availableBytes = Math.max(0, DEFAULT_QUOTA_BYTES - usedBytes);

  const categoryBreakdown = [
    {
      label: 'Documents & PDFs',
      bytes: storageStats.categorySizes.documents,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      label: 'Images & Photos',
      bytes: storageStats.categorySizes.images,
      icon: ImageIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      label: 'Videos & Recordings',
      bytes: storageStats.categorySizes.videos,
      icon: Video,
      color: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      label: 'Archives & Zips',
      bytes: storageStats.categorySizes.archives,
      icon: FileArchive,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'Code & Scripts',
      bytes: storageStats.categorySizes.code,
      icon: Code2,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <HardDrive className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Cloud Storage & Quota Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your Firebase storage consumption, inspect largest files, and analyze storage distribution.
        </p>
      </div>

      {/* Quota Warning Banner if > 80% */}
      {percentage >= 80 && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          percentage >= 95
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">{quotaInfo.message}</p>
            <p>Please delete unused files from the Trash or upgrade your quota to avoid upload disruptions.</p>
          </div>
        </div>
      )}

      {/* Main Storage Gauge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Storage Consumption
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {formatBytes(usedBytes)}
              </h2>
              <span className="text-sm font-semibold text-slate-400">
                of {formatBytes(DEFAULT_QUOTA_BYTES)} used ({percentage}%)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {formatBytes(availableBytes)} Free Space
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Firebase Spark/Blaze Tier</p>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden flex">
          {categoryBreakdown.map((item, idx) => {
            const catPct = (item.bytes / (usedBytes || 1)) * percentage;
            return (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-500`}
                style={{ width: `${catPct}%` }}
                title={`${item.label}: ${formatBytes(item.bytes)}`}
              />
            );
          })}
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {categoryBreakdown.map((item, idx) => {
            const Icon = item.icon;
            const itemPct = usedBytes > 0 ? ((item.bytes / usedBytes) * 100).toFixed(1) : 0;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bgLight} ${item.textColor} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {itemPct}% of used space
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formatBytes(item.bytes)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Largest Files Consuming Storage
        </h3>

        {storageStats.largestFiles && storageStats.largestFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageStats.largestFiles.map((file) => (
              <FileCard key={file.fileId || file.id} file={file} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No files available to calculate largest items.</p>
        )}
      </div>

      {/* Cloud Tier Architecture Note & Plans */}
      <div className="p-6 rounded-3xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Cloud Computing Storage Quota Notice
            </h4>
            <p>
              In production Google Cloud Platform architectures, storage limits are determined by your Google Cloud Project billing configuration (Firebase Spark free plan allows 5 GB of Cloud Storage and 1 GB of Cloud Firestore storage). Upgrades to the Blaze plan support multi-terabyte scalable quotas.
            </p>
          </div>
        </div>

        {/* Cloud Plans Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-brand-200/60 dark:border-brand-900/40">
          {CLOUD_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                plan.id === 'starter'
                  ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {plan.name}
                </h5>
                {plan.id === 'starter' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                    Active Plan
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                {plan.price}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {plan.description}
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
