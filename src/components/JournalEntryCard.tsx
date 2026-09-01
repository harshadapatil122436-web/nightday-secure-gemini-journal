import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Check, Volume2, VolumeX, Bookmark, Trash2, Tag, Sparkles, X, Maximize2 } from 'lucide-react';
import { JournalEntry, ThemeMode, UserProfile } from '../types';
import { MOOD_CONFIGS } from '../data/initialData';
import { formatJournalText } from '../utils/textUtils';
import { THEMES } from '../utils/themeConfig';
import { AvatarDisplay } from './AvatarDisplay';

interface JournalEntryCardProps {
  entry: JournalEntry;
  themeMode: ThemeMode;
  user: UserProfile;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  themeMode,
  user,
  onDelete,
  onToggleFavorite,
  onSelectTag,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const isUser = entry.author === 'user';
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  // Format time stamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Copy entry text
  const handleCopy = () => {
    navigator.clipboard.writeText(formatJournalText(entry.content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-to-speech for companion reflection
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = formatJournalText(entry.content);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const moodConfig = entry.mood ? MOOD_CONFIGS.find((m) => m.id === entry.mood) : null;
  const companionName = user.companionName || 'Luna';

  return (
    <>
      <div
        id={`journal-entry-${entry.id}`}
        className={`group w-full flex items-start gap-2.5 sm:gap-3.5 transition-all duration-200 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Circular Avatar (WhatsApp style) */}
        <div className="shrink-0 pt-1">
          {isUser ? (
            <AvatarDisplay
              avatarUrl={user.avatarUrl}
              avatarId={user.avatarId}
              name={user.name}
              size="md"
              className="ring-2 ring-current/10"
            />
          ) : (
            <AvatarDisplay
              avatarUrl={user.companionAvatarUrl}
              avatarId={user.companionAvatarId || 'mint-leaf'}
              name={companionName}
              size="md"
              isAi
              className="ring-2 ring-teal-500/20"
            />
          )}
        </div>

        {/* Main Journal Bubble & Header Container */}
        <div className={`flex flex-col flex-1 max-w-[88%] sm:max-w-[84%] md:max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}>
          {/* Name, Time, & Mood Header */}
          <div className={`flex items-center gap-2 mb-1.5 px-1.5 text-xs ${
            isUser ? 'flex-row-reverse text-right' : 'flex-row text-left'
          }`}>
            <span className={`font-serif font-semibold text-xs sm:text-sm ${
              isUser ? currentTheme.authorUserText : currentTheme.authorAiText
            }`}>
              {isUser ? user.name || 'You' : companionName}
            </span>
            <span className="text-[11px] sm:text-xs opacity-50">
              {formatTime(entry.timestamp)}
            </span>

            {/* Mood Stamp for user entry */}
            {isUser && moodConfig && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-sans font-medium border bg-stone-500/10 border-stone-500/20"
              >
                <span>{moodConfig.emoji}</span>
                <span>{moodConfig.label}</span>
              </span>
            )}
          </div>

          {/* Main Card Bubble */}
          <div
            className={`relative w-full rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-200 shadow-xs ${
              isUser
                ? `rounded-tr-xs ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder} ${currentTheme.cardUserText}`
                : `rounded-tl-xs ${currentTheme.cardAiBg} ${currentTheme.cardAiBorder} ${currentTheme.cardAiLeftBorder} ${currentTheme.cardAiText}`
            }`}
          >

            {/* Attached Photo in Entry (Polaroid / Diary snapshot style) */}
            {entry.imageUrl && (
              <div className="mb-3.5">
                <div 
                  onClick={() => setShowImageLightbox(true)}
                  className="relative group/photo rounded-xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50 shadow-md bg-stone-950/20 max-w-sm cursor-pointer"
                >
                  <img
                    src={entry.imageUrl}
                    alt="Journal reflection memory"
                    className="w-full max-h-72 object-cover transition-transform duration-300 group-hover/photo:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-sans font-medium flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      <span>Click to view</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Entry Content */}
            {isUser ? (
              <p className="font-journal text-base sm:text-[17px] leading-[1.8] tracking-normal whitespace-pre-wrap font-normal">
                {formatJournalText(entry.content)}
              </p>
            ) : (
              <div className="font-journal text-base sm:text-[17px] leading-[1.8] space-y-3 prose max-w-none prose-p:my-2 prose-strong:font-semibold">
                {entry.isStreaming && !entry.content.trim() ? (
                  <div className="flex items-center gap-2 py-1 text-sm opacity-80 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                    <span>{companionName} is gently reflecting...</span>
                  </div>
                ) : (
                  <>
                    <Markdown>{formatJournalText(entry.content)}</Markdown>
                    {entry.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-pink-500/70 animate-pulse rounded-xs align-middle" />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-2.5 border-t border-current/10">
                {entry.tags.map((tag, tagIdx) => (
                  <button
                    key={`card-tag-${tag}-${tagIdx}`}
                    type="button"
                    onClick={() => onSelectTag && onSelectTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${currentTheme.tagBadge}`}
                  >
                    <Tag className="w-3 h-3 opacity-60" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-current/10 text-xs">
              <div className="flex items-center gap-2">
                {/* Read Aloud button for AI reply */}
                {!isUser && 'speechSynthesis' in window && (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    title={isSpeaking ? "Stop reading" : "Listen to reflection"}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-sans transition-colors cursor-pointer ${
                      isSpeaking
                        ? 'bg-pink-600 text-white font-medium animate-pulse'
                        : 'opacity-70 hover:opacity-100 hover:bg-stone-500/10'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{isSpeaking ? 'Listening...' : 'Read Aloud'}</span>
                  </button>
                )}

                {/* Favorite / Bookmark toggle */}
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(entry.id)}
                    title={entry.favorite ? "Remove bookmark" : "Bookmark this reflection"}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      entry.favorite
                        ? 'text-amber-500 fill-current'
                        : 'opacity-50 hover:opacity-100 hover:bg-stone-500/10'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${entry.favorite ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy text"
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-stone-500/10 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Delete button */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    title="Delete reflection"
                    className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal for Photo */}
      {showImageLightbox && entry.imageUrl && (
        <div 
          onClick={() => setShowImageLightbox(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setShowImageLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white shadow-lg z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={entry.imageUrl}
              alt="Full view reflection"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs text-stone-300 font-sans">
              <span>{user.name}'s journal photo • {formatTime(entry.timestamp)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
