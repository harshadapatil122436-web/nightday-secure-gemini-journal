import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, Bookmark, Sparkles, UserCircle2, Flame, Palette, 
  Music, Volume2, VolumeX, PanelLeft, Settings, ShieldCheck,
  BookOpen, Compass, Wind, Plus, PenLine, Check
} from 'lucide-react';
import { UserProfile, ThemeMode, MusicTrack, JournalEntry } from '../types';
import { THEMES } from '../utils/themeConfig';
import { JournalLogo } from './JournalLogo';
import { AvatarDisplay } from './AvatarDisplay';
import { calculateJournalStreak } from '../utils/streakHelper';

interface HeaderProps {
  user: UserProfile;
  entries?: JournalEntry[];
  activeView: 'sanctuary' | 'write' | 'companion' | 'feed';
  onSelectView: (view: 'sanctuary' | 'write' | 'companion' | 'feed') => void;
  onOpenNewReflection: () => void;
  onOpenWeeklySummary: () => void;
  onOpenPromptDialog?: () => void;
  onOpenBreatheModal: () => void;
  onOpenMusicSidebar: () => void;
  onOpenProfileModal: (tab?: 'profile' | 'companion') => void;
  onOpenSecurityModal: () => void;
  onOpenDiaryExport?: () => void;
  isMusicPlaying: boolean;
  currentTrack?: MusicTrack | null;
  onToggleMusicPlay?: () => void;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  onLogout: () => void;
  totalEntriesCount: number;
  isHistorySidebarOpen?: boolean;
  onToggleHistorySidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  entries = [],
  activeView,
  onSelectView,
  onOpenNewReflection,
  onOpenWeeklySummary,
  onOpenPromptDialog,
  onOpenBreatheModal,
  onOpenMusicSidebar,
  onOpenProfileModal,
  onOpenSecurityModal,
  isMusicPlaying,
  currentTrack,
  onToggleMusicPlay,
  themeMode,
  onSelectTheme,
  onLogout,
  isHistorySidebarOpen,
  onToggleHistorySidebar,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES[themeMode] || THEMES['midnight-black'];
  const isDark = themeMode === 'midnight-black';
  const streakInfo = calculateJournalStreak(entries);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const companionName = user.companionName || 'Luna';

