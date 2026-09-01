export type ThemeMode = 'midnight-black' | 'teal-quill' | 'clean-white' | 'peaceful-sage';

export type AuthorType = 'user' | 'ai';

export type MoodType = 
  | 'peaceful'
  | 'reflective'
  | 'joyful'
  | 'centered'
  | 'inspired'
  | 'energetic'
  | 'melancholy'
  | 'overwhelmed'
  | 'restful'
  | 'happy' 
  | 'content' 
  | 'stressed' 
  | 'excited' 
  | 'sad' 
  | 'grateful' 
  | 'calm';

export interface MoodConfig {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
  badgeBg: string;
  textColor: string;
}

export interface JournalEntry {
  id: string;
  title?: string;
  author: AuthorType;
  content: string;
  timestamp: string; // ISO date string
  mood?: MoodType;
  tags?: string[];
  imageUrl?: string; // Base64 or URL of attached photo
  photos?: string[];
  favorite?: boolean;
  replyToId?: string;
  isStreaming?: boolean;
  wordCount?: number;
}

export interface CuteAvatar {
  id: string;
  name: string;
  emoji: string;
  category: 'cute-animals' | 'nature-flora' | 'sweet-fruits' | 'calm-cozy';
  bgGradient: string;
  borderColor: string;
  svgColor: string;
}

export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatarUrl?: string; // Data URL or preset avatar ID
  avatarEmoji?: string;
  avatarId?: string;
  isGuest: boolean;
  themePreference?: ThemeMode;
  companionName?: string; // Name user gave to AI Companion (e.g., "Luna", "Mochi", "Aria")
  companionAvatarId?: string; // Preset avatar ID or custom URL
  companionAvatarUrl?: string;
  companionAvatarEmoji?: string;
  streakCount?: number;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: 'pop-hits' | 'rain' | 'nature' | 'lofi' | 'piano' | 'meditation' | 'cozy' | 'acoustic';
  duration: string;
  soundType: string;
  coverEmoji: string;
  coverGradient: string;
  description: string;
  recommendedForMoods: MoodType[];
  bpm?: number;
  tags?: string[];
}

export interface WeeklySummaryData {
  id: string;
  generatedAt: string;
  dateRange: string;
  entryCount: number;
  overallTone: string;
  narrativeSummary: string;
  recurringThemes: string[];
  emotionalHighlights: {
    title: string;
    description: string;
  }[];
  caringAffirmation: string;
  gentleInquiry: string;
}

export interface SecurityAuditReport {
  timestamp: string;
  userId: string;
  userEmail: string;
  status: 'OPTIMAL' | 'SECURED' | 'ATTENTION';
  checks: {
    id: string;
    title: string;
    description: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    category: 'AUTH' | 'STORAGE' | 'SECRETS' | 'TRANSPORT' | 'AI_ISOLATION';
    details: string;
    evidence: string;
  }[];
  secretManager: {
    configured: boolean;
    source: 'SECRET_MANAGER' | 'SECURE_ENV' | 'FALLBACK';
    secretPath: string;
    clientExposed: false;
  };
  firestoreIsolation: {
    enforcedRule: string;
    userPath: string;
    crossUserAccessAllowed: false;
    isolatedSubcollections: string[];
  };
  authBoundary: {
    provider: string;
    tokenVerification: 'GOOGLE_IDENTITY_PLATFORM' | 'LOCAL';
    tokenAgeSeconds: number;
    emailVerified: boolean;
  };
}

export interface SecurityLogEvent {
  id: string;
  timestamp: string;
  action: 'SIGN_IN' | 'TOKEN_REFRESH' | 'ENTRY_ENCRYPTED' | 'AI_SESSION_ISOLATED' | 'AUDIT_DIAGNOSTIC';
  ipOrHost?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'BLOCKED';
  details: string;
}

