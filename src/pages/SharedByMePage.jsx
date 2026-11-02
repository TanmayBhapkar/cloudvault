import React, { useState, useEffect } from 'react';
import {
  Share2,
  Trash2,
  Copy,
  Check,
  Shield,
  Calendar,
  Mail,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { useToast } from '../context/ToastContext';
import { getFilesSharedByOwner, revokeShare } from '../services/shareService';
import { formatBytes, formatDate } from '../utils/formatters';
import { FileIcon } from '../utils/fileIcons';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function SharedByMePage() {
  const { currentUser } = useAuth();
  const { setPreviewFile } = useFiles();
  const { toastSuccess, toastError } = useToast();

  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const loadSharedByMe = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const data = await getFilesSharedByOwner(currentUser.uid);
      setShares(data || []);
    } catch (err) {
      console.error('Error fetching shares by owner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedByMe();
  }, [currentUser]);

  const handleRevoke = async (share) => {
    if (!currentUser) return;
    try {
      await revokeShare(share.shareId || share.id, currentUser);
      toastSuccess(`Revoked sharing access for "${share.fileName}".`);
      setShares((prev) => prev.filter((s) => (s.shareId || s.id) !== (share.shareId || share.id)));
    } catch (err) {
      console.error(err);
      toastError('Failed to revoke share link.');
    }
  };

  const handleCopy = (shareId) => {
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    toastSuccess('Share link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Share2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Shared By Me
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Active sharing links, collaborator permissions, and access controls for your files.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your shared links..." />
      ) : shares.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Shared With</th>
                <th className="py-3 px-4">Permission</th>
                <th className="py-3 px-4 hidden md:table-cell">Expires</th>
                <th className="py-3 px-4 hidden sm:table-cell">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share) => {
                const sId = share.shareId || share.id;
                const isCopied = copiedId === sId;

                return (
                  <tr
                    key={sId}
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
                      {share.sharedWithEmail ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {share.sharedWithEmail}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Anyone with link</span>
                      )}
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

                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {formatDate(share.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(sId)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isCopied
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Copy Share Link"
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setPreviewFile(share)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRevoke(share)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Share2}
          title="No active file shares"
          description="You haven't shared any files yet. You can share any file from the 'My Files' tab using the 3-dot action menu."
        />
      )}
    </div>
  );
}
