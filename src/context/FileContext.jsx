import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getUserFiles, getTrashedFiles } from '../services/fileService';
import { getFileCategory } from '../utils/formatters';

const FileContext = createContext();

export function FileProvider({ children }) {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Modals state
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [renameFile, setRenameFile] = useState(null);
  const [detailsFile, setDetailsFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { file, isPermanent: boolean }

  // Search, filter, view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // all, documents, images, videos, archives, code
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, name-asc, name-desc, size-desc, size-asc
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const refreshFiles = useCallback(async () => {
    if (!currentUser?.uid) {
      setFiles([]);
      setTrashedFiles([]);
      return;
    }
    setLoadingFiles(true);
    try {
      const [userFiles, trashed] = await Promise.all([
        getUserFiles(currentUser.uid),
        getTrashedFiles(currentUser.uid),
      ]);
      setFiles(userFiles || []);
      setTrashedFiles(trashed || []);
    } catch (err) {
      console.error('Error refreshing files:', err);
    } finally {
      setLoadingFiles(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  // Derived statistics for dashboard and storage management
  const storageStats = useMemo(() => {
    let totalSize = 0;
    const categorySizes = {
      documents: 0,
      images: 0,
      videos: 0,
      archives: 0,
      audio: 0,
      code: 0,
      others: 0,
    };

    files.forEach(file => {
      const size = file.fileSize || 0;
      totalSize += size;
      const cat = getFileCategory(file.fileName, file.fileType);
      if (categorySizes[cat] !== undefined) {
        categorySizes[cat] += size;
      } else {
        categorySizes.others += size;
      }
    });

    const largestFiles = [...files]
      .sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0))
      .slice(0, 5);

    const recentUploads = [...files]
      .sort((a, b) => {
        const da = new Date(a.uploadedAt || 0).getTime();
        const db = new Date(b.uploadedAt || 0).getTime();
        return db - da;
      })
      .slice(0, 5);

    return {
      totalFiles: files.length,
      totalStorageUsed: totalSize,
      categorySizes,
      largestFiles,
      recentUploads,
    };
  }, [files]);

  // Filtered and sorted files for the file manager
  const filteredFiles = useMemo(() => {
    return files
      .filter(file => {
        // Category filter
        if (activeCategory !== 'all') {
          const cat = getFileCategory(file.fileName, file.fileType);
          if (cat !== activeCategory) return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!file.fileName.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.fileName.localeCompare(b.fileName);
        if (sortBy === 'name-desc') return b.fileName.localeCompare(a.fileName);
        if (sortBy === 'size-desc') return (b.fileSize || 0) - (a.fileSize || 0);
        if (sortBy === 'size-asc') return (a.fileSize || 0) - (b.fileSize || 0);
        if (sortBy === 'date-asc') {
          return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
        }
        // default date-desc
        return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      });
  }, [files, activeCategory, searchQuery, sortBy]);

  return (
    <FileContext.Provider
      value={{
        files,
        trashedFiles,
        loadingFiles,
        refreshFiles,
        filteredFiles,
        storageStats,
        // Modals
        previewFile,
        setPreviewFile,
        shareFile,
        setShareFile,
        renameFile,
        setRenameFile,
        detailsFile,
        setDetailsFile,
        deleteConfirm,
        setDeleteConfirm,
        // View & Filters
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}
