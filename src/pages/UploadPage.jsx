import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  X,
  CheckCircle2,
  HardDrive,
  FileText,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../context/FileContext';
import { useToast } from '../context/ToastContext';
import { uploadSingleFile } from '../services/fileService';
import { formatBytes, getFileExtension } from '../utils/formatters';
import { FileIcon } from '../utils/fileIcons';
import { MAX_FILE_SIZE_BYTES } from '../utils/storageQuota';
import { UploadProgressCard } from '../components/files/UploadProgressCard';

export function UploadPage() {
  const { currentUser } = useAuth();
  const { refreshFiles } = useFiles();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadTasks, setUploadTasks] = useState([]); // [{ id, file, progress, status, errorMessage }]
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleFilesAdded = (filesList) => {
    const valid = [];
    filesList.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toastWarning(`"${file.name}" exceeds the 100 MB limit.`);
        return;
      }
      valid.push({
        id: 'queued_' + Date.now() + Math.random().toString(36).substring(2, 6),
        file,
      });
    });

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
    }
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0 || !currentUser) return;
    setIsUploading(true);

    const initialTasks = selectedFiles.map((item) => ({
      id: item.id,
      file: item.file,
      progress: 0,
      status: 'uploading', // 'uploading' | 'completed' | 'error'
      errorMessage: '',
    }));

    setUploadTasks(initialTasks);
    setSelectedFiles([]); // clear queue from upload staged view

    let completedCounter = 0;
    const totalToUpload = initialTasks.length;

    initialTasks.forEach((task) => {
      uploadSingleFile({
        file: task.file,
        user: currentUser,
        onProgress: (pct) => {
          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress: pct } : t))
          );
        },
        onComplete: (savedFile) => {
          completedCounter++;
          setUploadTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, progress: 100, status: 'completed' } : t
            )
          );
          if (completedCounter === totalToUpload) {
            setIsUploading(false);
            toastSuccess(`Successfully uploaded ${totalToUpload} file(s) to Cloud Storage!`);
            refreshFiles();
          }
        },
        onError: (err) => {
          completedCounter++;
          setUploadTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? { ...t, status: 'error', errorMessage: err.message || 'Upload failed' }
                : t
            )
          );
          if (completedCounter === totalToUpload) {
            setIsUploading(false);
            refreshFiles();
          }
        },
      });
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Cloud File Upload
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload documents, media, spreadsheets, or code directly to Firebase Cloud Storage.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-200 text-center ${
          dragActive
            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400 dark:hover:border-brand-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip,.mp4,.mp3,.json,.csv,.js,.ts"
        />

        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          Drag and drop files here, or <span className="text-brand-600 dark:text-brand-400 underline">browse</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4">
          Support for single or multiple files: PDF, Word, Excel, PowerPoint, Images, Videos, Archives, and Code files up to 100 MB each.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">PDF</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">DOC/DOCX</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">XLS/XLSX</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">PPT/PPTX</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">PNG/JPG</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">MP4</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">ZIP</span>
        </div>
      </div>

      {/* Selected Staged Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Ready to Upload ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''})
            </h3>
            <button
              onClick={clearSelectedFiles}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              Clear Queue
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {selectedFiles.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    <FileIcon fileName={item.file.name} className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(item.file.size)} • {item.file.type || 'Unknown MIME'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSelectedFile(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isUploading}
              onClick={clearSelectedFiles}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={startUpload}
              className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading to Cloud...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Start Cloud Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Upload Progress Card */}
      <UploadProgressCard
        uploads={uploadTasks}
        onDismiss={() => setUploadTasks([])}
      />
    </div>
  );
}
