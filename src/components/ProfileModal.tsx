import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Check, Sparkles, User, Heart } from 'lucide-react';
import { UserProfile, ThemeMode, JournalEntry } from '../types';
import { CUTE_AVATARS, COMPANION_NAME_SUGGESTIONS } from '../data/avatarsData';
import { AvatarDisplay } from './AvatarDisplay';
import { THEMES } from '../utils/themeConfig';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  themeMode: ThemeMode;
  onSelectTheme?: (mode: ThemeMode) => void;
  entries?: JournalEntry[];
  initialTab?: 'profile' | 'companion';
  onOpenSecurityModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  themeMode,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companion'>(
    initialTab === 'companion' ? 'companion' : 'profile'
  );
  const [name, setName] = useState(user.name);
  const [avatarId, setAvatarId] = useState<string | undefined>(user.avatarId);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);

  const [companionName, setCompanionName] = useState(user.companionName || 'Luna');
  const [companionAvatarId, setCompanionAvatarId] = useState<string | undefined>(
    user.companionAvatarId || 'mint-leaf'
  );
  const [companionAvatarUrl, setCompanionAvatarUrl] = useState<string | undefined>(
    user.companionAvatarUrl
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const companionFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'companion' ? 'companion' : 'profile');
      setName(user.name);
      setAvatarId(user.avatarId);
      setAvatarUrl(user.avatarUrl);
      setCompanionName(user.companionName || 'Luna');
      setCompanionAvatarId(user.companionAvatarId || 'mint-leaf');
      setCompanionAvatarUrl(user.companionAvatarUrl);
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;
  const currentTheme = THEMES[themeMode] || THEMES['teal-quill'];

  // Handle custom photo upload for user
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        setAvatarId(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom photo upload for companion
  const handleCompanionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanionAvatarUrl(reader.result as string);
        setCompanionAvatarId(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: name.trim() || 'Friend',
      avatarId,
      avatarUrl,
      companionName: companionName.trim() || 'Luna',
      companionAvatarId,
      companionAvatarUrl,
      themePreference: themeMode,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="profile-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${currentTheme.dropdownBg} ${currentTheme.dropdownBorder}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  Profile &amp; Companion
                </h2>
                <p className="text-[11px] opacity-60">Personalize your name and companion avatar</p>
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

          {/* Clean, high-visibility 2-tab segmented control */}
          <div className="px-6 pt-3 pb-2 border-b border-current/10">
            <div className="grid grid-cols-2 p-1 gap-1.5 rounded-2xl bg-stone-500/10 border border-current/10">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 ring-1 ring-white/20'
                    : 'opacity-70 hover:opacity-100 hover:bg-stone-500/10'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Your Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('companion')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'companion'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 ring-1 ring-white/20'
                    : 'opacity-70 hover:opacity-100 hover:bg-stone-500/10'
                }`}
              >
                <Heart className="w-3.5 h-3.5 shrink-0 text-rose-300" />
                <span className="truncate">Companion Avatar</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'profile' && (
              <>
                {/* Current Avatar Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border bg-stone-500/5 border-current/10">
                  <AvatarDisplay
                    avatarUrl={avatarUrl}
                    avatarId={avatarId}
                    name={name}
                    size="xl"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold font-serif">{name || 'Friend'}</p>
                    <p className="text-xs opacity-60">This photo appears beside your reflections</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border bg-stone-500/10 hover:bg-stone-500/20 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    What should NightDay call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or preferred nickname"
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus}`}
                  />
                </div>

                {/* Cute Avatar Selection Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      Or pick a cute profile avatar
                    </label>
                    <span className="text-[11px] opacity-50">Animals, fruits & flora</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {CUTE_AVATARS.map((avatar, aIdx) => {
                      const isSelected = avatarId === avatar.id && !avatarUrl;
                      return (
                        <button
                          key={`profile-avatar-${avatar.id}-${aIdx}`}
                          type="button"
                          onClick={() => {
                            setAvatarId(avatar.id);
                            setAvatarUrl(undefined);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'ring-2 ring-teal-600 bg-teal-500/10 border-teal-600 scale-105 shadow-xs'
                              : 'border-current/10 hover:border-current/30 hover:bg-stone-500/5'
                          }`}
                        >
                          <span className="text-2xl">{avatar.emoji}</span>
                          <span className="text-[10px] font-medium opacity-80 mt-1 truncate max-w-full">
                            {avatar.name.split(' ')[0]}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'companion' && (
              <>
                {/* Companion Avatar Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border bg-stone-500/5 border-current/10">
                  <AvatarDisplay
                    avatarUrl={companionAvatarUrl}
                    avatarId={companionAvatarId}
                    name={companionName}
                    size="xl"
                    isAi
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold font-serif">{companionName}</p>
                    <p className="text-xs opacity-60">This avatar responds with mindful reflections</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => companionFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border bg-stone-500/10 hover:bg-stone-500/20 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Custom Photo</span>
                      </button>
                      <input
                        ref={companionFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCompanionPhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Companion Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    What would you like to call your companion?
                  </label>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    placeholder="e.g. Luna, Mochi, Aria, Willow..."
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 ${currentTheme.searchBg} ${currentTheme.searchBorder} ${currentTheme.searchFocus}`}
                  />

                  {/* Quick companion name suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    <span className="text-[10px] opacity-60 self-center">Suggestions:</span>
                    {COMPANION_NAME_SUGGESTIONS.slice(0, 6).map((suggested, sIdx) => (
                      <button
                        key={`comp-sug-${suggested}-${sIdx}`}
                        type="button"
                        onClick={() => setCompanionName(suggested)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          companionName === suggested
                            ? 'bg-teal-500/20 border-teal-500 font-semibold text-teal-900 dark:text-teal-200'
                            : 'border-current/15 hover:border-current/30'
                        }`}
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Companion Cute Avatar Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      Pick a cute avatar for {companionName}
                    </label>
                    <span className="text-[11px] opacity-50">Select a gentle presence</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {CUTE_AVATARS.map((avatar, cIdx) => {
                      const isSelected = companionAvatarId === avatar.id && !companionAvatarUrl;
                      return (
                        <button
                          key={`companion-avatar-${avatar.id}-${cIdx}`}
                          type="button"
                          onClick={() => {
                            setCompanionAvatarId(avatar.id);
                            setCompanionAvatarUrl(undefined);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'ring-2 ring-teal-600 bg-teal-500/10 border-teal-600 scale-105 shadow-xs'
                              : 'border-current/10 hover:border-current/30 hover:bg-stone-500/5'
                          }`}
                        >
                          <span className="text-2xl">{avatar.emoji}</span>
                          <span className="text-[10px] font-medium opacity-80 mt-1 truncate max-w-full">
                            {avatar.name.split(' ')[0]}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-2.5 px-6 py-4 border-t ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="profile-modal-save-btn"
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs ${currentTheme.sendBtnActive}`}
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

