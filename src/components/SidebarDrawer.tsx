import React, { useMemo } from 'react';
import {
  Plus,
  Calendar,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  BookOpen,
  X,
  History,
  Search,
  Check,
  PenLine,
} from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile } from '../types';
import { THEMES } from '../utils/themeConfig';
import { MOOD_CONFIGS } from '../data/initialData';

export interface DaySession {
  dateKey: string; // YYYY-MM-DD
  label: string; // "Today", "Yesterday", "Aug 25, 2026"
  groupCategory: 'today' | 'yesterday' | 'previous7' | 'previous30' | 'older';
  groupCategoryTitle: string;
  date: Date;
  entries: JournalEntry[];
  userEntries: JournalEntry[];
  aiEntries: JournalEntry[];
  previewSnippet: string;
  dominantMood?: string;
  moodEmoji?: string;
  tags: string[];
  lastTimestamp: string;
}

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  entries: JournalEntry[];
  selectedDateKey: string | null; // null means all / continuous feed
  onSelectDate: (dateKey: string | null) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  themeMode: ThemeMode;
  user: UserProfile;
}

/**
 * Returns a standardized local "YYYY-MM-DD" key from any ISO timestamp
 */
export function getLocalDayKey(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'unknown';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return 'unknown';
  }
}

/**
 * Formats date to group category ("Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older")
 */
