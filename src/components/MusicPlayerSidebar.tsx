import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Search, 
  Sparkles, 
  Music, 
  SkipForward, 
  SkipBack, 
  Square,
  Flame,
  Radio
} from 'lucide-react';
import { MusicTrack, MoodType, ThemeMode } from '../types';
import { AMBIENT_TRACKS } from '../data/musicData';
import { ambientAudio } from '../utils/ambientAudio';
import { THEMES } from '../utils/themeConfig';

interface MusicPlayerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood?: MoodType;
  themeMode: ThemeMode;
  currentTrack: MusicTrack;
  isPlaying: boolean;
  onTrackChange: (track: MusicTrack, playImmediately?: boolean) => void;
  onTogglePlay: (track?: MusicTrack) => void;
  onStop: () => void;
}

export const MusicPlayerSidebar: React.FC<MusicPlayerSidebarProps> = ({
  isOpen,
  onClose,
  currentMood,
  themeMode,
  currentTrack,
  isPlaying,
  onTrackChange,
  onTogglePlay,
  onStop,
}) => {
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  const handleNextTrack = () => {
    const currentIndex = AMBIENT_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % AMBIENT_TRACKS.length;
    const nextTrack = AMBIENT_TRACKS[nextIndex];
    onTrackChange(nextTrack, true);
  };

  const handlePrevTrack = () => {
    const currentIndex = AMBIENT_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    const prevTrack = AMBIENT_TRACKS[prevIndex];
    onTrackChange(prevTrack, true);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    ambientAudio.setVolume(isMuted ? 0 : newVol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      ambientAudio.setVolume(volume);
    } else {
      setIsMuted(true);
      ambientAudio.setVolume(0);
    }
  };

  // Filter tracks with full Spotify-like search (title, artist, category, tags)
  const filteredTracks = AMBIENT_TRACKS.filter((track) => {
    if (selectedCategory !== 'all' && track.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = track.title.toLowerCase().includes(q);
      const inArtist = track.artist.toLowerCase().includes(q);
      const inDesc = track.description.toLowerCase().includes(q);
      const inCategory = track.category.toLowerCase().includes(q);
      const inTags = track.tags?.some((t) => t.toLowerCase().includes(q));
      return inTitle || inArtist || inDesc || inCategory || inTags;
    }
    return true;
  });

  // Mood recommendations
  const recommendedTracks = AMBIENT_TRACKS.filter(
    (t) => currentMood && t.recommendedForMoods.includes(currentMood)
  );

  const categories = [
    { id: 'all', label: `All (${AMBIENT_TRACKS.length})` },
    { id: 'pop-hits', label: '🔥 Pop Hits (12)' },
    { id: 'rain', label: '🌧️ Rain (11)' },
    { id: 'nature', label: '🌿 Nature (11)' },
    { id: 'lofi', label: '☕ Lo-Fi (11)' },
    { id: 'piano', label: '🎹 Piano (11)' },
    { id: 'meditation', label: '✨ Zen (11)' },
    { id: 'cozy', label: '🔥 Cozy (11)' },
  ];

  // Dynamic custom track for any unmatched search query
  const handlePlayDynamicSearchedSong = () => {
    const customSongName = searchQuery.trim();
    if (!customSongName) return;

    const dynamicTrack: MusicTrack = {
      id: `dynamic-${Date.now()}`,
      title: customSongName,
      artist: 'Spotify Dynamic Synth',
      category: 'pop-hits',
      duration: '3:30',
      soundType: `dynamic-${customSongName.toLowerCase().replace(/\s+/g, '-')}`,
      coverEmoji: '🎵',
      coverGradient: 'from-fuchsia-600 via-rose-600 to-indigo-800',
      description: `Generative melodic arrangement synthesized in real-time for "${customSongName}".`,
      recommendedForMoods: ['happy', 'reflective', 'calm'],
    };

    onTrackChange(dynamicTrack, true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs"
      />

      {/* Right Drawer */}
      <motion.div
        id="music-sidebar-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[440px] z-50 shadow-2xl border-l flex flex-col backdrop-blur-2xl ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
      >
        {/* Top Header */}
        <div className={`p-4 border-b flex items-center justify-between ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center shadow-md">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold tracking-tight">
                Spotify Sanctuary
              </h2>
              <p className="text-[11px] opacity-60">
                80+ tracks • Pop Hits, Rain, Nature & Beats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Instant Quick-Pause Circle Button in header */}
            {isPlaying && (
              <button
                type="button"
                onClick={() => onTogglePlay()}
                title="Quick Pause"
                className="w-7 h-7 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-sm cursor-pointer animate-pulse"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-stone-500/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-current/10 space-y-2.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            <input
              id="music-catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any song (e.g. Dynamite, Golden Hour, Rain)..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-stone-950 font-semibold border-emerald-400 shadow-xs'
                    : 'border-current/15 opacity-70 hover:opacity-100 hover:bg-stone-500/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* If user searched a song with no exact match, offer dynamic generator */}
          {searchQuery && filteredTracks.length === 0 && (
            <div className="p-4 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 text-center space-y-2.5">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
              <div>
                <p className="text-xs font-semibold">Play "{searchQuery}" on Spotify Synthesizer</p>
                <p className="text-[11px] opacity-70 mt-0.5">
                  Generate and play a custom generative melody for this title in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePlayDynamicSearchedSong}
                className="px-4 py-1.5 rounded-full bg-emerald-500 text-stone-950 text-xs font-semibold hover:bg-emerald-400 shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Live Synthesizer</span>
              </button>
            </div>
          )}

          {/* Recommended Section if mood active */}
          {recommendedTracks.length > 0 && !searchQuery && selectedCategory === 'all' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended for your {currentMood} state</span>
              </div>
              <div className="space-y-2">
                {recommendedTracks.slice(0, 3).map((track, rIdx) => (
                  <div
                    key={`rec-track-${track.id}-${rIdx}`}
                    onClick={() => onTogglePlay(track)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      currentTrack.id === track.id && isPlaying
                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-400/30'
                        : 'border-current/10 hover:border-current/30 hover:bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.coverGradient} flex items-center justify-center text-lg text-white shadow-xs shrink-0`}
                      >
                        <span>{track.coverEmoji}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold font-serif leading-tight">
                          {track.title}
                        </p>
                        <p className="text-[10px] opacity-60 mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform cursor-pointer"
                    >
                      {currentTrack.id === track.id && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Filtered Tracks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider opacity-60">
              <span>Sound Library ({filteredTracks.length})</span>
              {selectedCategory !== 'all' && (
                <span className="text-[10px] font-normal normal-case">10+ tracks</span>
              )}
            </div>

            <div className="space-y-2">
              {filteredTracks.map((track, tIdx) => {
                const isThisTrackPlaying = currentTrack.id === track.id && isPlaying;
                return (
                  <div
                    key={`sound-lib-${track.id}-${tIdx}`}
                    onClick={() => onTogglePlay(track)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isThisTrackPlaying
                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-400/30'
                        : 'border-current/10 hover:border-current/25 hover:bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${track.coverGradient} flex items-center justify-center text-xl text-white shadow-xs shrink-0 relative overflow-hidden`}
                      >
                        <span>{track.coverEmoji}</span>
                        {isThisTrackPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="w-1 h-5 bg-teal-300 rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold font-serif truncate leading-tight">
                            {track.title}
                          </p>
                          {track.category === 'pop-hits' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase shrink-0">
                              Pop
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-60 truncate mt-0.5">{track.artist}</p>
                        <p className="text-[11px] opacity-75 truncate mt-0.5 font-journal">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                        isThisTrackPlaying
                          ? 'bg-emerald-500 text-stone-950 shadow-md'
                          : 'bg-stone-500/10 text-current hover:bg-emerald-500 hover:text-stone-950'
                      }`}
                    >
                      {isThisTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Now Playing Bar (Spotify-like Mini Controller) */}
        <div className={`p-4 border-t ${currentTheme.headerBg} ${currentTheme.headerBorder} space-y-3`}>
          {/* Track Info & Equalizer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTrack.coverGradient} flex items-center justify-center text-lg text-white shadow-xs shrink-0`}
              >
                <span>{currentTrack.coverEmoji}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold font-serif truncate leading-tight">
                  {currentTrack.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] opacity-60 truncate">{currentTrack.artist}</span>
                  {isPlaying && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Playing</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Playback Controls (With Instant 1-Click Quick Pause & Quick Stop) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevTrack}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* 1-Click Circle Play/Pause Button */}
              <button
                id="music-sidebar-play-btn"
                type="button"
                onClick={() => onTogglePlay()}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Quick Pause (1-Click)' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Instant Emergency Stop */}
              {isPlaying && (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="Stop Audio"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 pt-1 border-t border-current/10">
            <button
              type="button"
              onClick={handleToggleMute}
              className="opacity-70 hover:opacity-100 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 rounded-lg bg-stone-300 dark:bg-stone-700 accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] opacity-60 w-7 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
