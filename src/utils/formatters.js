/**
 * Format bytes to human readable format (KB, MB, GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format Firestore timestamp or Date object or ISO string to readable date
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  
  let date;
  if (typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number' || typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    return '—';
  }

  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format date to relative time ("5 minutes ago", "Yesterday", etc.)
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '—';
  let date;
  if (typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number' || typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    return '—';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

/**
 * Extract extension from filename
 */
export function getFileExtension(filename = '') {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop().toLowerCase();
  }
  return '';
}

/**
 * Determine category of file (document, image, video, archive, code, audio, other)
 */
export function getFileCategory(filename = '', mimeType = '') {
  const ext = getFileExtension(filename);
  const mime = (mimeType || '').toLowerCase();

  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt'];
  const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
  const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'wmv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  const codeExts = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'sql'];

  if (docExts.includes(ext) || mime.includes('pdf') || mime.includes('document') || mime.includes('text/')) {
    return 'documents';
  }
  if (imgExts.includes(ext) || mime.startsWith('image/')) {
    return 'images';
  }
  if (videoExts.includes(ext) || mime.startsWith('video/')) {
    return 'videos';
  }
  if (audioExts.includes(ext) || mime.startsWith('audio/')) {
    return 'audio';
  }
  if (archiveExts.includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return 'archives';
  }
  if (codeExts.includes(ext)) {
    return 'code';
  }
  return 'others';
}

/**
 * Truncate filename preserving extension
 */
export function truncateFileName(fileName = '', maxLen = 28) {
  if (fileName.length <= maxLen) return fileName;
  const ext = getFileExtension(fileName);
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  const charsToShow = maxLen - ext.length - 4;
  if (charsToShow <= 3) return fileName.substring(0, maxLen - 3) + '...';
  return `${baseName.substring(0, charsToShow)}...${ext ? '.' + ext : ''}`;
}
