import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, Tag, Plus, Flame, Smile, Check, Mic, MicOff } from 'lucide-react';
import { MoodType, ThemeMode, UserProfile } from '../types';
import { MOOD_CONFIGS, POPULAR_TAG_SUGGESTIONS } from '../data/initialData';

interface NewReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, mood?: MoodType, tags?: string[]) => Promise<void>;
  isSending: boolean;
  themeMode: ThemeMode;
  user: UserProfile;
}

export const NewReflectionModal: React.FC<NewReflectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSending,
  themeMode,
  user,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('peaceful');
  const [tags, setTags] = useState<string[]>(['Mindful']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const speechRecognitionRef = useRef<any>(null);

  const startVoiceDictation = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
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
          setContent((prev) => {
            const separator = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            return prev + separator + finalTranscripts;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  }, []);

  const stopVoiceDictation = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    speechRecognitionRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  const toggleVoiceDictation = () => {
    if (isRecording) {
      stopVoiceDictation();
    } else {
      startVoiceDictation();
    }
  };

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;
    if (isRecording) stopVoiceDictation();
    await onSubmit(title.trim(), content.trim(), selectedMood, tags);
    setTitle('');
    setContent('');
    onClose();
  };

  const companionName = user.companionName || 'Sol';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-9 text-slate-100 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            if (isRecording) stopVoiceDictation();
            onClose();
          }}
          disabled={isSending}
          className="absolute top-6 right-6 p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-indigo-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Mindful Entry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Record a New Reflection</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Express what is truly on your mind. {companionName} will offer a warm, personalized insight.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
              Reflection Title <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Twilight stillness and letting go..."
              className="w-full px-4 py-3 rounded-2xl bg-[#131C31] border border-[#1E293B] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-sans"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
              Current Energy &amp; Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_CONFIGS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-[#131C31] hover:bg-[#1A2642] border-[#1E293B] text-slate-300'
                    }`}
                  >
                    <span className="text-base">{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Textarea with Mic Dictation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                Your Reflection
              </label>
              
              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-indigo-600/15 hover:bg-indigo-600/25 border-indigo-500/30 text-indigo-300'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            {isRecording && interimTranscript && (
              <div className="p-2.5 mb-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs italic">
                "{interimTranscript}"
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="What thoughts, sensations, or experiences are present for you right now?"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#131C31] border border-[#1E293B] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm sm:text-base font-journal leading-relaxed resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_TAG_SUGGESTIONS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[#131C31] border-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#131C31] border border-[#1E293B] text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-200 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopVoiceDictation();
                onClose();
              }}
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!content.trim() || isSending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving reflection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Save Reflection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
