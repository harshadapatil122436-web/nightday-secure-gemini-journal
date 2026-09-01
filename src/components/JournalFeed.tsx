import React, { useEffect, useRef } from 'react';
import { Sparkles, Tag, X, Calendar, Filter } from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile } from '../types';
import { JournalEntryCard } from './JournalEntryCard';
import { THEMES } from '../utils/themeConfig';
import { JournalLogo } from './JournalLogo';
import { AvatarDisplay } from './AvatarDisplay';

interface JournalFeedProps {
  entries: JournalEntry[];
  allEntries: JournalEntry[];
  isReflecting: boolean;
  themeMode: ThemeMode;
  user: UserProfile;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedTagFilter: string | null;
  onSelectTagFilter: (tag: string | null) => void;
  selectedDateLabel?: string | null;
  onClearDateFilter?: () => void;
  onDeleteEntry?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const JournalFeed: React.FC<JournalFeedProps> = ({
  entries,
  isReflecting,
  themeMode,
  user,
  searchQuery,
  onSearchQueryChange,
  selectedTagFilter,
  onSelectTagFilter,
  selectedDateLabel,
  onClearDateFilter,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  // Auto-scroll on new entry or reflecting state change
  useEffect(() => {
    if (!searchQuery && !selectedTagFilter) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries.length, isReflecting, searchQuery, selectedTagFilter, selectedDateLabel]);

  // Group entries by formatted date
  const groupEntriesByDate = (entryList: JournalEntry[]) => {
    const groups: { [dateKey: string]: JournalEntry[] } = {};

    entryList.forEach((entry) => {
      let dateKey = 'Today';
      try {
        const entryDate = new Date(entry.timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (entryDate.toDateString() === today.toDateString()) {
          dateKey = 'Today’s Reflections';
        } else if (entryDate.toDateString() === yesterday.toDateString()) {
          dateKey = 'Yesterday';
        } else {
          dateKey = entryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch {
        dateKey = 'Past Reflections';
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return groups;
  };

  const grouped = groupEntriesByDate(entries);
  const companionName = user.companionName || 'Luna';

  return (
    <div 
      id="journal-feed-container" 
      className={`flex-1 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto ${currentTheme.feedText}`}
    >
      {/* Active Day Session Indicator */}
      {selectedDateLabel && (
        <div className={`mb-4 px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150 ${currentTheme.filterBarBg} ${currentTheme.filterBarBorder}`}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-black/5 dark:bg-white/10">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-semibold">{selectedDateLabel}</span>
              <span className="opacity-70 ml-2">
                ({entries.length} {entries.length === 1 ? 'reflection' : 'reflections'} in this session)
              </span>
            </div>
          </div>

          {onClearDateFilter && (
            <button
              type="button"
              onClick={onClearDateFilter}
              className="text-xs font-semibold underline shrink-0 cursor-pointer opacity-85 hover:opacity-100"
            >
              View All History
            </button>
          )}
        </div>
      )}

      {/* Active Filter Bar */}
      {(selectedTagFilter || searchQuery) && (
        <div className={`mb-4 px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150 ${currentTheme.filterBarBg} ${currentTheme.filterBarBorder}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium flex items-center gap-1.5 opacity-70">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtering reflections:</span>
            </span>

            {searchQuery && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs ${currentTheme.tagBadge}`}>
                <span>Keyword: "{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="hover:text-rose-500 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTagFilter && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-medium ${currentTheme.tagBadge}`}>
                <Tag className="w-3 h-3" />
                <span>#{selectedTagFilter}</span>
                <button
                  type="button"
                  onClick={() => onSelectTagFilter(null)}
                  className="hover:text-rose-500 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="text-[11px] opacity-60">
              ({entries.length} {entries.length === 1 ? 'entry' : 'entries'} found)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSearchQueryChange('');
              onSelectTagFilter(null);
            }}
            className="text-xs font-medium underline shrink-0 cursor-pointer opacity-80 hover:opacity-100"
          >
            Show All
          </button>
        </div>
      )}

      {/* Entries List grouped by Date */}
      {Object.keys(grouped).length === 0 ? (
        <div className={`py-20 text-center space-y-4 rounded-3xl border p-8 ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder}`}>
          <div className="flex justify-center">
            <JournalLogo size="lg" showText={false} />
          </div>
          <h3 className="font-serif text-xl font-semibold">No reflections found</h3>
          <p className="text-sm max-w-md mx-auto opacity-75 font-journal leading-relaxed">
            {searchQuery || selectedTagFilter
              ? 'No reflections matched your search criteria. Try clearing the filter above to view your full journal.'
              : 'Your journal pages are open. Begin writing your thoughts and reflections in the composer below.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([dateKey, groupEntries]) => (
            <div key={dateKey} className="space-y-5">
              {/* Date Header Ribbon */}
              <div className="flex items-center gap-3 my-5">
                <div className={`h-px flex-1 ${currentTheme.dividerColor}`} />
                <div className={`flex items-center gap-2 text-xs sm:text-sm font-serif font-semibold tracking-wide px-4 py-1.5 rounded-full border shadow-2xs ${currentTheme.dateBadgeBg} ${currentTheme.dateBadgeBorder} ${currentTheme.dateBadgeText}`}>
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>{dateKey}</span>
                </div>
                <div className={`h-px flex-1 ${currentTheme.dividerColor}`} />
              </div>

              {/* Entries for this date */}
              <div className="space-y-5">
                {groupEntries.map((entry, entryIdx) => (
                  <JournalEntryCard
                    key={`feed-entry-${entry.id}-${entryIdx}`}
                    entry={entry}
                    themeMode={themeMode}
                    user={user}
                    onDelete={onDeleteEntry}
                    onToggleFavorite={onToggleFavorite}
                    onSelectTag={onSelectTagFilter}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reflecting State Indicator */}
      {isReflecting && (
        <div className="mt-6 flex items-start gap-3.5 animate-in fade-in duration-300">
          <div className="shrink-0 pt-1">
            <AvatarDisplay
              avatarUrl={user.companionAvatarUrl}
              avatarId={user.companionAvatarId || 'cherry-blossom'}
              name={companionName}
              size="md"
              isAi
              className="ring-2 ring-pink-400/20"
            />
          </div>
          <div className={`p-4 sm:p-5 rounded-2xl rounded-tl-xs border text-sm font-journal max-w-lg shadow-xs ${currentTheme.aiLoaderCard}`}>
            <div className="flex items-center gap-2 font-sans font-semibold mb-1 text-xs opacity-90 text-pink-600 dark:text-pink-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{companionName} is reading your reflection...</span>
            </div>
            <p className="opacity-80 leading-relaxed">
              Holding quiet space for your thoughts and preparing a caring response.
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-6" />
    </div>
  );
};
