import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Tag, Plus, X, Sparkles, Image as ImageIcon, Camera, Trash2 } from 'lucide-react';
import { MoodType, ThemeMode } from '../types';
import { MOOD_CONFIGS, POPULAR_TAG_SUGGESTIONS } from '../data/initialData';
import { THEMES } from '../utils/themeConfig';

interface JournalInputProps {
  onSendEntry: (content: string, mood?: MoodType, tags?: string[], imageUrl?: string) => void;
  isSending: boolean;
  themeMode: ThemeMode;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  selectedTagFilter?: string | null;
  onOpenPromptModal?: () => void;
}

export const JournalInput: React.FC<JournalInputProps> = ({
  onSendEntry,
  isSending,
  themeMode,
  initialPrompt,
  onClearInitialPrompt,
  selectedTagFilter,
  onOpenPromptModal,
}) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagBar, setShowTagBar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseContentRef = useRef<string>('');

  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  // Apply initial prompt if supplied
  useEffect(() => {
    if (initialPrompt) {
      setContent((prev) => (prev ? `${prev}\n\n${initialPrompt} ` : `${initialPrompt} `));
      textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // If user is currently filtering by a tag, pre-populate it if empty
  useEffect(() => {
    if (selectedTagFilter && !tags.includes(selectedTagFilter)) {
      setTags((prev) => (prev.length === 0 ? [selectedTagFilter] : prev));
    }
  }, [selectedTagFilter]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 160)}px`;
    }
  }, [content]);

  // Setup Web Speech API for voice dictation without duplication
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Save initial text state so speech appends accurately without duplicating
      baseContentRef.current = content.trim();

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }

        const cleanTranscript = fullTranscript.trim();
        if (cleanTranscript) {
          const prefix = baseContentRef.current ? `${baseContentRef.current} ` : '';
          setContent(`${prefix}${cleanTranscript}`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event?.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('Photo exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so re-selecting same file works
    e.target.value = '';
  };

  // Handle Drag & Drop of image files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setAttachedImage(ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle Paste of images from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setAttachedImage(ev.target.result as string);
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleAddTag = (rawTag: string) => {
    const cleaned = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!content.trim() && !attachedImage) || isSending) return;
    onSendEntry(
      content.trim(),
      selectedMood,
      tags.length > 0 ? tags : undefined,
      attachedImage || undefined
    );
    setContent('');
    setSelectedMood(undefined);
    setTags([]);
    setTagInput('');
    setAttachedImage(null);
    setShowTagBar(false);
    if (onClearInitialPrompt) onClearInitialPrompt();
  };

  return (
    <div 
      id="journal-input-section"
      className="sticky bottom-0 z-20 w-full px-3 sm:px-6 pb-4 pt-1 pointer-events-none"
    >
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
        id="journal-photo-file-input"
      />

      <div className="max-w-3xl lg:max-w-4xl mx-auto pointer-events-auto space-y-2">
        {/* Floating Airy Mood Buttons */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {MOOD_CONFIGS.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  id={`mood-btn-${m.id}`}
                  type="button"
                  onClick={() => setSelectedMood(isSelected ? undefined : m.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap ${
                    isSelected
                      ? currentTheme.moodBtnActive
                      : currentTheme.moodBtnInactive
                  }`}
                >
                  <span className="text-xs">{m.emoji}</span>
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Topic badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="input-toggle-tags-btn"
              type="button"
              onClick={() => setShowTagBar(!showTagBar)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans transition-colors cursor-pointer shadow-xs backdrop-blur-md border ${
                showTagBar || tags.length > 0
                  ? currentTheme.moodBtnActive
                  : currentTheme.moodBtnInactive
              }`}
            >
              <Tag className="w-3 h-3 opacity-80" />
              <span>{tags.length > 0 ? `#${tags.join(', #')}` : 'Topic'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Topic tagging capsule */}
        {showTagBar && (
          <div className={`p-3 rounded-2xl border text-xs shadow-xl backdrop-blur-xl animate-in fade-in duration-150 ${currentTheme.tagBarBg} ${currentTheme.tagBarBorder}`}>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] opacity-70 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" />
                <span>Active topics:</span>
              </span>
              {tags.map((tag, tagIdx) => (
                <span
                  key={`input-tag-${tag}-${tagIdx}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-sans font-medium bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/40"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                id="tag-composer-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Topic (Enter)..."
                className={`px-2 py-0.5 text-xs rounded-lg border focus:outline-none focus:ring-1 ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchPlaceholder}`}
              />
              {tagInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className={`p-1 rounded-lg text-xs font-semibold cursor-pointer ${currentTheme.summaryBtn}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Tag Suggestions */}
            <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-current/10">
              <span className="text-[10px] uppercase tracking-wider mr-1 opacity-60">Suggestions:</span>
              {POPULAR_TAG_SUGGESTIONS.map((suggested, sIdx) => {
                const isSelected = tags.includes(suggested);
                return (
                  <button
                    key={`pop-sug-${suggested}-${sIdx}`}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveTag(suggested) : handleAddTag(suggested))}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-sans border transition-colors cursor-pointer ${
                      isSelected
                        ? currentTheme.moodBtnActive
                        : currentTheme.moodBtnInactive
                    }`}
                  >
                    #{suggested}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Input Capsule with Image Drop Support */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-[26px] sm:rounded-[30px] border shadow-2xl backdrop-blur-2xl transition-all duration-200 flex flex-col p-2 sm:p-2.5 ring-1 ring-black/5 ${
            currentTheme.composerInnerBg
          } ${
            isDraggingOver
              ? 'border-rose-400 ring-2 ring-rose-400/40'
              : currentTheme.composerInnerBorder
          }`}
        >
          {/* Photo Attachment Preview in Composer */}
          {attachedImage && (
            <div className="px-3 pt-2 pb-1.5 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="relative group/img rounded-xl overflow-hidden border border-current/20 shadow-md bg-stone-950 shrink-0">
                <img
                  src={attachedImage}
                  alt="Journal attachment"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  title="Remove photo"
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs space-y-0.5 min-w-0 opacity-90">
                <p className="font-medium flex items-center gap-1.5 text-rose-500">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo attached to entry</span>
                </p>
                <p className="text-[11px] opacity-70 truncate">
                  Will be saved into your diary entry
                </p>
              </div>
            </div>
          )}

          {/* Main Textarea */}
          <textarea
            id="journal-entry-textarea"
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isRecording
                ? "Listening quietly... speak your thoughts into the journal."
                : selectedMood
                ? `Message your companion with ${selectedMood} reflections...`
                : "Message your journal (type thoughts, drag & drop photos)..."
            }
            rows={1}
            disabled={isSending}
            className={`w-full bg-transparent px-3 pt-1 pb-1 font-journal text-[15px] sm:text-base leading-relaxed resize-none focus:outline-none ${currentTheme.composerInnerText} ${currentTheme.composerPlaceholder}`}
          />

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-1 px-1">
            {/* Left Icons: Prompts, Topic & Upload Photo */}
            <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              {/* Photo Upload Button */}
              <button
                id="journal-upload-photo-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo to Journal (or paste from clipboard)"
                className={`p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  attachedImage
                    ? 'text-rose-500 bg-rose-500/20'
                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[11px] font-sans font-medium hidden sm:inline">Photo</span>
              </button>

              {/* Inspiration Prompts */}
              {onOpenPromptModal && (
                <button
                  type="button"
                  onClick={onOpenPromptModal}
                  title="Inspiration Prompts"
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </button>
              )}

              {/* Topic Tagging */}
              <button
                type="button"
                onClick={() => setShowTagBar(!showTagBar)}
                title="Add Topic"
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>

            {/* Right Icons: Voice Mic Wave + Circular Send Button */}
            <div className="flex items-center gap-2">
              {/* Voice Dictation */}
              <button
                id="journal-mic-btn"
                type="button"
                onClick={toggleRecording}
                title={isRecording ? "Stop voice listening" : "Voice dictation"}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Circular Send Arrow Button */}
              <button
                id="journal-send-btn"
                type="button"
                onClick={handleSend}
                disabled={(!content.trim() && !attachedImage) || isSending}
                title="Send (Enter)"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md ${
                  (content.trim() || attachedImage) && !isSending
                    ? currentTheme.sendBtnActive
                    : currentTheme.sendBtnInactive + ' cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
