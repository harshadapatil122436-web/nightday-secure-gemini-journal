import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  Sparkles, 
  Trash2, 
  Calendar, 
  Clock, 
  Share2, 
  Download, 
  Edit3, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  Check, 
  Tag as TagIcon,
  ChevronDown,
  BookOpen,
  FileText
} from 'lucide-react';
import { JournalEntry, MoodType, ThemeMode, UserProfile } from '../types';
import { MOOD_CONFIGS } from '../data/initialData';
import { 
  generateSingleReflectionDiaryHtml, 
  generateSingleReflectionDiaryText,
  downloadFile 
} from '../utils/diaryExporter';

interface ReflectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null;
  replies: JournalEntry[];
  themeMode: ThemeMode;
  user: UserProfile;
  onToggleFavorite: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry?: (updated: JournalEntry) => void;
  onSendReply: (replyText: string, replyToId: string) => Promise<void>;
  isSendingReply: boolean;
}

// Theme token mapper for the reflection modal
const getModalThemeClasses = (theme: ThemeMode) => {
  switch (theme) {
    case 'teal-quill':
      return {
        container: 'bg-[#F2FAF7] border-[#A6DCD1] text-[#073F3A]',
        headerBorder: 'border-[#A6DCD1]',
        actionBtn: 'bg-white hover:bg-[#E3F4EF] border-[#A6DCD1] text-[#073F3A] hover:text-[#052C28] shadow-2xs',
        inputBg: 'bg-white border-[#A6DCD1] text-[#073F3A] placeholder:text-[#4A857E] focus:border-[#0D746B]',
        textPrimary: 'text-[#073F3A]',
        textSecondary: 'text-[#205C55]',
        textMuted: 'text-[#4A857E]',
        tagBg: 'bg-[#DDF2EC] border-[#A8DDD3] text-[#074742]',
        companionCard: 'border-[#9FD3CB] bg-gradient-to-br from-[#E3F4EF] via-[#EEF8F5] to-[#E3F4EF] shadow-md text-[#073F3A]',
        companionHeaderBorder: 'border-[#9FD3CB]/60',
        companionIconBg: 'bg-gradient-to-tr from-[#0D746B] to-[#0A5650] text-white shadow-teal-700/20',
        companionTitle: 'text-[#073F3A]',
        companionSub: 'text-[#0D746B]',
        companionListenBtn: 'bg-[#D0EDE6] border-[#9FD3CB] text-[#074742] hover:bg-[#C2E7DD]',
        companionUnpackBtn: 'bg-[#0D746B] hover:bg-[#0A5D56] border-[#0A5D56] text-white shadow-teal-800/20',
        companionBodyText: 'text-[#12423D]',
        companionInquiryText: 'text-[#08554E] italic font-medium',
        companionSectionHeader: 'text-[#0D746B]',
        userMsgBubble: 'bg-white border-[#A6DCD1] text-[#073F3A] shadow-xs',
        companionMsgBubble: 'bg-[#DDF2EC] border-[#A8DDD3] text-[#074742]',
        replyInput: 'bg-white border-[#A6DCD1] text-[#073F3A] placeholder:text-[#4A857E] focus:border-[#0D746B]',
        replySendBtn: 'bg-[#0D746B] hover:bg-[#0A5D56] text-white shadow-teal-800/20',
        cancelBtn: 'bg-[#E3F4EF] hover:bg-[#D5EFE7] text-[#073F3A] border-[#A6DCD1]',
        saveBtn: 'bg-[#0D746B] hover:bg-[#0A5D56] text-white',
        toast: 'bg-[#073F3A] border-[#0D746B] text-white',
        dropdownBg: 'bg-white border-[#A6DCD1] text-[#073F3A]',
        dropdownHover: 'hover:bg-[#E3F4EF]',
      };
    case 'peaceful-sage':
      return {
        container: 'bg-[#EFF6EE] border-[#AED2AC] text-[#16361A]',
        headerBorder: 'border-[#AED2AC]',
        actionBtn: 'bg-white hover:bg-[#E1EFE0] border-[#AED2AC] text-[#16361A] hover:text-[#0E2611] shadow-2xs',
        inputBg: 'bg-white border-[#AED2AC] text-[#16361A] placeholder:text-[#527756] focus:border-[#2D5A32]',
        textPrimary: 'text-[#16361A]',
        textSecondary: 'text-[#2D5331]',
        textMuted: 'text-[#527756]',
        tagBg: 'bg-[#DCEEE8] border-[#AED2AC] text-[#173A1B]',
        companionCard: 'border-[#AED2AC] bg-gradient-to-br from-[#E1EFE0] via-[#EAF5E8] to-[#E1EFE0] shadow-md text-[#16361A]',
        companionHeaderBorder: 'border-[#AED2AC]/60',
        companionIconBg: 'bg-gradient-to-tr from-[#2D5A32] to-[#1F4223] text-white shadow-emerald-800/20',
        companionTitle: 'text-[#16361A]',
        companionSub: 'text-[#2D5A32]',
        companionListenBtn: 'bg-[#D0E7CE] border-[#A6CCA4] text-[#173A1B] hover:bg-[#C2DFC0]',
        companionUnpackBtn: 'bg-[#2D5A32] hover:bg-[#204424] border-[#204424] text-white shadow-emerald-900/20',
        companionBodyText: 'text-[#1C3E20]',
        companionInquiryText: 'text-[#18491D] italic font-medium',
        companionSectionHeader: 'text-[#2D5A32]',
        userMsgBubble: 'bg-white border-[#AED2AC] text-[#16361A] shadow-xs',
        companionMsgBubble: 'bg-[#DCEFEA] border-[#AED2AC] text-[#16361A]',
        replyInput: 'bg-white border-[#AED2AC] text-[#16361A] placeholder:text-[#527756] focus:border-[#2D5A32]',
        replySendBtn: 'bg-[#2D5A32] hover:bg-[#204424] text-white shadow-emerald-900/20',
        cancelBtn: 'bg-[#E1EFE0] hover:bg-[#D4E8D3] text-[#16361A] border-[#AED2AC]',
        saveBtn: 'bg-[#2D5A32] hover:bg-[#204424] text-white',
        toast: 'bg-[#16361A] border-[#2D5A32] text-white',
        dropdownBg: 'bg-white border-[#AED2AC] text-[#16361A]',
        dropdownHover: 'hover:bg-[#E1EFE0]',
      };
    case 'clean-white':
      return {
        container: 'bg-[#F4F7FB] border-[#B8CCE0] text-[#0B2035]',
        headerBorder: 'border-[#B8CCE0]',
        actionBtn: 'bg-white hover:bg-[#E6EFF7] border-[#B8CCE0] text-[#0B2035] hover:text-[#061524] shadow-2xs',
        inputBg: 'bg-white border-[#B8CCE0] text-[#0B2035] placeholder:text-[#567494] focus:border-[#1E4E79]',
        textPrimary: 'text-[#0B2035]',
        textSecondary: 'text-[#1D3B5C]',
        textMuted: 'text-[#567494]',
        tagBg: 'bg-[#DCE8F5] border-[#B6CAE0] text-[#0B2035]',
        companionCard: 'border-[#B8CCE0] bg-gradient-to-br from-[#E6EFF7] via-[#EFF5FA] to-[#E6EFF7] shadow-md text-[#0B2035]',
        companionHeaderBorder: 'border-[#B8CCE0]/60',
        companionIconBg: 'bg-gradient-to-tr from-[#1E4E79] to-[#123657] text-white shadow-sky-900/20',
        companionTitle: 'text-[#0B2035]',
        companionSub: 'text-[#1E4E79]',
        companionListenBtn: 'bg-[#D2E3F2] border-[#ADC3D9] text-[#0B2035] hover:bg-[#C3D9EC]',
        companionUnpackBtn: 'bg-[#1E4E79] hover:bg-[#153B5C] border-[#153B5C] text-white shadow-sky-950/20',
        companionBodyText: 'text-[#122A42]',
        companionInquiryText: 'text-[#0E3559] italic font-medium',
        companionSectionHeader: 'text-[#1E4E79]',
        userMsgBubble: 'bg-white border-[#B8CCE0] text-[#0B2035] shadow-xs',
        companionMsgBubble: 'bg-[#DCE8F5] border-[#B6CAE0] text-[#0B2035]',
        replyInput: 'bg-white border-[#B8CCE0] text-[#0B2035] placeholder:text-[#567494] focus:border-[#1E4E79]',
        replySendBtn: 'bg-[#1E4E79] hover:bg-[#153B5C] text-white shadow-sky-950/20',
        cancelBtn: 'bg-[#E6EFF7] hover:bg-[#D9E6F2] text-[#0B2035] border-[#B8CCE0]',
        saveBtn: 'bg-[#1E4E79] hover:bg-[#153B5C] text-white',
        toast: 'bg-[#0B2035] border-[#1E4E79] text-white',
        dropdownBg: 'bg-white border-[#B8CCE0] text-[#0B2035]',
        dropdownHover: 'hover:bg-[#E6EFF7]',
      };
    case 'midnight-black':
    default:
      return {
        container: 'bg-[#0B1120] border-[#1E293B] text-slate-100',
        headerBorder: 'border-[#1E293B]',
        actionBtn: 'bg-[#131C31] hover:bg-[#1A253E] border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-600',
        inputBg: 'bg-[#131C31] border-[#1E293B] text-slate-100 placeholder:text-slate-500 focus:border-teal-500',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        tagBg: 'bg-[#131C31] border-[#1E293B] text-slate-300',
        companionCard: 'border-indigo-500/25 bg-gradient-to-br from-indigo-950/40 via-[#0F172A] to-[#0F172A] shadow-xl text-slate-100',
        companionHeaderBorder: 'border-indigo-500/15',
        companionIconBg: 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-600/30',
        companionTitle: 'text-slate-100',
        companionSub: 'text-indigo-300/80',
        companionListenBtn: 'bg-indigo-900/40 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/60 hover:text-white',
        companionUnpackBtn: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40 text-white shadow-indigo-600/30',
        companionBodyText: 'text-slate-200',
        companionInquiryText: 'text-indigo-100/90 italic font-medium',
        companionSectionHeader: 'text-indigo-300',
        userMsgBubble: 'bg-[#1E293B]/80 border-[#334155] text-slate-100',
        companionMsgBubble: 'bg-indigo-950/60 border-indigo-500/30 text-indigo-100',
        replyInput: 'bg-[#0B1120] border-indigo-500/30 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400',
        replySendBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
        cancelBtn: 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10',
        saveBtn: 'bg-teal-600 hover:bg-teal-500 text-white',
        toast: 'bg-slate-900/95 border-slate-700 text-slate-100',
        dropdownBg: 'bg-[#131C31] border-[#1E293B] text-slate-200',
        dropdownHover: 'hover:bg-[#1E293B]',
      };
  }
};

