import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FolderOpen,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { restoreFromTrash, permanentlyDeleteFile } from '../services/fileService';
import { FileCard } from '../components/files/FileCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function TrashPage() {
  const { trashedFiles, loadingFiles, refreshFiles } = useFiles();
  const { currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleRestore = async (file) => {
    if (!currentUser) return;
    try {
      await restoreFromTrash(file, currentUser);
      toastSuccess(`Restored "${file.fileName}" to your files.`);
      await refreshFiles();
    } catch (err) {
      console.error(err);
      toastError('Failed to restore file.');
    }
  };

  const handleEmptyTrash = async () => {
    if (trashedFiles.length === 0 || !currentUser) return;
    if (!window.confirm(`Are you sure you want to permanently delete all ${trashedFiles.length} file(s) in Trash? This cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      for (const file of trashedFiles) {
        await permanentlyDeleteFile(file, currentUser);
      }
      toastSuccess('Trash emptied successfully.');
      await refreshFiles();
    } catch (err) {
      console.error(err);
      toastError('Failed to empty trash.');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            Trash
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Items in trash can be restored back to your drive or permanently removed to reclaim cloud storage.
          </p>
        </div>

        {trashedFiles.length > 0 && (
          <button
            disabled={bulkDeleting}
            onClick={handleEmptyTrash}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            {bulkDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Emptying Trash...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Empty Trash ({trashedFiles.length})
              </>
            )}
          </button>
        )}
      </div>

      {trashedFiles.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Items in the trash still count toward your project storage quota until you permanently delete them.
          </span>
        </div>
      )}

      {loadingFiles ? (
        <LoadingSpinner message="Checking trash bin..." />
      ) : trashedFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trashedFiles.map((file) => (
            <FileCard
              key={file.fileId || file.id}
              file={file}
              isTrashView={true}
              onRestore={handleRestore}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Trash2}
          title="Trash is clean"
          description="There are no deleted files in your trash. Files you remove from My Files will appear here."
        />
      )}
    </div>
  );
}
