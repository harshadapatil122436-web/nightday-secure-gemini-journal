import React, { useState } from 'react';
import { 
  Plus, Search, Star, ArrowUpDown, Tag, Sparkles, 
  Download, ShieldCheck, BookOpen, Clock, Heart, 
  Compass, Flame, Wind, PenLine, Trash2
} from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile, MoodType } from '../types';
import { MOOD_CONFIGS } from '../data/initialData';
import { THEMES } from '../utils/themeConfig';

interface SanctuaryDashboardProps {
  entries: JournalEntry[];
  user: UserProfile;
  themeMode: ThemeMode;
  onOpenNewReflection: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenWeeklySummary: () => void;
  onOpenBreathe: () => void;
  onOpenInspiration: () => void;
  onOpenExport: () => void;
  onOpenSecurity: () => void;
}

export const SanctuaryDashboard: React.FC<SanctuaryDashboardProps> = ({
  entries,
  user,
  themeMode,
  onOpenNewReflection,
  onSelectEntry,
  onToggleFavorite,
  onDeleteEntry,
  onOpenWeeklySummary,
  onOpenBreathe,
  onOpenInspiration,
  onOpenExport,
  onOpenSecurity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const currentTheme = THEMES[themeMode] || THEMES['midnight-black'];
  const isDark = themeMode === 'midnight-black';

  // Filter only user entries for the main grid cards
  const userEntries = entries.filter((e) => e.author === 'user');
  const aiEntries = entries.filter((e) => e.author === 'ai');

  // Calculate statistics
  const totalReflectionsCount = userEntries.length;
  const totalWordsWritten = userEntries.reduce((acc, curr) => {
    if (curr.wordCount) return acc + curr.wordCount;
    const words = curr.content.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);
  const favoritedCount = userEntries.filter((e) => e.favorite).length;
  const solGuidanceCount = aiEntries.length;

  // Extract all distinct tags from entries
  const allTags = Array.from(
    new Set(
      userEntries
        .flatMap((e) => e.tags || [])
        .filter(Boolean)
    )
  );

  // Apply search & filters
  const filteredEntries = userEntries.filter((entry) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = entry.content.toLowerCase().includes(q);
      const matchTitle = (entry.title || '').toLowerCase().includes(q);
      const matchTags = (entry.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchTitle && !matchTags) return false;
    }

    // Mood filter
    if (selectedMoodFilter && entry.mood !== selectedMoodFilter) {
      return false;
    }

    // Tag filter
    if (selectedTagFilter && !(entry.tags || []).includes(selectedTagFilter)) {
      return false;
    }

    // Favorites only
    if (onlyFavorites && !entry.favorite) {
      return false;
    }

    return true;
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const companionName = user.companionName || 'Sol';

  return (
    <div id="sanctuary-dashboard-view" className="flex-1 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-8 flex flex-col justify-between overflow-y-auto font-sans">
      <div className="space-y-8">
        {/* Section 1: Dashboard Header Banner */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b ${isDark ? 'border-[#1E293B]' : 'border-current/10'} pb-6`}>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight">
              Personal Sanctuary
            </h1>
            <p className="text-sm sm:text-base opacity-70 mt-2 max-w-3xl leading-relaxed">
              A quiet space to write uninhibited reflections, untangle complex emotions, and receive thoughtful companion insights.
            </p>
          </div>

          <div className="flex items-center gap-3.5 shrink-0">
            <button
              id="sanctuary-new-reflection-btn"
              type="button"
              onClick={onOpenNewReflection}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl ${currentTheme.buttonPrimary} text-sm sm:text-base font-semibold shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
            >
              <PenLine className="w-5 h-5" />
              <span>+ New Reflection</span>
            </button>
          </div>
        </div>

        {/* Section 2: Four Key Metric Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. REFLECTIONS */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors border ${
            isDark ? 'bg-[#131C31]/90 border-[#1E293B] hover:border-indigo-500/40' : 'bg-white/80 dark:bg-black/20 border-current/10 hover:border-current/25'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs sm:text-sm font-bold tracking-wider uppercase ${isDark ? 'text-indigo-400' : 'text-teal-700 dark:text-teal-400'}`}>
                Reflections
              </span>
              <BookOpen className={`w-5 h-5 opacity-80 ${isDark ? 'text-indigo-400' : 'text-teal-700 dark:text-teal-400'}`} />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-serif">
              {totalReflectionsCount}
            </div>
            <div className="text-xs sm:text-sm opacity-60 mt-1.5 font-medium">
              Total recorded
            </div>
          </div>

          {/* 2. WORDS WRITTEN */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors border ${
            isDark ? 'bg-[#131C31]/90 border-[#1E293B] hover:border-emerald-500/40' : 'bg-white/80 dark:bg-black/20 border-current/10 hover:border-current/25'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Words Written
              </span>
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-80" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-serif">
              {totalWordsWritten}
            </div>
            <div className="text-xs sm:text-sm opacity-60 mt-1.5 font-medium">
              Mindful expression
            </div>
          </div>

          {/* 3. FAVORITED */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors border ${
            isDark ? 'bg-[#131C31]/90 border-[#1E293B] hover:border-amber-500/40' : 'bg-white/80 dark:bg-black/20 border-current/10 hover:border-current/25'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-600 dark:text-amber-400">
                Favorited
              </span>
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 opacity-80" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-serif">
              {favoritedCount}
            </div>
            <div className="text-xs sm:text-sm opacity-60 mt-1.5 font-medium">
              Key insights
            </div>
          </div>

          {/* 4. SOL GUIDANCE */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-colors border ${
            isDark ? 'bg-[#131C31]/90 border-[#1E293B] hover:border-purple-500/40' : 'bg-white/80 dark:bg-black/20 border-current/10 hover:border-current/25'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400">
                {companionName} Guidance
              </span>
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 opacity-80" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-serif">
              {solGuidanceCount}
            </div>
            <div className="text-xs sm:text-sm opacity-60 mt-1.5 font-medium">
              Syntheses received
            </div>
          </div>
        </div>

        {/* Section 3: Search & Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections, thoughts, themes, or #tags..."
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus} ${currentTheme.searchPlaceholder} text-sm sm:text-base font-sans`}
              />
            </div>

            {/* Favorites Toggle Button */}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 font-bold'
                  : isDark
                  ? 'bg-[#131C31] border-[#1E293B] text-slate-300 hover:text-white'
                  : `${currentTheme.moodBtnInactive}`
              }`}
            >
              <Star className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-400 text-amber-500' : 'opacity-60'}`} />
              <span>Favorites</span>
            </button>

            {/* Sort Toggle Button */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-[#131C31] border-[#1E293B] text-slate-300 hover:text-white'
                  : `${currentTheme.moodBtnInactive}`
              }`}
            >
              <ArrowUpDown className="w-4 h-4 opacity-70" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Mood Filter Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => setSelectedMoodFilter(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                selectedMoodFilter === null
                  ? `${currentTheme.moodBtnActive} shadow-xs font-semibold`
                  : `${currentTheme.moodBtnInactive}`
              }`}
            >
              All Moods ({userEntries.length})
            </button>

            {MOOD_CONFIGS.map((mood) => {
              const count = userEntries.filter((e) => e.mood === mood.id).length;
              const isSelected = selectedMoodFilter === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMoodFilter(isSelected ? null : mood.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? `${currentTheme.moodBtnActive} shadow-xs font-semibold`
                      : `${currentTheme.moodBtnInactive}`
                  }`}
                >
                  <span className="text-sm sm:text-base">{mood.emoji}</span>
                  <span>{mood.label}</span>
                  {count > 0 && <span className="opacity-70 text-xs">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Tag Filter Row */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="opacity-60 flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px]">
                <Tag className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Tags:
              </span>
              {allTags.map((tag) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? `${currentTheme.moodBtnActive}`
                        : `${currentTheme.tagBadge}`
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
              {selectedTagFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedTagFilter(null)}
                  className="opacity-70 hover:opacity-100 underline text-xs ml-1 cursor-pointer"
                >
                  Clear tag filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section 4: 3-Column Reflection Cards Grid */}
        <div>
          {sortedEntries.length === 0 ? (
            <div className={`text-center py-16 px-4 rounded-3xl border ${isDark ? 'bg-[#131C31]/40 border-[#1E293B]' : 'bg-white/60 border-current/10'}`}>
              <div className="w-16 h-16 rounded-full bg-teal-600/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif">
                No reflections found
              </h3>
              <p className="text-sm opacity-70 mt-1.5 max-w-md mx-auto">
                {searchQuery || selectedMoodFilter || selectedTagFilter || onlyFavorites
                  ? 'No entries match your current search or filters. Try adjusting your filters or search term.'
                  : 'Your sanctuary is waiting for its first entry. Take a moment to capture your thoughts.'}
              </p>
              <button
                type="button"
                onClick={onOpenNewReflection}
                className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${currentTheme.buttonPrimary} text-sm font-semibold shadow-lg transition-all cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                <span>Begin First Reflection</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEntries.map((entry) => {
                const moodConfig = MOOD_CONFIGS.find((m) => m.id === entry.mood) || {
                  id: 'peaceful',
                  label: 'Peaceful',
                  emoji: '🌿',
                  color: '',
                  badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
                  textColor: 'text-emerald-600 dark:text-emerald-300',
                };

                const dateObj = new Date(entry.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                // Calculate word count
                const words = entry.wordCount || entry.content.trim().split(/\s+/).filter(Boolean).length;

                // Check if this entry has companion guidance
                const hasCompanionReply = entries.some(
                  (e) => e.author === 'ai' && e.replyToId === entry.id
                );

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:-translate-y-1 relative border ${
                      isDark
                        ? 'bg-[#131C31]/90 border-[#1E293B] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/40'
                        : `${currentTheme.cardUserBg} border-current/10 hover:border-current/30 hover:shadow-lg`
                    }`}
                  >
                    <div>
                      {/* Card Header: Mood Badge, Companion Badge, Star Favorite */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${moodConfig.badgeBg}`}>
                            <span>{moodConfig.emoji}</span>
                            <span>{moodConfig.label}</span>
                          </span>

                          {hasCompanionReply && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                              <span>{companionName}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(entry.id);
                            }}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              entry.favorite
                                ? 'text-amber-500 hover:bg-amber-500/10'
                                : 'opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                            title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-4 h-4 ${entry.favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                          </button>

                          {onDeleteEntry && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEntry(entry.id);
                              }}
                              className="p-1.5 rounded-xl opacity-40 hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete reflection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3 className="text-lg sm:text-xl font-bold font-serif group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors line-clamp-1 mb-2">
                        {entry.title || 'Untitled Reflection'}
                      </h3>

                      {/* Card Snippet */}
                      <p className="text-xs sm:text-sm opacity-80 font-journal leading-relaxed line-clamp-4 mb-4">
                        {entry.content}
                      </p>
                    </div>

                    <div>
                      {/* Card Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {entry.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${currentTheme.tagBadge}`}
                            >
                              #{t}
                            </span>
                          ))}
                          {entry.tags.length > 3 && (
                            <span className="text-[11px] opacity-50 self-center">
                              +{entry.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer: Timestamp & Word Count */}
                      <div className={`flex items-center justify-between text-xs opacity-70 border-t ${isDark ? 'border-[#1E293B]/80' : 'border-current/10'} pt-3 font-medium`}>
                        <span>{formattedDate} • {formattedTime}</span>
                        <span>{words} {words === 1 ? 'word' : 'words'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Bottom Sanctuary Footer Controls */}
      <div className={`mt-12 pt-6 border-t ${isDark ? 'border-[#1E293B]' : 'border-current/10'} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm opacity-80`}>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onOpenWeeklySummary}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Compass className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>Weekly Synthesis</span>
          </button>

          <button
            type="button"
            onClick={onOpenBreathe}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Wind className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Mindful Breath</span>
          </button>

          <button
            type="button"
            onClick={onOpenInspiration}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Inspiration</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Sanctuary</span>
          </button>

          <button
            type="button"
            onClick={onOpenSecurity}
            className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Private &amp; Secure</span>
          </button>
        </div>
      </div>
    </div>
  );
};
