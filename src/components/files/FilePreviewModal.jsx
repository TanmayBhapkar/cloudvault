import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, FileText, Eye, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFiles } from '../../context/FileContext';
import { formatBytes, formatDate, getFileExtension, getFileCategory } from '../../utils/formatters';
import { FileIcon } from '../../utils/fileIcons';
import { triggerFileDownload } from '../../services/fileService';

export function FilePreviewModal() {
  const { previewFile, setPreviewFile } = useFiles();
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  const file = previewFile;
  const ext = file ? getFileExtension(file.fileName).toLowerCase() : '';
  const category = file ? getFileCategory(file.fileName, file.fileType) : '';

  useEffect(() => {
    if (!file) {
      setTextContent('');
      return;
    }

    if (category === 'code' || ext === 'txt' || ext === 'md' || ext === 'json' || ext === 'csv') {
      if (file.downloadURL && file.downloadURL.startsWith('http')) {
        setLoadingText(true);
        fetch(file.downloadURL)
          .then(res => res.text())
          .then(txt => setTextContent(txt.slice(0, 10000))) // limit first 10k chars for fast preview
          .catch(() => setTextContent('Could not fetch file content preview.'))
          .finally(() => setLoadingText(false));
      } else {
        setTextContent('Sample file preview content for: ' + file.fileName);
      }
    }
  }, [file, category, ext]);

  if (!file) return null;

  const isImage = category === 'images' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isVideo = category === 'videos' || ['mp4', 'webm', 'ogg'].includes(ext);
  const isAudio = category === 'audio' || ['mp3', 'wav', 'ogg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isText = category === 'code' || ['txt', 'md', 'json', 'csv', 'js', 'html', 'css', 'py'].includes(ext);

  return (
    <Modal
      isOpen={Boolean(previewFile)}
      onClose={() => setPreviewFile(null)}
      title="File Preview"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Header Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
              <FileIcon fileName={file.fileName} mimeType={file.fileType} className="w-6 h-6" />
            </div>
            <div className="truncate">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
                {file.fileName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(file.fileSize)} • Uploaded {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerFileDownload(file)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            {file.downloadURL && file.downloadURL !== '#' && (
              <a
                href={file.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Raw URL
              </a>
            )}
          </div>
        </div>

        {/* Preview Container */}
        <div className="min-h-[350px] max-h-[550px] overflow-auto rounded-xl bg-slate-900/5 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
          {isImage ? (
            <img
              src={file.downloadURL || ''}
              alt={file.fileName}
              className="max-h-[500px] w-auto max-w-full rounded-lg object-contain shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : isPdf ? (
            <iframe
              src={`${file.downloadURL}#toolbar=0`}
              title={file.fileName}
              className="w-full h-[500px] rounded-lg border-0 shadow-sm"
            />
          ) : isVideo ? (
            <video
              controls
              className="max-h-[480px] w-full rounded-lg shadow-md"
              src={file.downloadURL}
            >
              Your browser does not support video playback.
            </video>
          ) : isAudio ? (
            <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
              <FileIcon fileName={file.fileName} className="w-16 h-16 mx-auto mb-4" />
              <audio controls className="w-full mt-2" src={file.downloadURL}>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : isText ? (
            <div className="w-full h-full text-left">
              {loadingText ? (
                <div className="text-center py-12 text-slate-400">Loading document preview...</div>
              ) : (
                <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-lg overflow-x-auto max-h-[480px] whitespace-pre-wrap leading-relaxed">
                  {textContent || 'No text preview available.'}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center p-8 max-w-sm">
              <FileIcon fileName={file.fileName} mimeType={file.fileType} className="w-16 h-16 mx-auto mb-3" />
              <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                No Direct In-Browser Preview
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                This file format (.{ext || 'binary'}) cannot be directly previewed in the browser. You can download it to view with your native desktop applications.
              </p>
              <button
                onClick={() => triggerFileDownload(file)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Download to Open
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
