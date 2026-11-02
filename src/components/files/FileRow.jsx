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
import { FileIcon } from '../../utils/fileIcons';
import { formatBytes, formatDate } from '../../utils/formatters';
import { useFiles } from '../../context/FileContext';
import { triggerFileDownload } from '../../services/fileService';

export function FileRow({ file, isTrashView = false, onRestore }) {
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

  return (
    <tr
      className="group hover:bg-brand-50/40 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/80 cursor-pointer"
      onClick={() => !isTrashView && setPreviewFile(file)}
    >
      {/* File Name & Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <FileIcon fileName={file.fileName} mimeType={file.fileType} className="w-5 h-5" />
          </div>
          <span
            className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate max-w-xs sm:max-w-md"
            title={file.fileName}
          >
            {file.fileName}
          </span>
        </div>
      </td>

      {/* Owner */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
        {file.ownerEmail || 'You'}
      </td>

      {/* Upload Date */}
      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
        {formatDate(file.uploadedAt)}
      </td>

      {/* File Size */}
      <td className="py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatBytes(file.fileSize)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block text-left" ref={menuRef}>
          <div className="flex items-center justify-end gap-1">
            {!isTrashView && (
              <>
                <button
                  type="button"
                  onClick={() => triggerFileDownload(file)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:inline-flex"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShareFile(file)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:inline-flex"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-48 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-xs font-medium animate-fade-in text-left">
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
                    Share
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
                    Details
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
                    Restore
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
      </td>
    </tr>
  );
}
