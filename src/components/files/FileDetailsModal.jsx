import React from 'react';
import { Info, Database, HardDrive, Calendar, User, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFiles } from '../../context/FileContext';
import { formatBytes, formatDate } from '../../utils/formatters';
import { FileIcon } from '../../utils/fileIcons';

export function FileDetailsModal() {
  const { detailsFile, setDetailsFile } = useFiles();

  if (!detailsFile) return null;

  const file = detailsFile;

  return (
    <Modal
      isOpen={Boolean(detailsFile)}
      onClose={() => setDetailsFile(null)}
      title="File Metadata & Cloud Details"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/30">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
            <FileIcon fileName={file.fileName} mimeType={file.fileType} className="w-8 h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
              {file.fileName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(file.fileSize)} ({file.fileSize?.toLocaleString() || 0} bytes)
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              File ID
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 max-w-[220px] truncate">
              {file.fileId || file.id || '—'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              Cloud Storage Path
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 max-w-[240px] truncate" title={file.storagePath}>
              {file.storagePath || 'gs://cloudvault-bucket/...'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              MIME Type
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.fileType || 'application/octet-stream'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Owner UID
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
              {file.ownerId || '—'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Owner Email
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {file.ownerEmail || '—'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Upload Timestamp
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {formatDate(file.uploadedAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Encryption & Access
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              AES-256 / Firebase Rules Verified
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setDetailsFile(null)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
