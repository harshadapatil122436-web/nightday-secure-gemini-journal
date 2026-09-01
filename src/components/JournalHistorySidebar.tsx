import React, { useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronLeft, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  BookOpen, 
  X,
  History,
  Layers
} from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile } from '../types';
import { THEMES } from '../utils/themeConfig';
import { MOOD_CONFIGS } from '../data/initialData';

export interface DaySession {
  dateKey: string; // YYYY-MM-DD
  label: string; // "Today", "Yesterday", "Aug 25, 2026"
  groupCategory: 'today' | 'yesterday' | 'previous';
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

interface JournalHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  entries: JournalEntry[];
  selectedDateKey: string | null; // null means all / active feed
  onSelectDate: (dateKey: string | null) => void;
  onNewEntry: () => void;
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
 * Formats date to "Today", "Yesterday", or "Aug 25, 2026"
 */
export function getFormattedDayLabel(date: Date): { label: string; groupCategory: 'today' | 'yesterday' | 'previous' } {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return { label: 'Today', groupCategory: 'today' };
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return { label: 'Yesterday', groupCategory: 'yesterday' };
  }

  const label = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { label, groupCategory: 'previous' };
}

export const JournalHistorySidebar: React.FC<JournalHistorySidebarProps> = ({
  isOpen,
  onClose,
  entries,
  selectedDateKey,
  onSelectDate,
  onNewEntry,
  themeMode,
  user,
}) => {
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];
  const isDark = themeMode === 'midnight-black';

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
      // Sort day entries chronologically
      dayEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const userEntries = dayEntries.filter((e) => e.author === 'user');
      const aiEntries = dayEntries.filter((e) => e.author === 'ai');
      const firstUserEntry = userEntries[0] || dayEntries[0];
      const lastEntry = dayEntries[dayEntries.length - 1];
      const dateObj = new Date(firstUserEntry ? firstUserEntry.timestamp : lastEntry.timestamp);
      const { label, groupCategory } = getFormattedDayLabel(dateObj);

      // Determine preview text snippet
      let previewSnippet = 'Reflections and conversations';
      if (firstUserEntry && firstUserEntry.content) {
        previewSnippet = firstUserEntry.content.replace(/[#*`_]/g, '').trim();
        if (previewSnippet.length > 55) {
          previewSnippet = previewSnippet.slice(0, 52) + '...';
        }
      }

      // Collect dominant/latest mood
      const latestMoodEntry = [...userEntries].reverse().find((e) => e.mood);
      const dominantMood = latestMoodEntry?.mood;
      const moodEmoji = dominantMood && MOOD_CONFIGS[dominantMood] ? MOOD_CONFIGS[dominantMood].emoji : undefined;

      // Unique tags for the day
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

    // Sort most recent day first
    sessions.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
    return sessions;
  }, [entries]);

  const todayKey = getLocalDayKey(new Date().toISOString());

  // Split sessions into categories: Today, Yesterday, and Previous Specific Dates
  const todaySessions = daySessions.filter((s) => s.groupCategory === 'today');
  const yesterdaySessions = daySessions.filter((s) => s.groupCategory === 'yesterday');
  const previousSessions = daySessions.filter((s) => s.groupCategory === 'previous');

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-xs md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Collapsible Left History Panel */}
      <aside
        id="journal-history-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 flex flex-col shrink-0 border-r transition-all duration-200 select-none shadow-xl md:shadow-none ${
          isDark 
            ? 'bg-[#11111A] border-[#262638] text-zinc-200' 
            : themeMode === 'peaceful-sage'
            ? 'bg-[#EAF3EA] border-[#B9D8B6] text-[#16361A]'
            : 'bg-[#EBF6F3] border-[#A8DDD2] text-[#073F3A]'
        }`}
        aria-label="Journal Chat History"
      >
        {/* Top Header & "New Entry" CTA Button */}
        <div className="p-3 sm:p-3.5 border-b border-inherit flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-950/80 text-indigo-400' : 'bg-white/80 shadow-2xs'}`}>
                <History className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs tracking-tight">Journal History</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-medium">
                {daySessions.length} {daySessions.length === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* Close button on mobile & collapse button on desktop */}
            <button
              type="button"
              onClick={onClose}
              title="Close history sidebar"
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 hidden md:block" />
              <X className="w-4 h-4 md:hidden" />
            </button>
          </div>

          {/* ChatGPT Style "New Entry" / "New Chat" Button */}
          <button
            id="sidebar-new-entry-btn"
            type="button"
            onClick={() => {
              onNewEntry();
              // On mobile, close sidebar after starting fresh entry
              if (window.innerWidth < 768) {
                onClose();
              }
            }}
            title="Start a fresh reflection session for today"
            className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-950/30'
                : themeMode === 'peaceful-sage'
                ? 'bg-[#2A5731] hover:bg-[#1E4324] text-white border-[#2A5731]'
                : 'bg-[#0D746B] hover:bg-[#095851] text-white border-[#095851]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Entry</span>
            </div>
            <span className="text-[10px] font-normal opacity-80 bg-white/20 px-1.5 py-0.5 rounded-md">
              Today
            </span>
          </button>

          {/* "All Reflections" Continuous Stream View Option */}
          <button
            type="button"
            onClick={() => {
              onSelectDate(null);
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full py-1.5 px-3 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
              selectedDateKey === null
                ? isDark
                  ? 'bg-[#1C1C2B] border-indigo-400 font-semibold text-white'
                  : 'bg-white border-current/30 font-semibold shadow-2xs'
                : 'border-transparent opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 opacity-70" />
              <span>All Reflections (Continuous)</span>
            </div>
            <span className="text-[10px] opacity-60 font-mono">
              {entries.length}
            </span>
          </button>
        </div>

        {/* Scrollable Day Session List Grouped Chronologically */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {daySessions.length === 0 ? (
            <div className="px-4 py-8 text-center opacity-60 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-40" />
              <p className="font-medium text-xs">No past journal sessions yet</p>
              <p className="text-[11px] leading-relaxed">
                Write your first thought to begin your private sanctuary timeline.
              </p>
            </div>
          ) : (
            <>
              {/* 1. Today Group */}
              {todaySessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                    <span>Today</span>
                    <span className="text-[10px] lowercase font-normal opacity-70">
                      {todaySessions[0].entries.length} reflections
                    </span>
                  </div>
                  {todaySessions.map((session) => (
                    <DaySessionItem
                      key={session.dateKey}
                      session={session}
                      isSelected={selectedDateKey === session.dateKey}
                      isDark={isDark}
                      themeMode={themeMode}
                      onClick={() => {
                        onSelectDate(session.dateKey);
                        if (window.innerWidth < 768) onClose();
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 2. Yesterday Group */}
              {yesterdaySessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                    <span>Yesterday</span>
                    <span className="text-[10px] lowercase font-normal opacity-70">
                      {yesterdaySessions[0].entries.length} reflections
                    </span>
                  </div>
                  {yesterdaySessions.map((session) => (
                    <DaySessionItem
                      key={session.dateKey}
                      session={session}
                      isSelected={selectedDateKey === session.dateKey}
                      isDark={isDark}
                      themeMode={themeMode}
                      onClick={() => {
                        onSelectDate(session.dateKey);
                        if (window.innerWidth < 768) onClose();
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 3. Specific Past Dates (e.g. "Aug 25, 2026") */}
              {previousSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                    <span>Past Days</span>
                    <span className="text-[10px] font-normal opacity-70">
                      {previousSessions.length}
                    </span>
                  </div>
                  {previousSessions.map((session) => (
                    <DaySessionItem
                      key={session.dateKey}
                      session={session}
                      isSelected={selectedDateKey === session.dateKey}
                      isDark={isDark}
                      themeMode={themeMode}
                      onClick={() => {
                        onSelectDate(session.dateKey);
                        if (window.innerWidth < 768) onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom User / Sanctuary Status Footer */}
        <div className="p-3 border-t border-inherit flex items-center justify-between text-[11px] opacity-75">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="truncate">{user.name}'s Sanctuary</span>
          </div>
          <span className="font-mono text-[10px] opacity-70 shrink-0">
            {user.companionName || 'Luna'}
          </span>
        </div>
      </aside>
    </>
  );
};

interface DaySessionItemProps {
  session: DaySession;
  isSelected: boolean;
  isDark: boolean;
  themeMode: ThemeMode;
  onClick: () => void;
}

const DaySessionItem: React.FC<DaySessionItemProps> = ({
  session,
  isSelected,
  isDark,
  themeMode,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col gap-1 ${
        isSelected
          ? isDark
            ? 'bg-[#1C1C2B] border-indigo-400 text-white shadow-xs font-medium'
            : themeMode === 'peaceful-sage'
            ? 'bg-white border-[#2A5731] text-[#16361A] shadow-xs font-medium'
            : 'bg-white border-[#0D746B] text-[#073F3A] shadow-xs font-medium'
          : isDark
          ? 'border-transparent hover:bg-[#181825] opacity-80 hover:opacity-100 text-zinc-300'
          : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {session.moodEmoji ? (
            <span className="text-xs">{session.moodEmoji}</span>
          ) : (
            <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
          )}
          <span className="font-semibold text-xs truncate">
            {session.label}
          </span>
        </div>

        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-mono shrink-0 opacity-80">
          {session.entries.length}
        </span>
      </div>

      <p className="text-[11px] leading-snug line-clamp-2 opacity-75 font-normal">
        {session.previewSnippet}
      </p>

      {session.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {session.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 opacity-70"
            >
              #{t}
            </span>
          ))}
          {session.tags.length > 2 && (
            <span className="text-[9px] opacity-50">+{session.tags.length - 2}</span>
          )}
        </div>
      )}
    </button>
  );
};
