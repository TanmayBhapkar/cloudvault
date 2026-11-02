import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { moveToTrash, permanentlyDeleteFile } from '../../services/fileService';

export function ConfirmModal() {
  const { deleteConfirm, setDeleteConfirm, refreshFiles } = useFiles();
  const { currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [loading, setLoading] = useState(false);

  if (!deleteConfirm) return null;

  const { file, isPermanent } = deleteConfirm;

  const handleDelete = async () => {
    if (!file || !currentUser) return;
    setLoading(true);
    try {
      if (isPermanent) {
        await permanentlyDeleteFile(file, currentUser);
        toastSuccess(`"${file.fileName}" was permanently deleted.`);
      } else {
        await moveToTrash(file, currentUser);
        toastSuccess(`"${file.fileName}" was moved to trash.`);
      }
      setDeleteConfirm(null);
      await refreshFiles();
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Failed to delete file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(deleteConfirm)}
      onClose={() => setDeleteConfirm(null)}
      title={isPermanent ? 'Permanently Delete File' : 'Move File to Trash'}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-900 dark:text-rose-200">
            {isPermanent ? (
              <p>
                Are you sure you want to <strong>permanently delete</strong>{' '}
                <span className="font-semibold text-rose-950 dark:text-white">"{file.fileName}"</span>? This will immediately remove it from Firebase Cloud Storage and Cloud Firestore. This action cannot be undone.
              </p>
            ) : (
              <p>
                Move <span className="font-semibold text-rose-950 dark:text-white">"{file.fileName}"</span> to Trash? You can restore it later from the Trash folder at any time.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {isPermanent ? 'Delete Forever' : 'Move to Trash'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
