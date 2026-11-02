import React, { useState } from 'react';
import { Copy, Check, Share2, Mail, Shield, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createShare } from '../../services/shareService';
import { formatBytes } from '../../utils/formatters';

export function ShareModal() {
  const { shareFile, setShareFile } = useFiles();
  const { currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [createdShare, setCreatedShare] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!shareFile) return null;

  const handleCreateShare = async (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const share = await createShare({
        file: shareFile,
        sharedWithEmail: email,
        permission,
        expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : null,
        currentUser,
      });

      setCreatedShare(share);
      toastSuccess(`Sharing link created successfully for "${shareFile.fileName}".`);
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!createdShare) return '';
    return `${window.location.origin}/share/${createdShare.shareId}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toastSuccess('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setEmail('');
    setCreatedShare(null);
    setCopied(false);
    setShareFile(null);
  };

  return (
    <Modal
      isOpen={Boolean(shareFile)}
      onClose={handleReset}
      title="Share File"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* File summary banner */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {shareFile.fileName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(shareFile.fileSize)}
            </p>
          </div>
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-900/40">
            CloudVault Protected
          </span>
        </div>

        {/* Share creation form */}
        {!createdShare ? (
          <form onSubmit={handleCreateShare} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Share With User by Email (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@college.edu or leave blank for link"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                If specified, only this user can access the shared file after logging in.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  Permission Level
                </label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="viewer">Viewer (Read & Download)</option>
                  <option value="editor">Editor (Manage & Rename)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Link Expiration
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Never Expires</option>
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Create Secure Share
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Share result with link & copy */
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm mb-1">
                <Check className="w-4 h-4" />
                Share Link Ready!
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {createdShare.sharedWithEmail
                  ? `Restricted to ${createdShare.sharedWithEmail} with ${createdShare.permission} role.`
                  : `Anyone with this authenticated link can view with ${createdShare.permission} permission.`}
                {createdShare.expiresAt && ` (Expires on ${new Date(createdShare.expiresAt).toLocaleDateString()})`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
