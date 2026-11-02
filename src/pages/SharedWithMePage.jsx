import React, { useState, useEffect } from 'react';
import {
  Users2,
  Download,
  Eye,
  Calendar,
  Shield,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { getFilesSharedWithUser } from '../services/shareService';
import { triggerFileDownload } from '../services/fileService';
import { formatBytes, formatDate } from '../utils/formatters';
import { FileIcon } from '../utils/fileIcons';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function SharedWithMePage() {
  const { currentUser } = useAuth();
  const { setPreviewFile } = useFiles();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShared() {
      if (!currentUser?.email) return;
      setLoading(true);
      try {
        const data = await getFilesSharedWithUser(currentUser.email);
        setSharedFiles(data || []);
      } catch (err) {
        console.error('Error loading files shared with user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShared();
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Shared With Me
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Files that other registered CloudVault users or lab partners have shared with your account.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Checking shared files..." />
      ) : sharedFiles.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Permission</th>
                <th className="py-3 px-4 hidden md:table-cell">Expires</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sharedFiles.map((share) => (
                <tr
                  key={share.shareId || share.id}
                  className="hover:bg-brand-50/40 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/80"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        <FileIcon fileName={share.fileName} mimeType={share.fileType} className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                        {share.fileName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {share.ownerEmail}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        share.permission === 'editor'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {share.permission === 'editor' ? 'Editor' : 'Viewer'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {share.expiresAt ? formatDate(share.expiresAt) : 'Never'}
                  </td>

                  <td className="py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {formatBytes(share.fileSize)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewFile(share)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Preview File"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => triggerFileDownload(share)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Users2}
          title="No files shared with you yet"
          description="When other CloudVault users share documents or folders with your email, they will appear here."
        />
      )}
    </div>
  );
}