export function getFormattedDayLabel(date: Date): {
  label: string;
  groupCategory: 'today' | 'yesterday' | 'previous7' | 'previous30' | 'older';
  groupCategoryTitle: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const formattedShort = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (diffDays === 0) {
    return { label: 'Today', groupCategory: 'today', groupCategoryTitle: 'Today' };
  }
  if (diffDays === 1) {
    return { label: 'Yesterday', groupCategory: 'yesterday', groupCategoryTitle: 'Yesterday' };
  }
  if (diffDays > 1 && diffDays <= 7) {
    return {
      label: formattedShort,
      groupCategory: 'previous7',
      groupCategoryTitle: 'Previous 7 Days',
    };
  }
  if (diffDays > 7 && diffDays <= 30) {
    return {
      label: formattedShort,
      groupCategory: 'previous30',
      groupCategoryTitle: 'Previous 30 Days',
    };
  }

  const formattedFull = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { label: formattedFull, groupCategory: 'older', groupCategoryTitle: 'Older History' };
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  selectedDateKey,
  onSelectDate,
  onNewChat,
  searchQuery,
  onSearchQueryChange,
  themeMode,
  user,
}) => {
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  // Calculate today's entries count
  const todayKey = useMemo(() => getLocalDayKey(new Date().toISOString()), []);
  const todayUserEntriesCount = useMemo(() => {
    return entries.filter(
      (e) => e.author === 'user' && getLocalDayKey(e.timestamp) === todayKey
    ).length;
  }, [entries, todayKey]);

  // Group all entries by day into sessions
  const daySessions: DaySession[] = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();

    entries.forEach((entry) => {
      const key = getLocalDayKey(entry.timestamp);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });

    const sessions: DaySession[] = [];

    map.forEach((dayEntries, dateKey) => {
      dayEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const userEntries = dayEntries.filter((e) => e.author === 'user');
      const aiEntries = dayEntries.filter((e) => e.author === 'ai');
      const firstUserEntry = userEntries[0] || dayEntries[0];
      const lastEntry = dayEntries[dayEntries.length - 1];
      const dateObj = new Date(firstUserEntry ? firstUserEntry.timestamp : lastEntry.timestamp);
      const { label, groupCategory, groupCategoryTitle } = getFormattedDayLabel(dateObj);

      let previewSnippet = 'Reflections and conversations';
      if (firstUserEntry && firstUserEntry.content) {
        previewSnippet = firstUserEntry.content.replace(/[#*`_]/g, '').trim();
        if (previewSnippet.length > 55) {
          previewSnippet = previewSnippet.slice(0, 52) + '...';
        }
      }

      const latestMoodEntry = [...userEntries].reverse().find((e) => e.mood);
      const dominantMood = latestMoodEntry?.mood;
      const moodEmoji = dominantMood && MOOD_CONFIGS[dominantMood] ? MOOD_CONFIGS[dominantMood].emoji : undefined;

      const tagsSet = new Set<string>();
      dayEntries.forEach((e) => {
        if (Array.isArray(e.tags)) {
          e.tags.forEach((t) => tagsSet.add(t));
        }
      });

      sessions.push({
        dateKey,
        label,
        groupCategory,
        groupCategoryTitle,
        date: dateObj,
        entries: dayEntries,
        userEntries,
        aiEntries,
        previewSnippet,
        dominantMood,
        moodEmoji,
        tags: Array.from(tagsSet),
        lastTimestamp: lastEntry.timestamp,
      });
    });

    sessions.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
    return sessions;
  }, [entries]);

  // Filter day sessions based on sidebar search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return daySessions;
    const q = searchQuery.toLowerCase().trim();

    return daySessions.filter((session) => {
      const matchLabel = session.label.toLowerCase().includes(q);
      const matchSnippet = session.previewSnippet.toLowerCase().includes(q);
      const matchMood = session.dominantMood ? session.dominantMood.toLowerCase().includes(q) : false;
      const matchTags = session.tags.some((t) => t.toLowerCase().includes(q));
      const matchEntries = session.entries.some((e) => e.content.toLowerCase().includes(q));
      return matchLabel || matchSnippet || matchMood || matchTags || matchEntries;
    });
  }, [daySessions, searchQuery]);

  // Group filtered sessions into sections
  const sections = useMemo(() => {
    const order: Array<{ key: DaySession['groupCategory']; title: string }> = [
      { key: 'today', title: 'Today' },
      { key: 'yesterday', title: 'Yesterday' },
      { key: 'previous7', title: 'Previous 7 Days' },
      { key: 'previous30', title: 'Previous 30 Days' },
      { key: 'older', title: 'Older History' },
    ];

    return order
      .map((sec) => ({
        key: sec.key,
        title: sec.title,
        sessions: filteredSessions.filter((s) => s.groupCategory === sec.key),
      }))
      .filter((sec) => sec.sessions.length > 0);
  }, [filteredSessions]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        id="sidebar-drawer-backdrop"
        className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-xs md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Collapsible Left Navigation & History Drawer */}
      <aside
        id="sidebar-drawer-container"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 flex flex-col shrink-0 border-r transition-all duration-200 select-none shadow-xl md:shadow-none ${currentTheme.sidebarBg}`}
        aria-label="Navigation and Journal History Drawer"
      >
        {/* Top Header Controls: Title & Close */}
        <div className="p-3 sm:p-3.5 border-b border-inherit flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10">
                <History className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs tracking-tight">Journal History</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 font-medium">
                {daySessions.length} {daySessions.length === 1 ? 'day' : 'days'}
              </span>
            </div>

            <button
              id="sidebar-close-btn"
              type="button"
              onClick={onClose}
              title="Close history sidebar"
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 hidden md:block" />
              <X className="w-4 h-4 md:hidden" />
            </button>
          </div>

          {/* ChatGPT / Claude Style "+ New Chat" / "+ New Session" Button */}
          <button
            id="sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            title="Reset active day and start a fresh journaling session"
            className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.98] ${currentTheme.buttonPrimary}`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Chat</span>
            </div>
            <span className="text-[10px] font-normal opacity-85 bg-black/20 dark:bg-white/20 px-1.5 py-0.5 rounded-md">
              Today
            </span>
          </button>

          {/* Daily Stats Card: Entries Written Today (Streak is shown in Header & Profile only) */}
          <div
            id="sidebar-daily-stats-card"
            className={`p-2.5 rounded-xl border flex items-center justify-between shadow-2xs ${currentTheme.sidebarCardBg}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-600/15 dark:bg-teal-400/15 border border-teal-600/30 dark:border-teal-400/30 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
                <PenLine className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Today</span>
                <span className="text-xs font-semibold leading-tight">
                  {todayUserEntriesCount} {todayUserEntriesCount === 1 ? 'reflection' : 'reflections'}
                </span>
              </div>
            </div>

            {todayUserEntriesCount > 0 ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-600/15 text-teal-800 dark:text-teal-200 border border-teal-600/20">
                Logged
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 opacity-70">
                Not yet
              </span>
            )}
          </div>

          {/* Sidebar Search Bar (Directly beneath stats & "+ New Chat" button) */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            <input
              id="sidebar-history-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search past chats & memories..."
              className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border transition-all focus:outline-none focus:ring-1 ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus} ${currentTheme.searchPlaceholder}`}
            />
            {searchQuery && (
              <button
                id="sidebar-search-clear-btn"
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* "All Reflections" (Continuous Full History) Option */}
          <button
            id="sidebar-view-all-reflections-btn"
            type="button"
            onClick={() => {
              onSelectDate(null);
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
              selectedDateKey === null
                ? 'bg-black/10 dark:bg-white/15 border-inherit font-semibold shadow-2xs'
                : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 opacity-70" />
              <span>All Reflections (Continuous)</span>
            </div>
            {selectedDateKey === null && <Check className="w-3.5 h-3.5 text-current" />}
          </button>
        </div>

        {/* Scrollable Session List Grouped Chronologically by Date */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-4">
          {sections.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium opacity-70">
                {searchQuery ? 'No matching memories found' : 'No reflections logged yet'}
              </p>
              <p className="text-[11px] opacity-50 mt-1">
                {searchQuery
                  ? 'Try searching a different keyword or mood'
                  : 'Click "+ New Chat" to log your first thought!'}
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.key} className="space-y-1.5">
                {/* Section Header */}
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider uppercase opacity-60">
                    {section.title}
                  </span>
                  <span className="text-[10px] opacity-40">
                    {section.sessions.length} {section.sessions.length === 1 ? 'chat' : 'chats'}
                  </span>
                </div>

                {/* Session Items */}
                <div className="space-y-1">
                  {section.sessions.map((session) => {
                    const isSelected = selectedDateKey === session.dateKey;
                    return (
                      <button
                        key={session.dateKey}
                        id={`sidebar-session-${session.dateKey}`}
                        type="button"
                        onClick={() => {
                          onSelectDate(session.dateKey);
                          if (window.innerWidth < 768) {
                            onClose();
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? currentTheme.sidebarActiveSession || 'bg-black/10 dark:bg-white/15 border-inherit font-semibold shadow-xs'
                            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-xs truncate">
                            {session.moodEmoji ? (
                              <span className="text-xs shrink-0">{session.moodEmoji}</span>
                            ) : (
                              <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            )}
                            <span className="truncate">{session.label}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] opacity-60 shrink-0">
                            <span>{session.entries.length} msgs</span>
                          </div>
                        </div>

                        {/* Snippet Preview */}
                        <p className="text-[11px] opacity-75 line-clamp-1 leading-tight font-journal">
                          "{session.previewSnippet}"
                        </p>

                        {/* Companion or Tag highlights */}
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {session.aiEntries.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-medium flex items-center gap-0.5 bg-black/10 dark:bg-white/10">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>{user?.companionName || 'Luna'} reflected</span>
                            </span>
                          )}
                          {session.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 opacity-75"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-inherit flex items-center justify-between text-[11px] opacity-65">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Companion: {user?.companionName || 'Luna'}</span>
          </div>
          <span>{entries.filter((e) => e.author === 'user').length} reflections</span>
        </div>
      </aside>
    </>
  );
};
