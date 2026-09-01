import React from 'react';
import { CUTE_AVATARS } from '../data/avatarsData';

interface AvatarDisplayProps {
  avatarUrl?: string;
  avatarId?: string;
  avatarEmoji?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isAi?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  avatarId,
  avatarEmoji,
  name = 'Friend',
  size = 'md',
  className = '',
  isAi = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-20 h-20 text-3xl',
  };

  const matchedCuteAvatar = avatarId ? CUTE_AVATARS.find((a) => a.id === avatarId) : null;

  // Custom photo upload (data URL or http URL)
  if (avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:'))) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden shrink-0 border border-stone-300/40 shadow-xs relative bg-stone-100 flex items-center justify-center ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails, hide image element
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Preset cute avatar
  if (matchedCuteAvatar) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full shrink-0 bg-gradient-to-br ${matchedCuteAvatar.bgGradient} border ${matchedCuteAvatar.borderColor} shadow-xs flex items-center justify-center font-emoji select-none transition-transform ${className}`}
        title={matchedCuteAvatar.name}
      >
        <span>{matchedCuteAvatar.emoji}</span>
      </div>
    );
  }

  // Explicit emoji passed
  if (avatarEmoji) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full shrink-0 bg-pink-100 border border-pink-300 text-pink-900 shadow-xs flex items-center justify-center select-none ${className}`}
      >
        <span>{avatarEmoji}</span>
      </div>
    );
  }

  // Default AI companion styling
  if (isAi) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full shrink-0 bg-gradient-to-br from-pink-100 to-rose-200 border border-pink-300 shadow-xs flex items-center justify-center select-none ${className}`}
      >
        <span>🌸</span>
      </div>
    );
  }

  // Default user initial fallback
  return (
    <div
      className={`${sizeMap[size]} rounded-full shrink-0 bg-gradient-to-br from-stone-700 to-stone-900 text-white font-semibold flex items-center justify-center shadow-xs select-none ${className}`}
    >
      <span>{name ? name.charAt(0).toUpperCase() : 'U'}</span>
    </div>
  );
};
