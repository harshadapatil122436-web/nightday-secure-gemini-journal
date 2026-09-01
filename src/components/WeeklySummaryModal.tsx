import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Compass, Check, Copy, Calendar, RefreshCw, BookOpen, Bookmark } from 'lucide-react';
import { WeeklySummaryData, ThemeMode } from '../types';
import { formatJournalText } from '../utils/textUtils';
import { THEMES } from '../utils/themeConfig';
import { JournalLogo } from './JournalLogo';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: WeeklySummaryData | null;
  isLoading: boolean;
  onRegenerate: () => void;
  themeMode: ThemeMode;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  isLoading,
  onRegenerate,
  themeMode,
}) => {
  const [copied, setCopied] = useState(false);
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `NightDay Weekly Reflection (${summaryData.dateRange})\n\nOverall Tone: ${summaryData.overallTone}\n\n${summaryData.narrativeSummary}\n\nKey Themes: ${summaryData.recurringThemes.join(', ')}\n\nAffirmation: ${summaryData.caringAffirmation}\n\nGentle Inquiry: ${summaryData.gentleInquiry}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div 
        id="weekly-summary-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="weekly-summary-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-3">
              <JournalLogo size="sm" showText={false} />
              <div>
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  Weekly Journal Synthesis
                </h2>
                <p className="text-xs opacity-70 font-sans">
                  A compassionate overview of your reflections and emotional rhythms
                </p>
              </div>
            </div>
            <button
              id="weekly-summary-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-stone-500/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <JournalLogo size="lg" showText={false} />
                  <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1 animate-spin" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-medium">
                    Synthesizing your journal volume...
                  </h4>
                  <p className="text-xs opacity-70 mt-1 max-w-xs font-sans">
                    NightDay is weaving your weekly pages into a caring, meaningful reflection.
                  </p>
                </div>
              </div>
            ) : summaryData ? (
              <>
                {/* Meta stats bar */}
                <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs font-sans ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder}`}>
                  <div className="flex items-center gap-2 opacity-80">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{summaryData.dateRange}</span>
                    <span>•</span>
                    <span>{summaryData.entryCount} reflections analyzed</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium text-[11px] ${currentTheme.dateBadgeBg} ${currentTheme.dateBadgeBorder} ${currentTheme.dateBadgeText}`}>
                    <span>Mood Rhythm:</span>
                    <span className="italic">{summaryData.overallTone}</span>
                  </div>
                </div>

                {/* Narrative Summary */}
                <div className="space-y-2.5">
                  <h3 className="text-xs uppercase tracking-wider font-sans font-semibold opacity-80">
                    Emotional Arc & Synthesis
                  </h3>
                  <div className={`p-4 sm:p-5 rounded-2xl border leading-relaxed font-journal text-[15px] space-y-3 ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder} ${currentTheme.cardUserText}`}>
                    <p className="whitespace-pre-wrap">{formatJournalText(summaryData.narrativeSummary)}</p>
                  </div>
                </div>

                {/* Recurring Themes */}
                {summaryData.recurringThemes && summaryData.recurringThemes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wider font-sans font-semibold opacity-70">
                      Prominent Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {summaryData.recurringThemes.map((theme, i) => (
                        <span
                          key={`summary-theme-${theme}-${i}`}
                          className={`px-3 py-1 rounded-xl text-xs font-sans font-medium border ${currentTheme.tagBadge}`}
                        >
                          #{theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affirmation & Inquiry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border space-y-2 ${currentTheme.cardAiBg} ${currentTheme.cardAiBorder}`}>
                    <div className="flex items-center gap-2 text-xs font-sans font-semibold opacity-90">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span>Caring Affirmation</span>
                    </div>
                    <p className="font-journal text-xs sm:text-sm leading-relaxed italic opacity-90">
                      "{summaryData.caringAffirmation}"
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder}`}>
                    <div className="flex items-center gap-2 text-xs font-sans font-semibold opacity-90">
                      <Compass className="w-4 h-4 opacity-80" />
                      <span>Inquiry for Next Week</span>
                    </div>
                    <p className="font-journal text-xs sm:text-sm leading-relaxed opacity-90">
                      "{summaryData.gentleInquiry}"
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto opacity-50" />
                <p className="text-sm font-journal">No reflection generated yet.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-between px-6 py-4 border-t ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <button
              id="weekly-summary-regenerate-btn"
              type="button"
              onClick={onRegenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer opacity-80 hover:opacity-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Synthesis</span>
            </button>

            <div className="flex items-center gap-2">
              {summaryData && (
                <button
                  id="weekly-summary-copy-btn"
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${currentTheme.userBtn}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
