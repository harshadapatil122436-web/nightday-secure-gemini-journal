import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Lightbulb, Mic, MicOff, Maximize2, Minimize2, 
  Sparkles, Send, Tag, Plus, Check, MessageSquare, 
  HelpCircle, RefreshCw, X, ChevronRight, Wand2, Volume2, Pause
} from 'lucide-react';
import { MoodType, ThemeMode, UserProfile, JournalEntry } from '../types';
import { MOOD_CONFIGS, POPULAR_TAG_SUGGESTIONS } from '../data/initialData';
import { THEMES } from '../utils/themeConfig';

interface ReflectionComposerViewProps {
  user: UserProfile;
  themeMode: ThemeMode;
  onBackToSanctuary: () => void;
  onSubmitReflection: (title: string, content: string, mood?: MoodType, tags?: string[]) => Promise<void>;
  isSubmitting: boolean;
  onOpenInspirationModal?: () => void;
}

interface SolMessage {
  id: string;
  sender: 'user' | 'sol';
  text: string;
  timestamp: string;
}

export const ReflectionComposerView: React.FC<ReflectionComposerViewProps> = ({
  user,
  themeMode,
  onBackToSanctuary,
  onSubmitReflection,
  isSubmitting,
  onOpenInspirationModal,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('peaceful');
  const [tags, setTags] = useState<string[]>(['Mindful']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTagBar, setShowTagBar] = useState(false);

  const currentTheme = THEMES[themeMode] || THEMES['midnight-black'];
  const isDark = themeMode === 'midnight-black';

  // Speech to Text (Dictation) State
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [dictationError, setDictationError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // AI Sol Companion Helper State
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [solMessages, setSolMessages] = useState<SolMessage[]>([
    {
      id: 'welcome',
      sender: 'sol',
      text: `Hello ${user.name || 'Friend'}. I'm here with you as you write. If you feel stuck, need perspective, or want to untangle an emotion, just ask me anytime.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const speechRecognitionRef = useRef<any>(null);
  const aiChatScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerIntervalRef = useRef<any>(null);

  // Auto-scroll AI chat messages
  useEffect(() => {
    if (aiChatScrollRef.current) {
      aiChatScrollRef.current.scrollTop = aiChatScrollRef.current.scrollHeight;
    }
  }, [solMessages, isAiResponding]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setRecordingSeconds(0);
      setInterimTranscript('');
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Format current date matching screenshot (e.g. "Sun, Aug 30")
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate live word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Process voice transcript with voice punctuation commands
  const processVoicePunctuation = (text: string): string => {
    return text
      .replace(/\s+period\b/gi, '.')
      .replace(/\s+comma\b/gi, ',')
      .replace(/\s+question mark\b/gi, '?')
      .replace(/\s+exclamation mark\b/gi, '!')
      .replace(/\s+new line\b/gi, '\n')
      .replace(/\s+new paragraph\b/gi, '\n\n');
  };

  // Robust Speech-to-Text Dictation
  const startSpeechRecognition = useCallback(() => {
    setDictationError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setDictationError('Voice dictation is not supported by this browser. We recommend Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setDictationError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscripts = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscripts += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTranscripts) {
          const formatted = processVoicePunctuation(finalTranscripts);
          setContent((prev) => {
            const separator = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            return prev + separator + formatted;
          });
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setDictationError('Microphone access was denied. Please allow microphone permissions in your browser.');
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Keep listening
        } else {
          setDictationError(`Voice input notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If recording state is still active (e.g. brief silence cutoff), attempt to continue
        if (speechRecognitionRef.current && isRecording) {
          try {
            speechRecognitionRef.current.start();
          } catch {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to start dictation:', e);
      setDictationError('Could not initialize speech recognition. Please check microphone permissions.');
      setIsRecording(false);
    }
  }, [isRecording]);

  const stopSpeechRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        console.warn('Stop speech notice:', e);
      }
    }
    speechRecognitionRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  const toggleDictation = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = customTagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setCustomTagInput('');
    }
  };

  // Talk with Sol AI Assistant in real time
  const handleSendAiMessage = async (queryText: string) => {
    const textToSend = queryText || aiChatInput;
    if (!textToSend.trim() || isAiResponding) return;

    const userMsg: SolMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSolMessages((prev) => [...prev, userMsg]);
    setAiChatInput('');
    setIsAiResponding(true);

    try {
      const response = await fetch('/api/journal/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: `User is writing a reflection titled "${title}". Current draft: "${content}". User asks Sol: "${textToSend}"`,
          mood: selectedMood,
          userName: user.name || 'Friend',
          companionName: user.companionName || 'Sol',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reflection || data.reply || "I'm listening and holding this space for you.";
        setSolMessages((prev) => [
          ...prev,
          {
            id: `sol-${Date.now()}`,
            sender: 'sol',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Could not reach Sol');
      }
    } catch (err) {
      setSolMessages((prev) => [
        ...prev,
        {
          id: `sol-${Date.now()}`,
          sender: 'sol',
          text: `Take a steady breath. Even if words feel messy right now, write whatever comes naturally. What emotion is strongest for you in this moment?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleSaveAndReflect = async () => {
    if (!content.trim() || isSubmitting) return;
    if (isRecording) {
      stopSpeechRecognition();
    }
    await onSubmitReflection(title.trim(), content.trim(), selectedMood, tags);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const companionName = user.companionName || 'Sol';

  return (
    <div 
      ref={containerRef}
      id="reflection-composer-view"
      className={`flex-1 w-full h-full ${currentTheme.bodyClass} flex flex-col overflow-hidden font-sans select-text`}
    >
      {/* Top Bar with enhanced scale & clean layout */}
      <header className={`h-20 px-6 sm:px-10 lg:px-14 border-b ${currentTheme.headerBorder} ${currentTheme.headerBg} flex items-center justify-between shrink-0 z-10`}>
        {/* Left: Back to Sanctuary + Date */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => {
              if (isRecording) stopSpeechRecognition();
              onBackToSanctuary();
            }}
            className="flex items-center gap-2.5 opacity-80 hover:opacity-100 text-sm sm:text-base font-semibold transition-colors cursor-pointer group py-2"
          >
            <ArrowLeft className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-transform group-hover:-translate-x-1" />
            <span>Back to Sanctuary</span>
          </button>

          <span className="text-sm sm:text-base font-medium opacity-60 border-l border-current/10 pl-6">
            {formattedDate}
          </span>
        </div>

        {/* Right: Maximize, Inspiration, Dictate & AI Assistant */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Writing Mode"}
            className="p-3 rounded-2xl opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 border border-current/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Inspiration Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenInspirationModal) {
                onOpenInspirationModal();
              } else {
                setTitle('Evening stillness and finding clarity');
              }
            }}
            className="flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Lightbulb className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400" />
            <span>Inspiration</span>
          </button>

          {/* Mic to Text (Dictate Voice Button) */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all cursor-pointer text-sm sm:text-base font-semibold shadow-xs ${
              isRecording
                ? 'bg-rose-500/25 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/40 animate-pulse'
                : `${currentTheme.buttonPrimary} shadow-sm`
            }`}
            title="Dictate reflection using your microphone"
          >
            {isRecording ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <MicOff className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span>Listening ({formatSeconds(recordingSeconds)})</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Dictate (Voice)</span>
              </>
            )}
          </button>

          {/* Sol AI Helper Toggle */}
          <button
            type="button"
            onClick={() => setIsAiHelperOpen(!isAiHelperOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all cursor-pointer text-sm sm:text-base font-semibold shadow-xs ${
              isAiHelperOpen
                ? `${currentTheme.buttonPrimary} ring-2 ring-indigo-500/40 shadow-sm`
                : `${currentTheme.moodBtnInactive}`
            }`}
          >
            <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Ask {companionName}</span>
          </button>
        </div>
      </header>

      {/* Main Body Area (Writing Canvas + Collapsible Sol Helper) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Writing Canvas with generous width & scaled typography */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-16 md:px-28 lg:px-44 py-12 max-w-6xl mx-auto flex flex-col justify-between">
          <div className="space-y-10">
            {/* CURRENT ENERGY & MOOD */}
            <div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center justify-between">
                <span>CURRENT ENERGY &amp; MOOD</span>
                <span className="text-xs font-normal opacity-70 lowercase">select how you are feeling right now</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {MOOD_CONFIGS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={`flex items-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? `${currentTheme.moodBtnActive} scale-[1.03]`
                          : `${currentTheme.moodBtnInactive}`
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Focal Thought Input */}
            <div className="pt-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or focal thought for this reflection..."
                className="w-full bg-transparent border-none outline-none text-3xl sm:text-4xl lg:text-5xl font-serif font-bold placeholder:opacity-40 focus:ring-0 px-0 tracking-tight"
              />
            </div>

            {/* Dedicated In-Editor Voice Dictation Waveform Banner */}
            {isRecording && (
              <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-rose-950/20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
                    <Mic className="w-6 h-6 text-rose-600 dark:text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm sm:text-base font-bold">Live Voice-to-Text Active</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-mono font-semibold">
                        {formatSeconds(recordingSeconds)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm opacity-80 mt-1">
                      {interimTranscript ? (
                        <span className="italic font-medium">"{interimTranscript}"</span>
                      ) : (
                        "Speak naturally. Say 'period', 'comma', or 'new line' to punctuate..."
                      )}
                    </p>
                  </div>
                </div>

                {/* Animated Sound Waves */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-10 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-12 bg-rose-500 rounded-full animate-bounce [animation-delay:0s]" />
                  <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.4s]" />

                  <button
                    type="button"
                    onClick={stopSpeechRecognition}
                    className="ml-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                  >
                    Done Speaking
                  </button>
                </div>
              </div>
            )}

            {/* Dictation Error Notice if any */}
            {dictationError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-2">
                <span>{dictationError}</span>
                <button
                  type="button"
                  onClick={() => setDictationError(null)}
                  className="p-1 hover:opacity-100 opacity-60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Reflection Textarea with enlarged comfortable size */}
            <div className="relative group">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                placeholder="Pour your thoughts freely onto this page. What is unfolding in your mind and heart? Sol will meet your words with warmth and clarity..."
                className="w-full bg-transparent border-none outline-none text-xl sm:text-2xl lg:text-3xl placeholder:opacity-30 focus:ring-0 leading-relaxed font-journal resize-none px-0 min-h-[360px]"
                autoFocus
              />

              {/* Quick in-editor floating mic trigger */}
              <button
                type="button"
                onClick={toggleDictation}
                className={`absolute right-2 bottom-2 p-3.5 rounded-2xl border transition-all cursor-pointer shadow-lg flex items-center gap-2.5 ${
                  isRecording 
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : `${currentTheme.moodBtnInactive} hover:scale-105`
                }`}
                title={isRecording ? "Stop voice dictation" : "Speak to write (Voice-to-Text)"}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
                  {isRecording ? 'Stop Mic' : 'Voice Dictate'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Controls Bar (Tags, Word Count, Save & Reflect Button) */}
          <div className="mt-12 pt-8 border-t border-current/10 space-y-6">
            {/* Tag Selection Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowTagBar(!showTagBar)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${currentTheme.moodBtnInactive}`}
                >
                  <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Tags ({tags.length})</span>
                </button>

                {tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border ${currentTheme.tagBadge}`}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleToggleTag(t)}
                      className="hover:opacity-100 opacity-60 cursor-pointer ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="text-xs sm:text-sm opacity-70 flex items-center gap-3.5 font-medium">
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                <span className="opacity-40">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Draft ready
                </span>
              </div>
            </div>

            {/* Expandable Tag Picker */}
            {showTagBar && (
              <div className={`p-5 rounded-3xl border space-y-3.5 animate-in fade-in duration-150 ${isDark ? 'bg-[#131C31] border-[#1E293B]' : 'bg-white/90 border-current/10 shadow-xs'}`}>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAG_SUGGESTIONS.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? `${currentTheme.moodBtnActive}`
                            : `${currentTheme.tagBadge}`
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Add custom tag (e.g. Breakthrough, Family, Travel)..."
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus}`}
                  />
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer border ${currentTheme.buttonPrimary}`}
                  >
                    Add Tag
                  </button>
                </form>
              </div>
            )}

            {/* Save & Reflect Call to Action */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => {
                  if (isRecording) stopSpeechRecognition();
                  onBackToSanctuary();
                }}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              >
                Discard &amp; Return
              </button>

              <button
                type="button"
                onClick={handleSaveAndReflect}
                disabled={!content.trim() || isSubmitting}
                className={`flex items-center gap-2.5 px-8 py-4 sm:px-10 sm:py-4.5 rounded-2xl disabled:opacity-50 text-sm sm:text-base font-semibold shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${currentTheme.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving reflection...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Save Reflection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Helper / Sol Talking Side Drawer */}
        {isAiHelperOpen && (
          <aside className={`w-96 sm:w-[460px] border-l ${currentTheme.sidebarBorder} ${currentTheme.sidebarBg} flex flex-col justify-between shrink-0 shadow-2xl animate-in slide-in-from-right duration-200 z-10`}>
            {/* Drawer Header */}
            <div className="p-5 border-b border-current/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                    {companionName} Assistant
                  </h3>
                  <p className="text-xs opacity-70">Untangle thoughts &amp; converse in real-time</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiHelperOpen(false)}
                className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat / Thought Stream Messages */}
            <div ref={aiChatScrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 text-sm leading-relaxed">
              {solMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border ${
                    msg.sender === 'user'
                      ? `${currentTheme.buttonPrimary} ml-8 shadow-xs`
                      : `${currentTheme.cardAiBg} border-current/10 mr-6 font-journal text-base`
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 opacity-60`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isAiResponding && (
                <div className={`p-4 rounded-2xl border border-current/10 mr-8 flex items-center gap-2.5 ${currentTheme.cardAiBg}`}>
                  <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm font-medium">{companionName} is reflecting...</span>
                </div>
              )}
            </div>

            {/* Quick AI Prompts & Helper Buttons */}
            <div className="p-5 border-t border-current/10 space-y-3">
              <div className="text-xs font-bold uppercase opacity-60 tracking-wider">
                Quick Prompts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSendAiMessage("Can you ask me a gentle question to help me explore this further?")}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center gap-2 cursor-pointer ${currentTheme.moodBtnInactive}`}
                >
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">Deepen this</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendAiMessage("Help me find a silver lining or calming angle on what I'm feeling.")}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center gap-2 cursor-pointer ${currentTheme.moodBtnInactive}`}
                >
                  <Wand2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Calm angle</span>
                </button>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage(aiChatInput);
                }}
                className="flex gap-2 pt-1"
              >
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder={`Ask ${companionName} anything...`}
                  className={`flex-1 px-4 py-3 rounded-xl border text-xs sm:text-sm focus:outline-none ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus}`}
                />
                <button
                  type="submit"
                  disabled={!aiChatInput.trim() || isAiResponding}
                  className={`p-3 rounded-xl disabled:opacity-50 text-white transition-colors cursor-pointer ${currentTheme.buttonPrimary}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
