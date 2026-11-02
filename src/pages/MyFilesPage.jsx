import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Search,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Code2,
  Files
} from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { FileCard } from '../components/files/FileCard';
import { FileRow } from '../components/files/FileRow';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function MyFilesPage() {
  const {
    filteredFiles,
    loadingFiles,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
  } = useFiles();

  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Files', icon: Files },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'archives', label: 'Archives', icon: FileArchive },
    { id: 'code', label: 'Code & Scripts', icon: Code2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Title & Quick Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            My Cloud Files
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, manage, search, and download your cloud documents.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          Upload More Files
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Sort & View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input on Files Page */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
            >
              <option value="date-desc">Newest Uploads</option>
              <option value="date-asc">Oldest Uploads</option>
              <option value="name-asc">File Name (A-Z)</option>
              <option value="name-desc">File Name (Z-A)</option>
              <option value="size-desc">Size (Largest first)</option>
              <option value="size-asc">Size (Smallest first)</option>
            </select>
          </div>

          {/* Grid vs Table View Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {loadingFiles ? (
        <LoadingSpinner message="Loading files from cloud..." />
      ) : filteredFiles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <FileCard key={file.fileId || file.id} file={file} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Owner</th>
                  <th className="py-3 px-4 hidden md:table-cell">Upload Date</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <FileRow key={file.fileId || file.id} file={file} />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <EmptyState
          title={searchQuery ? 'No matching files found' : 'No files in this category'}
          description={
            searchQuery
              ? `No files matching "${searchQuery}". Try a different keyword.`
              : 'Upload files into this category to view them here.'
          }
          actionLabel="Upload Files"
          onAction={() => navigate('/upload')}
        />
      )}
    </div>
  );
}
