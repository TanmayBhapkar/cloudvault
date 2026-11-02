import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Video,
  Music,
  Code2,
  FileCode,
  FileQuestion,
  File
} from 'lucide-react';
import { getFileExtension } from './formatters';

export function getFileIconConfig(fileName = '', mimeType = '') {
  const ext = getFileExtension(fileName).toLowerCase();

  switch (ext) {
    case 'pdf':
      return {
        icon: FileText,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-900/50',
        badge: 'PDF',
      };
    case 'doc':
    case 'docx':
      return {
        icon: FileText,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-900/50',
        badge: 'DOC',
      };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return {
        icon: FileSpreadsheet,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-900/50',
        badge: 'XLS',
      };
    case 'ppt':
    case 'pptx':
      return {
        icon: FileText,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-900/50',
        badge: 'PPT',
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return {
        icon: ImageIcon,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-900/50',
        badge: 'IMG',
      };
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'webm':
      return {
        icon: Video,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-200 dark:border-red-900/50',
        badge: 'VIDEO',
      };
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'm4a':
      return {
        icon: Music,
        color: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 dark:bg-pink-950/40',
        border: 'border-pink-200 dark:border-pink-900/50',
        badge: 'AUDIO',
      };
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return {
        icon: FileArchive,
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-900/50',
        badge: 'ZIP',
      };
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
    case 'py':
    case 'java':
    case 'sql':
      return {
        icon: Code2,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        border: 'border-cyan-200 dark:border-cyan-900/50',
        badge: ext.toUpperCase(),
      };
    case 'txt':
    case 'md':
      return {
        icon: FileCode,
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-200 dark:border-slate-700',
        badge: 'TXT',
      };
    default:
      return {
        icon: File,
        color: 'text-brand-600 dark:text-brand-400',
        bg: 'bg-brand-50 dark:bg-brand-950/40',
        border: 'border-brand-200 dark:border-brand-900/50',
        badge: ext ? ext.toUpperCase().slice(0, 4) : 'FILE',
      };
  }
}

export function FileIcon({ fileName, mimeType, className = 'w-6 h-6' }) {
  const config = getFileIconConfig(fileName, mimeType);
  const IconComponent = config.icon;
  return <IconComponent className={`${className} ${config.color}`} />;
}