  return (
    <header
      id="nightday-main-header"
      className={`h-18 border-b ${currentTheme.headerBg} ${currentTheme.headerBorder} ${currentTheme.headerText} transition-colors duration-200 flex items-center justify-between px-4 sm:px-8 lg:px-10 sticky top-0 z-30 font-sans shadow-xs backdrop-blur-md`}
    >
      {/* Left: App Logo & Brand Name + Sidebar Toggle (Only in Companion View) + Streak */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {(activeView === 'companion' || activeView === 'feed') && onToggleHistorySidebar && (
          <button
            id="header-toggle-sidebar-btn"
            type="button"
            onClick={onToggleHistorySidebar}
            title={isHistorySidebarOpen ? "Collapse Reflection Sidebar" : "Open Reflection Sidebar"}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isHistorySidebarOpen
                ? 'bg-black/10 dark:bg-white/15 border-current/20 text-current shadow-2xs font-semibold'
                : 'border-transparent opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <PanelLeft className="w-4.5 h-4.5" />
            <span className="text-xs font-medium hidden md:inline">
              {isHistorySidebarOpen ? 'Hide History' : 'History'}
            </span>
          </button>
        )}

        <JournalLogo size="sm" isDark={isDark} />

        {/* Streak Badge */}
        <div
          id="header-streak-badge"
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-semibold shadow-xs"
        >
          <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          <span>{streakInfo.currentStreak || 3} days streak</span>
        </div>
      </div>

      {/* Center / Right: Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Sanctuary Tab */}
        <button
          type="button"
          onClick={() => onSelectView('sanctuary')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'sanctuary'
              ? isDark
                ? 'bg-[#1E293B] text-slate-100 shadow-xs border border-slate-700/60'
                : `${currentTheme.userBtn} ring-1 ring-current/20 font-bold`
              : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Sanctuary</span>
        </button>

        {/* 2. Sol Companion Tab */}
        <button
          type="button"
          onClick={() => onSelectView('companion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeView === 'companion'
              ? isDark
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs'
                : `${currentTheme.summaryBtn} shadow-xs font-bold`
              : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden sm:inline">{companionName} Companion</span>
        </button>

        {/* 3. Weekly Synthesis Tab */}
        <button
          type="button"
          onClick={onOpenWeeklySummary}
          className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>Weekly Synthesis</span>
        </button>

        {/* 4. Inspiration & Breath Tab */}
        <button
          type="button"
          onClick={onOpenPromptDialog}
          className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Inspiration</span>
        </button>

        {/* 5. Breathe Pill Button */}
        <button
          type="button"
          onClick={onOpenBreatheModal}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Breathe</span>
        </button>

        {/* 6. Ambient Music Button */}
        <button
          type="button"
          onClick={onOpenMusicSidebar}
          title={isMusicPlaying ? 'Sanctuary Music Playing' : 'Open Music Sanctuary'}
          className={`p-2.5 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
            isMusicPlaying ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 opacity-100' : ''
          }`}
        >
          <Music className={`w-4.5 h-4.5 ${isMusicPlaying ? 'animate-pulse text-emerald-600 dark:text-emerald-400' : ''}`} />
        </button>

        {/* 8. User Profile & Account Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="header-user-menu-btn"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-1.5 p-1 rounded-full border transition-colors cursor-pointer ${
              isDark ? 'border-[#1E293B] bg-[#131C31] hover:bg-[#1E293B]' : 'border-current/20 bg-white/90 hover:bg-white'
            }`}
            title="User Account & Settings"
          >
            <AvatarDisplay
              avatarUrl={user.avatarUrl}
              avatarId={user.avatarId}
              name={user.name}
              size="sm"
            />
          </button>

          {profileOpen && (
            <div
              id="header-profile-dropdown"
              className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in duration-100 space-y-2.5 ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
            >
              {/* User Header */}
              <div className="px-2 py-2 border-b border-current/10 flex items-center gap-3">
                <AvatarDisplay
                  avatarUrl={user.avatarUrl}
                  avatarId={user.avatarId}
                  name={user.name}
                  size="sm"
                />
                <div className="overflow-hidden flex-1">
                  <div className="text-sm font-semibold truncate">
                    {user.name || 'Friend'}
                  </div>
                  <div className="text-xs opacity-70 flex items-center gap-1">
                    <span>Companion:</span>
                    <span className="text-indigo-600 dark:text-indigo-300 font-medium">{companionName}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-0.5 text-xs sm:text-sm space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenProfileModal('profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Your Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenProfileModal('companion');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span>Customize {companionName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSecurityModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Privacy &amp; Security</span>
                </button>
              </div>

              {/* Dedicated Theme Setting Section */}
              <div className="pt-2 border-t border-current/10 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold opacity-70 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Theme Setting
                  </span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-300 font-medium">
                    {THEMES[themeMode]?.name || 'Midnight Dark'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectTheme('midnight-black')}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      themeMode === 'midnight-black'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-xs font-bold'
                        : isDark
                        ? 'bg-[#131C31] hover:bg-[#1A2642] border-[#1E293B] text-slate-300'
                        : 'bg-black/5 hover:bg-black/10 border-current/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🌙</span>
                      <span className="truncate">Midnight</span>
                    </div>
                    {themeMode === 'midnight-black' && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTheme('teal-quill')}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      themeMode === 'teal-quill'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs font-bold'
                        : isDark
                        ? 'bg-[#131C31] hover:bg-[#1A2642] border-[#1E293B] text-slate-300'
                        : 'bg-black/5 hover:bg-black/10 border-current/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🪶</span>
                      <span className="truncate">Teal Quill</span>
                    </div>
                    {themeMode === 'teal-quill' && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTheme('clean-white')}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      themeMode === 'clean-white'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs font-bold'
                        : isDark
                        ? 'bg-[#131C31] hover:bg-[#1A2642] border-[#1E293B] text-slate-300'
                        : 'bg-black/5 hover:bg-black/10 border-current/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>☀️</span>
                      <span className="truncate">Morning</span>
                    </div>
                    {themeMode === 'clean-white' && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTheme('peaceful-sage')}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      themeMode === 'peaceful-sage'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-xs font-bold'
                        : isDark
                        ? 'bg-[#131C31] hover:bg-[#1A2642] border-[#1E293B] text-slate-300'
                        : 'bg-black/5 hover:bg-black/10 border-current/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🌿</span>
                      <span className="truncate">Sage</span>
                    </div>
                    {themeMode === 'peaceful-sage' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer text-xs sm:text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
