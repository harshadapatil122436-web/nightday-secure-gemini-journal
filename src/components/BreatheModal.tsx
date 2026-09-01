import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { ThemeMode } from '../types';
import { THEMES } from '../utils/themeConfig';

interface BreatheModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
}

export const BreatheModal: React.FC<BreatheModalProps> = ({
  isOpen,
  onClose,
  themeMode,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cycleCount, setCycleCount] = useState(1);

  const currentTheme = THEMES[themeMode] || THEMES['midnight-black'];
  const isDark = themeMode === 'midnight-black';

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            setCycleCount((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale smoothly and deeply through your nose (4s)...';
      case 'hold':
        return 'Hold gently with relaxed awareness (4s)...';
      case 'exhale':
        return 'Exhale completely and let tension dissolve (4s)...';
    }
  };

  const getScaleClass = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125 bg-emerald-500/25 border-emerald-400 text-emerald-300';
      case 'hold':
        return 'scale-125 bg-teal-500/25 border-teal-400 animate-pulse text-teal-300';
      case 'exhale':
        return 'scale-90 bg-indigo-500/20 border-indigo-400/60 text-indigo-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center ${
        isDark 
          ? 'bg-[#0F172A] border-[#1E293B] text-slate-100' 
          : `${currentTheme.dropdownBg} border-current/10 text-current`
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
          <Wind className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase">Mindful Breathing</span>
        </div>
        <h2 className="text-xl font-serif font-semibold mb-1">4-4-4 Equal Rhythm Breath</h2>
        <p className="text-xs opacity-70 mb-8 max-w-xs">
          Equal 4-second intervals for inhale, hold, and exhale to balance energy and center your focus.
        </p>

        {/* Breathing Animation Circle */}
        <div className="relative w-56 h-56 flex items-center justify-center my-4">
          <div
            className={`w-44 h-44 rounded-full border-2 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center ${getScaleClass()}`}
          >
            <span className="text-4xl font-bold mb-1 font-mono">{timeLeft}s</span>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {phase.toUpperCase()}
            </span>
          </div>
          <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-spin-slow pointer-events-none" />
        </div>

        {/* Dynamic Instructional Prompt */}
        <p className="text-sm font-medium my-4 h-6 transition-all duration-300 opacity-90">
          {getPhaseText()}
        </p>

        <div className="text-xs opacity-60 mb-6">
          Completed {cycleCount} {cycleCount === 1 ? 'cycle' : 'cycles'}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all cursor-pointer ${currentTheme.buttonPrimary}`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => {
              setPhase('inhale');
              setTimeLeft(4);
              setCycleCount(1);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-medium transition-colors cursor-pointer border border-current/10"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
