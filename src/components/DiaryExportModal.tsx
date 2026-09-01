import React, { useState } from 'react';
import {
  X,
  Download,
  BookOpen,
  FileText,
  Printer,
  Check,
  Calendar,
  Image as ImageIcon,
  Tag,
  Eye,
} from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile } from '../types';
import { THEMES } from '../utils/themeConfig';
import {
  generateHtmlDiary,
  generatePlainTextDiary,
  generateMarkdownDiary,
  downloadFile,
} from '../utils/diaryExporter';

interface DiaryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  user: UserProfile;
  themeMode: ThemeMode;
  selectedTagFilter?: string | null;
}

export const DiaryExportModal: React.FC<DiaryExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  user,
  themeMode,
  selectedTagFilter,
}) => {
  const [exportFormat, setExportFormat] = useState<'html' | 'txt' | 'md'>('html');
  const [includeOnlyFilter, setIncludeOnlyFilter] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'options' | 'preview'>('options');

  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  if (!isOpen) return null;

  const targetEntries = includeOnlyFilter && selectedTagFilter
    ? entries.filter((e) => e.tags && e.tags.includes(selectedTagFilter))
    : entries;

  const userName = user.name || 'My';

  const handleDownload = () => {
    const filenameBase = `${userName.toLowerCase().replace(/\s+/g, '_')}_daily_diary_${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === 'html') {
      const content = generateHtmlDiary(
        targetEntries,
        user,
        `${userName}'s Daily Diary`
      );
      downloadFile(content, `${filenameBase}.html`, 'text/html');
    } else if (exportFormat === 'txt') {
      const content = generatePlainTextDiary(targetEntries, user);
      downloadFile(content, `${filenameBase}.txt`, 'text/plain');
    } else if (exportFormat === 'md') {
      const content = generateMarkdownDiary(targetEntries, user);
      downloadFile(content, `${filenameBase}.md`, 'text/markdown');
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleDirectPrint = () => {
    const htmlContent = generateHtmlDiary(
      targetEntries,
      user,
      `${userName}'s Daily Diary`
    );
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div
      id="diary-export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="diary-export-modal-container"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder} text-stone-900 dark:text-stone-100 font-sans animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200/50 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">Download Daily Diary</h2>
              <p className="text-xs opacity-70">
                Export your personal writing formatted with clean dates and times
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-500/10 transition-colors opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Options vs Live Preview */}
        <div className="flex items-center border-b border-stone-200/40 dark:border-stone-800 px-6 pt-2 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setPreviewTab('options')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              previewTab === 'options'
                ? 'border-teal-700 text-teal-800 dark:text-teal-300 font-semibold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Export Options
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('preview')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              previewTab === 'preview'
                ? 'border-teal-700 text-teal-800 dark:text-teal-300 font-semibold'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Diary Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {previewTab === 'options' ? (
            <>
              {/* Format Selection Cards */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-2.5 block">
                  Choose Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* HTML Lined Diary */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('html')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      exportFormat === 'html'
                        ? 'border-teal-600 ring-2 ring-teal-600/30 bg-teal-500/10 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">📖</span>
                      {exportFormat === 'html' && (
                        <Check className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold font-serif mb-0.5">Lined Diary Book</p>
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      Clean lined stationery paper, attached photos &amp; 1-click Print to PDF.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-teal-600/15 text-teal-800 dark:text-teal-300">
                      Recommended
                    </span>
                  </button>

                  {/* Plain Text */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('txt')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      exportFormat === 'txt'
                        ? 'border-teal-600 ring-2 ring-teal-600/30 bg-teal-500/10 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">📄</span>
                      {exportFormat === 'txt' && (
                        <Check className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold font-serif mb-0.5">Plain Text (.txt)</p>
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      Clean chronological diary entries with dates and times.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-sans opacity-60">
                      Lightweight
                    </span>
                  </button>

                  {/* Markdown */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('md')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      exportFormat === 'md'
                        ? 'border-teal-600 ring-2 ring-teal-600/30 bg-teal-500/10 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">📝</span>
                      {exportFormat === 'md' && (
                        <Check className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold font-serif mb-0.5">Markdown (.md)</p>
                    <p className="text-[11px] opacity-70 leading-relaxed">
                      Formatted markdown diary with headers and photo links.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-sans opacity-60">
                      Notes Apps
                    </span>
                  </button>
                </div>
              </div>

              {/* Filter scope */}
              {selectedTagFilter && (
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-teal-600" />
                      <span>Topic Filter: #{selectedTagFilter}</span>
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={includeOnlyFilter}
                        onChange={(e) => setIncludeOnlyFilter(e.target.checked)}
                        className="rounded border-stone-400 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Only export this topic</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Export Summary Details */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Author:</span>
                  <span className="font-semibold">{userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Total Entries:</span>
                  <span className="font-semibold">{targetEntries.length} entries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Attached Photos:</span>
                  <span className="font-semibold">
                    {targetEntries.filter((e) => e.imageUrl).length} photos
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Live Interactive Diary Preview */
            <div className="rounded-xl border border-stone-300 dark:border-stone-700 bg-[#faf7f0] text-[#221c1a] p-5 shadow-inner space-y-4 font-serif text-xs relative overflow-hidden">
              {/* Lined stationery paper margin line */}
              <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-rose-300 opacity-60" />
              
              <div className="text-center pb-3 border-b border-dashed border-stone-300">
                <h3 className="font-bold text-base text-[#1c1815]">
                  {userName}'s Daily Diary
                </h3>
                <p className="text-[11px] italic text-stone-600 mt-0.5">
                  Personal reflections &amp; memories
                </p>
              </div>

              {/* Sample preview entries */}
              <div className="space-y-4 pl-6">
                {targetEntries.slice(0, 3).map((entry, idx) => {
                  const date = new Date(entry.timestamp);
                  const dateStr = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={`prev-${entry.id}-${idx}`}
                      className="p-3 rounded-lg border border-stone-300/60 leading-relaxed bg-white/90"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1 font-sans">
                        <span className="font-semibold text-stone-900">
                          {dateStr} • {timeStr}
                        </span>
                        {entry.mood && (
                          <span className="text-stone-500 capitalize">
                            [{entry.mood}]
                          </span>
                        )}
                      </div>

                      {entry.imageUrl && (
                        <div className="my-2 p-1 bg-white border border-stone-200 shadow-xs rounded max-w-[140px]">
                          <img
                            src={entry.imageUrl}
                            alt="Attachment"
                            className="w-full h-16 object-cover rounded-xs"
                          />
                          <p className="text-[9px] text-center text-stone-500 font-sans mt-0.5">
                            Photo memory
                          </p>
                        </div>
                      )}

                      <p className="font-serif text-[13px] text-[#241d1a] whitespace-pre-wrap">
                        {entry.content}
                      </p>
                    </div>
                  );
                })}

                {targetEntries.length > 3 && (
                  <p className="text-center text-[11px] italic text-stone-500">
                    ... and {targetEntries.length - 3} more entries
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200/50 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-500/5">
          <button
            type="button"
            onClick={handleDirectPrint}
            title="Print directly or save as PDF via browser"
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 opacity-80" />
            <span>Direct Print / PDF</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-stone-500/10 transition-colors cursor-pointer opacity-70 hover:opacity-100"
            >
              Cancel
            </button>

            <button
              id="diary-download-confirm-btn"
              type="button"
              onClick={handleDownload}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Diary Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Diary ({exportFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
