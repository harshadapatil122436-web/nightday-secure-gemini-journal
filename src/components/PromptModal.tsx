import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { GENTLE_PROMPTS } from '../data/initialData';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/themeConfig';
import { getAuthToken } from '../services/firestoreService';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  themeMode: ThemeMode;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  themeMode,
}) => {
  const [promptsList, setPromptsList] = useState(GENTLE_PROMPTS);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/journal/suggest-prompt', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.prompt) {
        setPromptsList((prev) => [data.prompt, ...prev.filter((p) => p !== data.prompt)]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="prompt-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="prompt-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${currentTheme.tagBadge}`}>
                <Lightbulb className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-lg font-semibold tracking-tight">
                Gentle Reflections
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-stone-500/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prompts list */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs opacity-70 font-sans mb-3 leading-relaxed">
              Choose a thought to guide your writing, or click to begin answering in your journal:
            </p>

            {promptsList.map((prompt, idx) => (
              <button
                key={`prompt-item-${idx}-${prompt.slice(0, 20)}`}
                type="button"
                onClick={() => {
                  onSelectPrompt(prompt);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between group cursor-pointer ${currentTheme.cardUserBg} ${currentTheme.cardUserBorder} hover:border-current/30 hover:scale-[1.01]`}
              >
                <span className="font-journal text-sm leading-relaxed pr-3 opacity-90 group-hover:opacity-100">
                  {prompt}
                </span>
                <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-6 py-3.5 border-t ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <button
              id="prompt-inspire-btn"
              type="button"
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-medium opacity-80 hover:opacity-100 transition-colors cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating new inquiry...' : 'Inspire with fresh prompt'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium opacity-70 hover:opacity-100 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
