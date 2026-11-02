import React from 'react';
import { CheckCircle2, AlertCircle, X, FileUp } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { FileIcon } from '../../utils/fileIcons';

export function UploadProgressCard({ uploads, onDismiss }) {
  if (!uploads || uploads.length === 0) return null;

  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const isAllComplete = completedCount === uploads.length;

  return (
    <div className="fixed bottom-5 right-5 z-40 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {isAllComplete
              ? `Uploaded ${completedCount} file${completedCount > 1 ? 's' : ''}`
              : `Uploading (${completedCount}/${uploads.length})`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Upload Items List */}
      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
        {uploads.map((item) => (
          <div key={item.id} className="p-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileIcon fileName={item.file.name} className="w-4 h-4 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  {item.file.name}
                </span>
              </div>
              <span className="shrink-0 text-slate-400 font-mono text-[11px]">
                {formatBytes(item.file.size)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  item.status === 'error'
                    ? 'bg-rose-500'
                    : item.status === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-brand-500'
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {item.status === 'uploading' && `Uploading... ${item.progress}%`}
                {item.status === 'completed' && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {item.errorMessage || 'Failed'}
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