export const ReflectionDetailModal: React.FC<ReflectionDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  replies,
  themeMode,
  user,
  onToggleFavorite,
  onDeleteEntry,
  onUpdateEntry,
  onSendReply,
  isSendingReply,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<MoodType | undefined>(undefined);
  const [editTagsInput, setEditTagsInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio / TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Unpack / Dialogue expansion toggle
  const [isUnpackOpen, setIsUnpackOpen] = useState(false);
  const [replyInput, setReplyInput] = useState('');

  // Delete confirmation
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Download menu dropdown state
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close download menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync edit state with selected entry
  useEffect(() => {
    if (entry) {
      setEditTitle(entry.title || '');
      setEditContent(entry.content || '');
      setEditMood(entry.mood);
      setEditTagsInput(entry.tags ? entry.tags.join(', ') : '');
      setIsEditing(false);
      setIsSpeaking(false);
      setIsUnpackOpen(false);
      setIsConfirmingDelete(false);
      setIsDownloadMenuOpen(false);
    }
  }, [entry]);

  // Clean up speech synthesis on close/unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen || !entry) return null;

  const t = getModalThemeClasses(themeMode);

  const moodConfig = MOOD_CONFIGS.find((m) => m.id === (isEditing ? editMood : entry.mood)) || {
    id: 'peaceful',
    label: 'Peaceful',
    emoji: '🌿',
    color: '',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
    textColor: 'text-emerald-600 dark:text-emerald-300',
  };

  const companionName = user.companionName || 'Sol';

  const dateObj = new Date(entry.timestamp);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate word count
  const wordCount = entry.wordCount || entry.content.trim().split(/\s+/).filter(Boolean).length;

  // Find primary AI companion response
  const companionReply = replies.find((r) => r.author === 'ai');

  // Secondary dialogue messages
  const conversationReplies = replies;

  // Show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 1. Share reflection functionality
  const handleShare = async () => {
    const shareText = `${entry.title ? `${entry.title}\n\n` : ''}${entry.content}\n\n— NightDay Reflection (${formattedDate})`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: entry.title || 'My Reflection',
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        triggerToast('✨ Reflection copied to clipboard');
      } catch {
        triggerToast('Unable to copy to clipboard');
      }
    }
  };

  // 2. Download reflection as Real Keepsake Diary Page (.html)
  const handleDownloadDiaryHtml = () => {
    const htmlContent = generateSingleReflectionDiaryHtml(entry, user);
    const sanitizedTitle = (entry.title || 'diary-reflection')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 35);
    const dateStr = new Date(entry.timestamp).toISOString().slice(0, 10);
    downloadFile(htmlContent, `${sanitizedTitle}-${dateStr}.html`, 'text/html;charset=utf-8;');
    setIsDownloadMenuOpen(false);
    triggerToast('📖 Downloaded as realistic keepsake diary (open to view or print to PDF)');
  };

  // Download reflection as Classic Diary Letter (.txt)
  const handleDownloadDiaryText = () => {
    const textContent = generateSingleReflectionDiaryText(entry, user);
    const sanitizedTitle = (entry.title || 'diary-reflection')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 35);
    const dateStr = new Date(entry.timestamp).toISOString().slice(0, 10);
    downloadFile(textContent, `${sanitizedTitle}-${dateStr}.txt`, 'text/plain;charset=utf-8;');
    setIsDownloadMenuOpen(false);
    triggerToast('📜 Downloaded as formatted diary text file');
  };

  // Download reflection as Markdown (.md)
  const handleDownloadMarkdown = () => {
    const tagsHeader = entry.tags && entry.tags.length > 0 ? `Tags: ${entry.tags.map((t) => `#${t}`).join(' ')}\n\n` : '';
    const markdownContent = `# ${entry.title || 'Personal Reflection'}\n*Date: ${formattedDate} | Mood: ${moodConfig.label}*\n\n${entry.content}\n\n${tagsHeader}`;
    const sanitizedTitle = (entry.title || 'reflection')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .slice(0, 35);
    const dateStr = new Date(entry.timestamp).toISOString().slice(0, 10);
    downloadFile(markdownContent, `${sanitizedTitle}-${dateStr}.md`, 'text/markdown;charset=utf-8;');
    setIsDownloadMenuOpen(false);
    triggerToast('📥 Downloaded as Markdown file');
  };

  // 3. Audio Listen / Speech Synthesis
  const handleToggleListen = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      triggerToast('Speech synthesis not supported in this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = companionReply
      ? `${companionName}'s reflection. ${companionReply.content}`
      : `${entry.title ? `${entry.title}. ` : ''}${entry.content}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 4. Save edits
  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    const parsedTags = editTagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const updated: JournalEntry = {
      ...entry,
      title: editTitle.trim(),
      content: editContent.trim(),
      mood: editMood,
      tags: parsedTags,
      wordCount: editContent.trim().split(/\s+/).filter(Boolean).length,
    };

    if (onUpdateEntry) {
      onUpdateEntry(updated);
    }
    setIsEditing(false);
    triggerToast('✨ Reflection updated successfully');
  };

  // 5. Dialogue reply submit
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || isSendingReply) return;
    await onSendReply(replyInput.trim(), entry.id);
    setReplyInput('');
  };

  // Structured companion text parser
  const renderFormattedCompanionContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className={`space-y-3 text-sm sm:text-base leading-relaxed font-journal ${t.companionBodyText}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Check if this line is a section header
          const isSectionHeader =
            trimmed === 'Empathic Witnessing' ||
            trimmed === 'Gentle Perspective' ||
            trimmed === 'Inward Inquiry' ||
            trimmed === 'Somatic Micro-Practice' ||
            (/^[A-Z][a-zA-Z\s]{3,28}:?$/.test(trimmed) && !trimmed.endsWith('.'));

          if (isSectionHeader) {
            return (
              <div key={idx} className={`pt-2 text-xs font-semibold uppercase tracking-wider font-sans ${t.companionSectionHeader}`}>
                {trimmed.replace(/:$/, '')}
              </div>
            );
          }

          // Check if it's an inquiry line
          const isInquiry = trimmed.startsWith('*') || trimmed.startsWith('“') || trimmed.startsWith('"') || trimmed.includes('?');

          return (
            <p key={idx} className={isInquiry ? t.companionInquiryText : ''}>
              {trimmed.replace(/^[*_]+|[*_]+$/g, '')}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Centered Modal Container */}
      <div 
        id="reflection-detail-modal"
        className={`relative w-full max-w-2xl lg:max-w-3xl border rounded-[28px] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col scrollbar-thin transition-colors duration-200 ${t.container}`}
      >
        
        {/* Top Header Bar */}
        <div className={`flex items-center justify-between pb-4 mb-3 border-b gap-3 ${t.headerBorder}`}>
          {/* Mood Badge Pill */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${moodConfig.badgeBg}`}>
              <span>{moodConfig.emoji}</span>
              <span>{moodConfig.label}</span>
            </span>
            {entry.tags && entry.tags.length > 0 && (
              <span className={`text-xs font-medium hidden sm:inline-block ${t.textMuted}`}>
                · #{entry.tags[0]}
              </span>
            )}
          </div>

          {/* Top Right Action Icons Group */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 1. Favorite / Bookmark button */}
            <button
              id="reflection-modal-favorite-btn"
              type="button"
              onClick={() => {
                onToggleFavorite(entry.id);
                triggerToast(!entry.favorite ? '⭐ Added to favorites' : 'Removed from favorites');
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                entry.favorite
                  ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30'
                  : t.actionBtn
              }`}
              title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${entry.favorite ? 'fill-white text-white' : ''}`} />
            </button>

            {/* 2. Share button */}
            <button
              id="reflection-modal-share-btn"
              type="button"
              onClick={handleShare}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${t.actionBtn}`}
              title="Share reflection"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* 3. Download button with Quick Real Diary default & Format Menu */}
            <div className="relative" ref={downloadMenuRef}>
              <div className="flex items-center">
                <button
                  id="reflection-modal-download-btn"
                  type="button"
                  onClick={handleDownloadDiaryHtml}
                  className={`p-2 rounded-l-xl border transition-colors cursor-pointer flex items-center gap-1 ${t.actionBtn}`}
                  title="Download as Real Keepsake Diary Page (.html)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  id="reflection-modal-download-menu-toggle"
                  type="button"
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  className={`p-2 -ml-[1px] rounded-r-xl border transition-colors cursor-pointer ${t.actionBtn}`}
                  title="Choose download format"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Download Options Dropdown */}
              {isDownloadMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150 ${t.dropdownBg}`}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-60">
                    Download Reflection
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadDiaryHtml}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${t.dropdownHover}`}
                  >
                    <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-semibold">Real Keepsake Diary Page (.html)</div>
                      <div className="text-[11px] opacity-70">Lined stationery paper look with 1-click print to PDF</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDiaryText}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${t.dropdownHover}`}
                  >
                    <FileText className="w-4 h-4 opacity-70 shrink-0" />
                    <div>
                      <div className="font-semibold">Classic Diary Letter (.txt)</div>
                      <div className="text-[11px] opacity-70">Formatted plain-text diary entry</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdown}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${t.dropdownHover}`}
                  >
                    <Edit3 className="w-4 h-4 opacity-70 shrink-0" />
                    <div>
                      <div className="font-semibold">Markdown Document (.md)</div>
                      <div className="text-[11px] opacity-70">Raw markdown with headers & tags</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Edit button */}
            <button
              id="reflection-modal-edit-btn"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-teal-500/20 border-teal-500 text-teal-600 dark:text-teal-300'
                  : t.actionBtn
              }`}
              title="Edit reflection"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* 5. Delete button with inline confirmation */}
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-950/90 border border-rose-500/50 text-xs text-rose-100 animate-in fade-in zoom-in-95 duration-150">
                <span className="px-2 font-medium">Delete reflection?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    onDeleteEntry(entry.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="reflection-modal-delete-btn"
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer hover:text-rose-500 hover:border-rose-500/40 ${t.actionBtn}`}
                title="Delete reflection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* 6. Close button */}
            <button
              id="reflection-modal-close-btn"
              type="button"
              onClick={() => {
                if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ml-1 ${t.actionBtn}`}
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Mode View */}
        {isEditing ? (
          <div className="space-y-4 my-2">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Give your reflection a title..."
                className={`w-full px-4 py-2.5 rounded-xl border font-serif text-lg focus:outline-none ${t.inputBg}`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                Reflection Content
              </label>
              <textarea
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your thoughts freely..."
                className={`w-full px-4 py-3 rounded-xl border font-journal text-sm sm:text-base leading-relaxed focus:outline-none resize-none ${t.inputBg}`}
              />
            </div>

            {/* Mood selector in edit mode */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_CONFIGS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEditMood(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      editMood === m.id
                        ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                        : `${t.actionBtn} opacity-70`
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags input in edit mode */}
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                placeholder="gratitude, morning, mindful"
                className={`w-full px-4 py-2 rounded-xl border text-sm focus:outline-none ${t.inputBg}`}
              />
            </div>

            {/* Edit actions bar */}
            <div className="flex justify-end gap-2 pt-3 border-t border-current/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${t.cancelBtn}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer ${t.saveBtn}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          /* Reader Mode View */
          <div className="space-y-4 my-1">
            {/* Meta Row: Date, Time & Word Count */}
            <div className={`flex flex-wrap items-center gap-3 text-xs ${t.textMuted}`}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </div>
              <span>·</span>
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </div>

            {/* Reflection Title */}
            {entry.title && (
              <h2 className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight leading-snug ${t.textPrimary}`}>
                {entry.title}
              </h2>
            )}

            {/* Attached Photo (if present) */}
            {entry.imageUrl && (
              <div className="my-3 overflow-hidden rounded-2xl border border-current/15 shadow-md">
                <img
                  src={entry.imageUrl}
                  alt={entry.title || 'Reflection memory'}
                  className="w-full max-h-80 object-cover"
                />
              </div>
            )}

            {/* Reflection Body Text */}
            <div className={`text-sm sm:text-base leading-relaxed font-journal whitespace-pre-wrap ${t.textSecondary}`}>
              {entry.content}
            </div>

            {/* Tags Badges */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${t.tagBg}`}
                  >
                    <TagIcon className="w-3 h-3 opacity-70" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Companion Reflection Card */}
        <div className={`mt-4 pt-4 border-t ${t.headerBorder}`}>
          <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${t.companionCard}`}>
            
            {/* Header of Companion Card */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b ${t.companionHeaderBorder}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.companionIconBg}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm sm:text-base font-bold flex items-center gap-1.5 ${t.companionTitle}`}>
                    <span>{companionName}'s Reflection</span>
                  </h4>
                  <p className={`text-[11px] sm:text-xs font-medium ${t.companionSub}`}>
                    Thoughtful &amp; Empathetic Companion Perspective
                  </p>
                </div>
              </div>

              {/* Action Buttons: Listen & Unpack with Sol */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleToggleListen}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-violet-600 border-violet-400 text-white animate-pulse'
                      : t.companionListenBtn
                  }`}
                  title={isSpeaking ? 'Stop listening' : 'Listen to reflection aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsUnpackOpen(!isUnpackOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${t.companionUnpackBtn}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Unpack with {companionName}</span>
                </button>
              </div>
            </div>

            {/* Companion Content Body */}
            {companionReply ? (
              renderFormattedCompanionContent(companionReply.content)
            ) : (
              <div className={`py-2 text-xs sm:text-sm leading-relaxed font-journal ${t.textMuted}`}>
                {companionName} is keeping safe watch over your reflection. You can click <strong>Unpack with {companionName}</strong> above to explore your thoughts together.
              </div>
            )}

            {/* Expandable Interactive Unpack / Dialogue Thread */}
            {isUnpackOpen && (
              <div className={`pt-4 mt-4 border-t space-y-3 animate-in fade-in duration-200 ${t.companionHeaderBorder}`}>
                <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${t.companionSub}`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Interactive Dialogue with {companionName}</span>
                </div>

                {/* Conversation messages */}
                {conversationReplies.length > 0 && (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {conversationReplies.map((reply, idx) => (
                      <div
                        key={reply.id || `reply-${idx}`}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                          reply.author === 'user'
                            ? `${t.userMsgBubble} ml-5`
                            : `${t.companionMsgBubble} mr-5`
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold">
                          {reply.author === 'user' ? (
                            <span className={t.textSecondary}>{user.name || 'You'}</span>
                          ) : (
                            <span className={`${t.companionSub} flex items-center gap-1`}>
                              <Sparkles className="w-3 h-3" />
                              <span>{companionName}</span>
                            </span>
                          )}
                        </div>
                        <p className="font-journal whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form Input */}
                <form onSubmit={handleReplySubmit} className="pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder={`Ask ${companionName} anything or share more thoughts...`}
                      className={`flex-1 px-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none ${t.replyInput}`}
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim() || isSendingReply}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${t.replySendBtn}`}
                    >
                      {isSendingReply ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Temporary floating toast notification inside modal */}
        {toastMessage && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${t.toast}`}>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
