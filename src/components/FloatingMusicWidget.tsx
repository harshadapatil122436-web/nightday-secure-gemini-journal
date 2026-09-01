import React, { useState } from 'react';
import { Pause, Play, Square, SkipForward, Music2, Volume2, Sparkles } from 'lucide-react';
import { MusicTrack, ThemeMode } from '../types';
import { THEMES } from '../utils/themeConfig';

interface FloatingMusicWidgetProps {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onNextTrack?: () => void;
  onOpenSidebar: () => void;
  themeMode: ThemeMode;
}

export const FloatingMusicWidget: React.FC<FloatingMusicWidgetProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onStop,
  onNextTrack,
  onOpenSidebar,
  themeMode,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  if (!currentTrack) return null;

  return (
    <aside
      id="stable-vertical-music-bar"
      aria-label="Sanctuary Music Player"
      className={`fixed bottom-4 right-2.5 sm:right-6 z-30 flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border shadow-xl backdrop-blur-xl transition-all duration-300 select-none ${currentTheme.verticalMusicWidgetBg} ${currentTheme.verticalMusicWidgetBorder} ${currentTheme.verticalMusicWidgetText}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Floating Info Tooltip on Hover / Playing (Anchored to the Left of the Right-Side Bar) */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute right-full mr-3 bottom-2 bg-stone-900/95 text-white text-xs px-3 py-2 rounded-xl shadow-2xl backdrop-blur-xl border border-white/20 whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-right-2 duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{currentTrack.coverEmoji}</span>
            <div>
              <p className="font-semibold text-xs leading-tight text-white flex items-center gap-1.5">
                <span>{currentTrack.title}</span>
                {isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </p>
              <p className="text-[10px] text-stone-300 mt-0.5">
                {isPlaying ? 'Playing • Click library for more' : 'Paused • Sanctuary Sound'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Top: Rotating Vinyl Disc / Emoji Cover (Click to open music library) */}
      <div className="relative group/disc">
        <button
          type="button"
          onClick={onOpenSidebar}
          title="Open Sanctuary Music Library"
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base shadow-sm relative overflow-hidden transition-transform duration-200 cursor-pointer group-hover/disc:scale-105 bg-gradient-to-br ${currentTrack.coverGradient}`}
        >
          <span
            className={`transition-all ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '7s' }}
          >
            {currentTrack.coverEmoji}
          </span>

          {/* Sound waves overlay when playing */}
          {isPlaying && (
            <span className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-40 pointer-events-none" />
          )}
        </button>

        {/* Small Music Badge Indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-xs border text-[9px] ${
            isPlaying
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-stone-700 text-stone-300 border-stone-600'
          }`}
        >
          {isPlaying ? <Volume2 className="w-2.5 h-2.5" /> : <Music2 className="w-2.5 h-2.5" />}
        </div>
      </div>

      {/* 2. Vertical Divider */}
      <div className="w-6 h-px bg-current opacity-20 my-0.5" />

      {/* 3. Primary Play / Pause Button */}
      <button
        id="vertical-music-play-btn"
        type="button"
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause Sanctuary Music' : 'Play Sanctuary Music'}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
          isPlaying
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/30'
            : currentTheme.summaryBtn
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* 4. Skip to Next Track Button */}
      {onNextTrack && (
        <button
          id="vertical-music-next-btn"
          type="button"
          onClick={onNextTrack}
          title="Next Sanctuary Track"
          className="w-8 h-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      )}

      {/* 5. Music Library Trigger Button */}
      <button
        id="vertical-music-library-btn"
        type="button"
        onClick={onOpenSidebar}
        title="Open Full Music & Ambient Sounds Library"
        className="w-8 h-8 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
      >
        <Music2 className="w-4 h-4" />
      </button>

      {/* 6. Stop Audio Button (Only shown when active) */}
      {isPlaying && (
        <button
          id="vertical-music-stop-btn"
          type="button"
          onClick={onStop}
          title="Stop Music"
          className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      )}
    </aside>
  );
};


