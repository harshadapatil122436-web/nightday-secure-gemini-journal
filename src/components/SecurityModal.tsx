import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Database,
  CheckCircle2,
  Server,
  Fingerprint,
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';
import { THEMES } from '../utils/themeConfig';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  themeMode: ThemeMode;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  user,
  themeMode,
}) => {
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  if (!isOpen) return null;

  const securityPillars = [
    {
      id: 'pillar-auth',
      title: 'User Authentication Boundary',
      badge: 'Protected Auth',
      icon: <Fingerprint className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      description:
        'All sessions require signed authentication tokens issued by Google Identity. The server validates every reflection interaction.',
      status: 'Enforced',
    },
    {
      id: 'pillar-isolation',
      title: 'Zero Cross-User Leakage',
      badge: 'Strict User Boundary',
      icon: <Database className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      description:
        'Your diary entries and reflections remain strictly isolated to your account. No other user can access your private records.',
      status: 'Active Isolation',
    },
    {
      id: 'pillar-secrets',
      title: 'Zero Hardcoded Secrets',
      badge: 'Google Secret Manager',
      icon: <KeyRound className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
      description:
        'API keys and model credentials are protected on the server side via Secret Manager. Zero secrets are exposed in browser code.',
      status: 'Protected',
    },
    {
      id: 'pillar-ai',
      title: 'Private AI Companion Context',
      badge: 'Isolated Context',
      icon: <Server className="w-5 h-5 text-teal-500" />,
      bg: 'bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300',
      description:
        'AI insights and companion conversations are generated with isolated context, keeping your reflections personal and safe.',
      status: 'Protected',
    },
  ];

  return (
    <AnimatePresence>
      <div
        id="security-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs font-sans"
        onClick={onClose}
      >
        <motion.div
          id="security-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base sm:text-lg font-bold tracking-tight">
                    Security &amp; Privacy Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] opacity-65">
                  End-to-end data isolation and privacy protection overview
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-stone-500/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                  Privacy &amp; Security Protections Active
                </p>
                <p className="opacity-80 leading-relaxed text-[11px] text-emerald-900 dark:text-emerald-200">
                  Your journal entries and reflections are stored under private, authenticated boundaries with zero credential leakage.
                </p>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {securityPillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="p-4 rounded-2xl border border-current/10 bg-stone-500/5 hover:border-current/25 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-stone-500/10">{pillar.icon}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pillar.bg}`}>
                        {pillar.status}
                      </span>
                    </div>
                    <h3 className="font-bold font-serif text-sm pt-1">{pillar.title}</h3>
                    <p className="text-[11px] opacity-70 leading-relaxed">{pillar.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] opacity-60">
                    <span>Protection:</span>
                    <span className="font-medium">{pillar.badge}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* User Session Isolation Note */}
            <div className="p-3.5 rounded-2xl border border-current/10 bg-stone-500/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="opacity-60 block text-[10px] uppercase font-semibold">Protected User Session</span>
                  <span className="font-medium text-[11px]">{user.name || 'Personal Account'}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Encrypted &amp; Isolated
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-t ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-1.5 text-[11px] opacity-60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Isolated Architecture</span>
            </div>
            <button
              id="security-modal-close-btn"
              type="button"
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs ${currentTheme.sendBtnActive}`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
