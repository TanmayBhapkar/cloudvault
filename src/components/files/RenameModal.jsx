import React, { useState, useEffect } from 'react';
import { Edit2, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { renameFile as renameFileService } from '../../services/fileService';

export function RenameModal() {
  const { renameFile, setRenameFile, refreshFiles } = useFiles();
  const { currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (renameFile) {
      setNewName(renameFile.fileName || '');
    }
  }, [renameFile]);

  if (!renameFile) return null;

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !currentUser) return;
    if (newName.trim() === renameFile.fileName) {
      setRenameFile(null);
      return;
    }

    setLoading(true);
    try {
      await renameFileService(renameFile.fileId, newName.trim(), currentUser);
      toastSuccess(`File renamed to "${newName.trim()}".`);
      setRenameFile(null);
      await refreshFiles();
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Failed to rename file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(renameFile)}
      onClose={() => setRenameFile(null)}
      title="Rename File"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleRename} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            File Name
          </label>
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRenameFile(null)}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !newName.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Rename
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
