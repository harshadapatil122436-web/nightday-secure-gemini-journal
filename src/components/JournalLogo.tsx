import React from 'react';

interface JournalLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isDark?: boolean;
}

export const JournalLogo: React.FC<JournalLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isDark = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textMap = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector Emblem: Quill Feather Pen Writing in Open Book with Flourishes */}
      <div
        className={`${sizeMap[size]} relative shrink-0 rounded-xl overflow-hidden shadow-xs flex items-center justify-center bg-teal-950/5 dark:bg-teal-900/20 border border-teal-600/20`}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Feather Quill Pen - Top Left curving down to Book Spine */}
          {/* Main Quill Feather Body */}
          <path
            d="M 68 32 C 58 55, 60 85, 96 108 L 98 124 L 103 124 L 105 108 C 103 82, 102 62, 98 50 C 92 38, 80 32, 68 32 Z"
            fill="#065F63"
          />
          {/* Quill Left Vanes & Silhouette */}
          <path
            d="M 68 32 C 56 60, 58 92, 98 124 C 94 106, 88 88, 76 68 C 72 61, 70 50, 68 32 Z"
            fill="#087075"
          />
          {/* Quill Spine / Shaft Line */}
          <path
            d="M 70 34 Q 86 78 100 124"
            stroke="#12959B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Quill Pen Nib Tip */}
          <path
            d="M 98 124 L 100 134 L 103 124 Z"
            fill="#044E52"
          />

          {/* Open Book - Outer Spine & Base Contour */}
          <path
            d="M 100 148 L 52 128 L 52 92 L 60 92 L 60 122 L 100 140 L 140 122 L 140 92 L 148 92 L 148 128 Z"
            fill="#087075"
          />

          {/* Left Book Page (Open) */}
          <path
            d="M 100 140 L 62 122 L 62 94 L 100 114 Z"
            fill="#14B8A6"
            fillOpacity="0.15"
            stroke="#087075"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Right Book Page (Open) with text lines */}
          <path
            d="M 100 140 L 138 122 L 138 94 C 122 96, 110 102, 100 114 Z"
            fill="#14B8A6"
            fillOpacity="0.15"
            stroke="#087075"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Cyan Page Edge Accent Lines (Inner Pages) */}
          <path
            d="M 100 137 L 136 120 L 136 96 C 122 98, 111 103, 100 113"
            stroke="#2DD4BF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Page text strokes on right page */}
          <path
            d="M 110 106 L 126 99"
            stroke="#2DD4BF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 112 113 L 128 106"
            stroke="#2DD4BF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Symmetrical Ornamental Flourish Wings Beneath Book */}
          {/* Left Wing Flourish */}
          <path
            d="M 100 144 C 84 152, 60 156, 42 144 C 36 138, 40 126, 48 132 C 40 130, 36 142, 44 148 C 62 162, 84 158, 100 144 Z"
            fill="#065F63"
          />
          {/* Right Wing Flourish */}
          <path
            d="M 100 144 C 116 152, 140 156, 158 144 C 164 138, 160 126, 152 132 C 160 130, 164 142, 156 148 C 138 162, 116 158, 100 144 Z"
            fill="#065F63"
          />
          {/* Bottom Center Scroll Swirl Hook */}
          <path
            d="M 100 144 C 98 155, 96 166, 88 168 C 84 168, 86 162, 90 162 C 94 160, 96 154, 98 144 Z"
            fill="#087075"
          />
        </svg>
      </div>

      {/* Brand Script / Title */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className={`${textMap[size]} font-serif font-bold tracking-tight leading-none ${
              isDark ? 'text-teal-50' : 'text-stone-900 dark:text-stone-100'
            }`}
          >
            NightDay
          </span>
          <span
            className="text-[10px] tracking-widest uppercase font-sans font-semibold text-teal-700 dark:text-teal-400 leading-tight mt-0.5"
          >
            Journal
          </span>
        </div>
      )}
    </div>
  );
};
