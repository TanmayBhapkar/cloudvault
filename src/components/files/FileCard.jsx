import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Download,
  Share2,
  Edit2,
  Info,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { FileIcon, getFileIconConfig } from '../../utils/fileIcons';
import { formatBytes, formatDate, truncateFileName } from '../../utils/formatters';
import { useFiles } from '../../context/FileContext';
import { triggerFileDownload } from '../../services/fileService';

export function FileCard({ file, isTrashView = false, onRestore }) {
  const { setPreviewFile, setShareFile, setRenameFile, setDetailsFile, setDeleteConfirm } = useFiles();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const config = getFileIconConfig(file.fileName, file.fileType);

  return (
    <div
      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Top row: badge & 3-dot menu */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-md border ${config.bg} ${config.color} ${config.border}`}
        >
          {config.badge}
        </span>

        {/* Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="File actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-30 w-48 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-xs font-medium animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {!isTrashView ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setPreviewFile(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                    Preview File
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      triggerFileDownload(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShareFile(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-slate-400" />
                    Share File
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setRenameFile(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDetailsFile(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
                  >
                    <Info className="w-4 h-4 text-slate-400" />
                    File Details
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteConfirm({ file, isPermanent: false });
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Move to Trash
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRestore?.(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore File
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteConfirm({ file, isPermanent: true });
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Delete Forever
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main card icon / preview thumbnail */}
      <div
        onClick={() => !isTrashView && setPreviewFile(file)}
        className="cursor-pointer flex flex-col items-center justify-center py-6 px-2 my-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 group-hover:bg-brand-50/40 dark:group-hover:bg-brand-950/20 transition-colors"
      >
        <FileIcon fileName={file.fileName} mimeType={file.fileType} className="w-12 h-12 transition-transform duration-200 group-hover:scale-110" />
      </div>

      {/* Bottom row: file title & metadata */}
      <div className="pt-2">
        <h4
          onClick={() => !isTrashView && setPreviewFile(file)}
          className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 truncate mb-1"
          title={file.fileName}
        >
          {file.fileName}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{formatBytes(file.fileSize)}</span>
          <span>{formatDate(file.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
