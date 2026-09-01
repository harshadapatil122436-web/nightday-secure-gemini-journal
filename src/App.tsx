import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, JournalEntry, MoodType, WeeklySummaryData, ThemeMode, MusicTrack } from './types';
import { AMBIENT_TRACKS } from './data/musicData';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { JournalFeed } from './components/JournalFeed';
import { JournalInput } from './components/JournalInput';
import { SanctuaryDashboard } from './components/SanctuaryDashboard';
import { ReflectionComposerView } from './components/ReflectionComposerView';
import { BreatheModal } from './components/BreatheModal';
import { NewReflectionModal } from './components/NewReflectionModal';
import { ReflectionDetailModal } from './components/ReflectionDetailModal';
import { SidebarDrawer, getLocalDayKey } from './components/SidebarDrawer';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { PromptModal } from './components/PromptModal';
import { MusicPlayerSidebar } from './components/MusicPlayerSidebar';
import { ProfileModal } from './components/ProfileModal';
import { FloatingMusicWidget } from './components/FloatingMusicWidget';
import { DiaryExportModal } from './components/DiaryExportModal';
import { SecurityModal } from './components/SecurityModal';
import { FirebaseErrorBanner } from './components/FirebaseErrorBanner';
import { THEMES } from './utils/themeConfig';
import { ambientAudio } from './utils/ambientAudio';
import { auth, onAuthStateChanged, signOut, isFirebaseConfigured } from './firebase';
import {
  saveJournalEntry,
  saveEntryToFirestore,
  saveChatMessage,
  saveWeeklySummaryToFirestore,
  loadEntriesFromFirestore,
  deleteEntryFromFirestore,
  saveUserProfileToFirestore,
  subscribeToJournalEntries,
  subscribeToWeeklySummaries,
} from './services/firestoreService';

const STORAGE_KEYS = {
  THEME: 'nightday_theme_v6',
};

export default function App() {
  // Check if Firebase is properly configured
  if (!isFirebaseConfigured) {
    return <FirebaseErrorBanner />;
  }

  // Firebase Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Journal entries state (Loaded from Firestore for this user)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);

  // View state: 'sanctuary' (default dashboard), 'write' (full reflection composer matching screenshot), 'companion' (Sol chat), 'feed' (chronological feed)
  const [activeView, setActiveView] = useState<'sanctuary' | 'write' | 'companion' | 'feed'>('sanctuary');

  // Default Theme: Midnight Sanctuary (Indigo / Slate palette)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (saved && THEMES[saved]) {
        return saved;
      }
      return 'midnight-black';
    } catch {
      return 'midnight-black';
    }
  });

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI reflection loading state
  const [isReflecting, setIsReflecting] = useState(false);

  // Modals & Drawers state
  const [isNewReflectionModalOpen, setIsNewReflectionModalOpen] = useState(false);
  const [isBreatheModalOpen, setIsBreatheModalOpen] = useState(false);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<JournalEntry | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [weeklySummaryData, setWeeklySummaryData] = useState<WeeklySummaryData | null>(null);
  const [isWeeklySummaryLoading, setIsWeeklySummaryLoading] = useState(false);

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [composerPrompt, setComposerPrompt] = useState<string | undefined>(undefined);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const [isDiaryExportOpen, setIsDiaryExportOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Music Player & Quick Circle state
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(AMBIENT_TRACKS[0]);
  const [isMusicSidebarOpen, setIsMusicSidebarOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'companion'>('profile');

  // Subscribe to Firebase Auth State Changes & Real-time Firestore Listeners
  useEffect(() => {
    let unsubscribeEntries: (() => void) | null = null;
    let unsubscribeSummaries: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.emailVerified) {
        const activeUser: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Friend',
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || undefined,
          avatarId: fbUser.photoURL ? undefined : 'panda',
          companionName: 'Luna',
          companionAvatarId: 'mint-leaf',
          isGuest: false,
          themePreference: 'teal-quill',
          createdAt: new Date().toISOString(),
        };
        setUser(activeUser);
        saveUserProfileToFirestore(activeUser).catch((err) =>
          console.warn('[Firestore] Profile save notice:', err?.message)
        );

        // 1. Initial Load & Real-time onSnapshot listener across sessions
        setIsEntriesLoading(true);
        try {
          // Pre-fetch immediately for instant render
          const initialEntries = await loadEntriesFromFirestore(fbUser.uid);
          if (initialEntries.length > 0) {
            setEntries(initialEntries);
          }
        } catch (err) {
          console.warn('[Firestore] Initial fetch notice:', err);
        } finally {
          setIsEntriesLoading(false);
        }

        // 2. Attach persistent real-time onSnapshot listener
        unsubscribeEntries = subscribeToJournalEntries(
          fbUser.uid,
          (liveEntries) => {
            setEntries((prev) => {
              // Preserve any active streaming in-flight entry
              const streamingEntry = prev.find((e) => e.isStreaming);
              if (streamingEntry && !liveEntries.some((e) => e.id === streamingEntry.id)) {
                return [...liveEntries, streamingEntry];
              }
              return liveEntries;
            });
            setIsEntriesLoading(false);
          },
          (err) => console.warn('[Firestore onSnapshot] Entries listener notice:', err?.message)
        );

        // 3. Attach real-time onSnapshot for weekly summaries
        unsubscribeSummaries = subscribeToWeeklySummaries(fbUser.uid, (summaries) => {
          if (summaries && summaries.length > 0) {
            setWeeklySummaryData(summaries[0]);
          }
        });
      } else {
        // State Clean-up: Clear all local React states when the user signs out
        setUser(null);
        setEntries([]);
        setWeeklySummaryData(null);
        setSearchQuery('');
        setSelectedTagFilter(null);
        setComposerPrompt(undefined);
        setIsReflecting(false);
        if (unsubscribeEntries) unsubscribeEntries();
        if (unsubscribeSummaries) unsubscribeSummaries();
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEntries) unsubscribeEntries();
      if (unsubscribeSummaries) unsubscribeSummaries();
    };
  }, []);

  // Poll music playing status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMusicPlaying(ambientAudio.getIsPlaying());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Music Play/Pause Handlers
  const handleTogglePlay = (track?: MusicTrack) => {
    const target = track || currentTrack;
    if (isMusicPlaying && target.id === currentTrack.id) {
      ambientAudio.stop();
      setIsMusicPlaying(false);
    } else {
      setCurrentTrack(target);
      ambientAudio.playSound(target.soundType, target.title);
      setIsMusicPlaying(true);
    }
  };

  const handleStopMusic = () => {
    ambientAudio.stop();
    setIsMusicPlaying(false);
  };

  const handleNextTrack = () => {
    const currentIndex = AMBIENT_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % AMBIENT_TRACKS.length;
    const nextTrack = AMBIENT_TRACKS[nextIndex];
    setCurrentTrack(nextTrack);
    if (isMusicPlaying) {
      ambientAudio.playSound(nextTrack.soundType, nextTrack.title);
    }
  };

  const handleTrackChange = (track: MusicTrack, playImmediately = true) => {
    setCurrentTrack(track);
    if (playImmediately) {
      ambientAudio.playSound(track.soundType, track.title);
      setIsMusicPlaying(true);
    }
  };

  // Filter entries based on date selection, search query, and selected tag
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Date-session filter
      if (selectedDateKey) {
        const entryDayKey = getLocalDayKey(entry.timestamp);
        if (entryDayKey !== selectedDateKey) {
          return false;
        }
      }

      if (selectedTagFilter) {
        if (!entry.tags || !entry.tags.includes(selectedTagFilter)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contentMatch = entry.content.toLowerCase().includes(q);
        const moodMatch = entry.mood ? entry.mood.toLowerCase().includes(q) : false;
        const tagMatch = entry.tags ? entry.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!contentMatch && !moodMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [entries, selectedDateKey, selectedTagFilter, searchQuery]);

  // Derive human-readable date label for active session filter banner
  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return null;
    const sampleEntry = entries.find((e) => getLocalDayKey(e.timestamp) === selectedDateKey);
    const dateObj = sampleEntry ? new Date(sampleEntry.timestamp) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateObj);
    target.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today’s Reflections';
    if (diff === 1) return 'Yesterday’s Reflections';
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateKey, entries]);

  // Handler for starting a new chat / new reflection session
  const handleNewChat = () => {
    const todayKey = getLocalDayKey(new Date().toISOString());
    setSelectedDateKey(todayKey);
    setComposerPrompt(undefined);
    setSearchQuery('');
    setSelectedTagFilter(null);
  };

  // Latest user mood for music recommendations
  const latestUserMood = useMemo(() => {
    const latestWithMood = [...entries].reverse().find((e) => e.author === 'user' && e.mood);
    return latestWithMood?.mood;
  }, [entries]);

  // Detail modal replies: retrieve the dialogue chain for the selected reflection
  const detailReplies = useMemo(() => {
    if (!selectedDetailEntry) return [];
    return entries.filter(
      (e) => e.replyToId === selectedDetailEntry.id || e.id === selectedDetailEntry.id
    );
  }, [entries, selectedDetailEntry]);

  // Handle User Login
  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    if (newUser.themePreference && THEMES[newUser.themePreference]) {
      setThemeMode(newUser.themePreference);
      localStorage.setItem(STORAGE_KEYS.THEME, newUser.themePreference);
    }
    // Sync profile to Firestore
    saveUserProfileToFirestore(newUser).catch(console.error);
  };

  // Handle User Logout
  const handleLogout = async () => {
    ambientAudio.stop();
    setIsMusicPlaying(false);
    try {
      await signOut(auth!);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    setUser(null);
    setEntries([]);
  };

  // Update User Profile & Avatars
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser).catch(console.error);
  };

  // Select Theme Mode directly
  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(STORAGE_KEYS.THEME, mode);
    if (user) {
      const updated = { ...user, themePreference: mode };
      setUser(updated);
      saveUserProfileToFirestore(updated).catch(console.error);
    }
  };

  // Delete an entry from Firestore & state
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const entryToDelete = entries.find((e) => e.id === entryId);
    const replyEntry = entries.find((e) => e.replyToId === entryId);

    // Optimistic UI update: remove entry and any companion replies from state immediately
    setEntries((prev) => prev.filter((e) => e.id !== entryId && e.replyToId !== entryId));

    // Clear detail modal if the deleted entry was open
    if (selectedDetailEntry?.id === entryId) {
      setSelectedDetailEntry(null);
    }

    setSavedToast('Reflection removed from sanctuary');
    setTimeout(() => {
      setSavedToast(null);
    }, 2500);

    try {
      await deleteEntryFromFirestore(user.id, entryId, replyEntry?.id);
    } catch (err) {
      console.error('Failed to delete from Firestore:', err);
    }
  };

  // Bookmark / favorite toggle
  const handleToggleFavorite = async (entryId: string) => {
    if (!user) return;
    const target = entries.find((e) => e.id === entryId) || (selectedDetailEntry?.id === entryId ? selectedDetailEntry : null);
    if (!target) return;

    const newFav = !target.favorite;
    const updatedEntry: JournalEntry = { ...target, favorite: newFav };

    // 1. Update entries state immediately
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entryId);
      if (exists) {
        return prev.map((e) => (e.id === entryId ? updatedEntry : e));
      }
      return [updatedEntry, ...prev];
    });

    // 2. Update selectedDetailEntry state so modal star icon immediately reflects the change
    setSelectedDetailEntry((prev) => {
      if (prev && prev.id === entryId) {
        return updatedEntry;
      }
      return prev;
    });

    setSavedToast(newFav ? '⭐ Added to Favorites' : 'Removed from Favorites');
    setTimeout(() => setSavedToast(null), 2500);

    try {
      await saveJournalEntry(user.id, updatedEntry);
    } catch (err) {
      console.error('Failed to update favorite in Firestore:', err);
    }
  };

  // Update reflection entry (title, content, mood, tags)
  const handleUpdateEntry = async (updatedEntry: JournalEntry) => {
    if (!user) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    if (selectedDetailEntry && selectedDetailEntry.id === updatedEntry.id) {
      setSelectedDetailEntry(updatedEntry);
    }
    setSavedToast('✨ Reflection updated');
    setTimeout(() => setSavedToast(null), 3000);
    try {
      await saveJournalEntry(user.id, updatedEntry);
    } catch (err) {
      console.error('Failed to update entry in Firestore:', err);
    }
  };

  // Handle sending a new journal reflection with token verification, real-time streaming & Firestore persistence
  const handleSendEntry = async (content: string, mood?: MoodType, tags?: string[], imageUrl?: string) => {
    if (!user) return;

    const userEntryId = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newUserEntry: JournalEntry = {
      id: userEntryId,
      author: 'user',
      content,
      timestamp: new Date().toISOString(),
      mood,
      tags,
      imageUrl,
    };

    // 1. Instantly update UI and persist user entry + chat history to Firestore
    setEntries((prev) => [...prev, newUserEntry]);
    saveJournalEntry(user.id, newUserEntry).catch((err) =>
      console.error('Failed to save user entry to Firestore:', err)
    );
    saveChatMessage(user.id, {
      id: userEntryId,
      author: 'user',
      content,
      mood,
      timestamp: newUserEntry.timestamp,
    }).catch(console.error);

    // 2. Activate immediate Thinking state
    setIsReflecting(true);

    try {
      // Obtain secure Firebase ID Token
      const currentFbUser = auth?.currentUser;
      const idToken = currentFbUser ? await currentFbUser.getIdToken() : '';

      // Build context of previous reflections for continuity
      const historyContext = entries.slice(-4).map((e) => ({
        author: e.author,
        content: e.content,
        mood: e.mood,
      }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const requestPayload = {
        entryId: userEntryId,
        timestamp: newUserEntry.timestamp,
        entry: content,
        mood,
        tags,
        history: historyContext,
        userName: user.name || 'Friend',
        companionName: user.companionName || 'Luna',
      };

      // Try streaming endpoint first for lowest latency
      let streamSucceeded = false;
      let aiReplyId = `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      let streamedText = '';

      try {
        const streamRes = await fetch('/api/journal/reflect/stream', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
        });

        if (streamRes.ok && streamRes.body) {
          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const block of lines) {
              if (!block.trim()) continue;
              const eventMatch = block.match(/event:\s*(.+)/);
              const dataMatch = block.match(/data:\s*(.+)/s);
              const eventType = eventMatch ? eventMatch[1].trim() : 'message';
              let eventData: any = {};
              if (dataMatch) {
                try {
                  eventData = JSON.parse(dataMatch[1].trim());
                } catch {
                  eventData = {};
                }
              }

              if (eventType === 'start') {
                if (eventData.aiReplyId) aiReplyId = eventData.aiReplyId;
                // Add placeholder streaming entry and hide the outer spinner
                setIsReflecting(false);
                setEntries((prev) => {
                  if (prev.some((e) => e.id === aiReplyId)) return prev;
                  return [
                    ...prev,
                    {
                      id: aiReplyId,
                      author: 'ai',
                      content: '',
                      timestamp: new Date().toISOString(),
                      replyToId: userEntryId,
                      isStreaming: true,
                    },
                  ];
                });
              } else if (eventType === 'chunk') {
                streamedText += eventData.text || '';
                setIsReflecting(false);
                setEntries((prev) =>
                  prev.map((e) =>
                    e.id === aiReplyId
                      ? { ...e, content: streamedText, isStreaming: true }
                      : e
                  )
                );
              } else if (eventType === 'done') {
                streamSucceeded = true;
                const finalReply = eventData.reply || streamedText;
                setEntries((prev) =>
                  prev.map((e) =>
                    e.id === aiReplyId
                      ? { ...e, content: finalReply, isStreaming: false }
                      : e
                  )
                );
                // Dual sync finished entry & chat message to Firestore
                saveJournalEntry(user.id, {
                  id: aiReplyId,
                  author: 'ai',
                  content: finalReply,
                  timestamp: new Date().toISOString(),
                  replyToId: userEntryId,
                }).catch(console.error);
                saveChatMessage(user.id, {
                  id: aiReplyId,
                  author: 'ai',
                  content: finalReply,
                  timestamp: new Date().toISOString(),
                  replyToId: userEntryId,
                }).catch(console.error);
              } else if (eventType === 'error') {
                console.warn('SSE stream sent error event:', eventData);
              }
            }
          }
        }
      } catch (streamErr) {
        console.warn('Streaming failed or was interrupted, falling back to standard reflection:', streamErr);
      }

      // If streaming didn't succeed, fallback to standard fast reflection endpoint
      if (!streamSucceeded) {
        const res = await fetch('/api/journal/reflect', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();
        const aiReplyContent =
          data.reflection ||
          data.reply ||
          "I hear you and I am holding space for what you've shared. Take a deep breath, and let yourself rest with kindness.";

        const finalId = data.aiReplyId || aiReplyId;

        const aiEntry: JournalEntry = {
          id: finalId,
          author: 'ai',
          content: aiReplyContent,
          timestamp: new Date().toISOString(),
          replyToId: userEntryId,
          isStreaming: false,
        };

        setEntries((prev) => {
          const existingIdx = prev.findIndex((e) => e.id === finalId);
          if (existingIdx >= 0) {
            return prev.map((e) => (e.id === finalId ? aiEntry : e));
          }
          return [...prev, aiEntry];
        });

        saveJournalEntry(user.id, aiEntry).catch((err) =>
          console.error('Failed to save companion reflection to Firestore:', err)
        );
        saveChatMessage(user.id, {
          id: finalId,
          author: 'ai',
          content: aiReplyContent,
          timestamp: aiEntry.timestamp,
          replyToId: userEntryId,
        }).catch(console.error);
      }
    } catch (err) {
      console.error('Reflection error:', err);
      // Compassionate fallback
      const companion = user?.companionName || 'Luna';
      const fallbackAiId = `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const fallbackAiEntry: JournalEntry = {
        id: fallbackAiId,
        author: 'ai',
        content: `Thank you for sharing your thoughts with me today. Even when words feel heavy, putting them onto the page is an act of gentle courage. Rest peacefully knowing your reflections are safe here with ${companion}.`,
        timestamp: new Date().toISOString(),
        replyToId: userEntryId,
      };
      setEntries((prev) => [...prev, fallbackAiEntry]);
      saveJournalEntry(user.id, fallbackAiEntry).catch((err) =>
        console.error('Failed to save fallback reflection to Firestore:', err)
      );
      saveChatMessage(user.id, {
        id: fallbackAiId,
        author: 'ai',
        content: fallbackAiEntry.content,
        timestamp: fallbackAiEntry.timestamp,
        replyToId: userEntryId,
      }).catch(console.error);
    } finally {
      setIsReflecting(false);
    }
  };

  // Handle creating a new reflection from the Modal or Dashboard
  const handleCreateNewReflection = async (title: string, content: string, mood?: MoodType, tags?: string[]) => {
    if (!user) return;

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const userEntryId = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newUserEntry: JournalEntry = {
      id: userEntryId,
      author: 'user',
      title: title || undefined,
      wordCount: words,
      content,
      timestamp: new Date().toISOString(),
      mood,
      tags,
    };

    // 1. Immediately save user entry to state & Firestore
    setEntries((prev) => [newUserEntry, ...prev]);
    saveJournalEntry(user.id, newUserEntry).catch((err) =>
      console.error('Failed to save user entry to Firestore:', err)
    );
    saveChatMessage(user.id, {
      id: userEntryId,
      author: 'user',
      content,
      mood,
      timestamp: newUserEntry.timestamp,
    }).catch(console.error);

    // 2. Return to Sanctuary view without auto-opening any dialogue modal
    setSelectedDetailEntry(null);
    setSavedToast('✨ Reflection saved to your sanctuary');
    setTimeout(() => {
      setSavedToast(null);
    }, 3500);

    if (activeView === 'write') {
      setActiveView('sanctuary');
    }

    // 3. Request companion synthesis in background without blocking saving
    setIsReflecting(true);

    try {
      const currentFbUser = auth?.currentUser;
      const idToken = currentFbUser ? await currentFbUser.getIdToken() : '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const requestPayload = {
        entryId: userEntryId,
        timestamp: newUserEntry.timestamp,
        entry: `${title ? title + ': ' : ''}${content}`,
        mood,
        tags,
        history: entries.slice(-3).map((e) => ({
          author: e.author,
          content: e.content,
          mood: e.mood,
        })),
        userName: user.name || 'Friend',
        companionName: user.companionName || 'Sol',
      };

      const res = await fetch('/api/journal/reflect', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const aiReplyContent = data.reflection || data.reply || "I'm listening and holding this space for you.";
        const aiEntryId = data.aiReplyId || `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const aiEntry: JournalEntry = {
          id: aiEntryId,
          author: 'ai',
          content: aiReplyContent,
          timestamp: new Date().toISOString(),
          replyToId: userEntryId,
        };

        setEntries((prev) => [...prev, aiEntry]);
        saveJournalEntry(user.id, aiEntry).catch(console.error);
      }
    } catch (err) {
      console.warn('Reflection notice:', err);
    } finally {
      setIsReflecting(false);
    }
  };

  // Handle sending a reply in the ReflectionDetailModal or chat
  const handleSendReply = async (replyText: string, replyToId: string) => {
    if (!user || !replyText.trim()) return;

    setIsSendingReply(true);
    const replyUserEntryId = `reply-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userReplyEntry: JournalEntry = {
      id: replyUserEntryId,
      author: 'user',
      content: replyText,
      timestamp: new Date().toISOString(),
      replyToId,
    };

    setEntries((prev) => [...prev, userReplyEntry]);
    saveJournalEntry(user.id, userReplyEntry).catch(console.error);

    try {
      const currentFbUser = auth?.currentUser;
      const idToken = currentFbUser ? await currentFbUser.getIdToken() : '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/journal/reflect', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entryId: replyUserEntryId,
          timestamp: userReplyEntry.timestamp,
          entry: replyText,
          history: entries.filter((e) => e.id === replyToId || e.replyToId === replyToId).map((e) => ({
            author: e.author,
            content: e.content,
          })),
          userName: user.name || 'Friend',
          companionName: user.companionName || 'Sol',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiReplyContent = data.reflection || data.reply || "I'm right here with you.";
        const aiReplyId = data.aiReplyId || `reply-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const aiReplyEntry: JournalEntry = {
          id: aiReplyId,
          author: 'ai',
          content: aiReplyContent,
          timestamp: new Date().toISOString(),
          replyToId,
        };

        setEntries((prev) => [...prev, aiReplyEntry]);
        saveJournalEntry(user.id, aiReplyEntry).catch(console.error);
      }
    } catch (err) {
      console.warn('Reply notice:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Fetch weekly summary with token verification and Firestore persistence
  const fetchWeeklySummary = async () => {
    if (!user) return;
    setIsWeeklySummaryLoading(true);
    try {
      const currentFbUser = auth?.currentUser;
      const idToken = currentFbUser ? await currentFbUser.getIdToken() : '';

      const userEntries = entries
        .filter((e) => e.author === 'user')
        .map((e) => ({
          content: e.content,
          timestamp: e.timestamp,
          mood: e.mood,
          tags: e.tags,
        }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/journal/summarize-week', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          entries: userEntries,
          userName: user.name || 'Friend',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setWeeklySummaryData(data);
      if (user.id) {
        saveWeeklySummaryToFirestore(user.id, data).catch(console.error);
      }
    } catch (e) {
      console.error(e);
      // Fallback summary
      const fallbackSummary = {
        id: 'summary-local-' + Date.now(),
        generatedAt: new Date().toISOString(),
        dateRange: 'Past 7 Days',
        entryCount: entries.filter((e) => e.author === 'user').length,
        overallTone: 'Gently Reflective & Hopeful',
        narrativeSummary:
          "This week has been marked by moments of honest introspection and quiet growth. You navigated varying emotional currents with mindful awareness, giving voice to thoughts that needed room to breathe.",
        recurringThemes: ['Work Life Balance', 'Quiet Moments', 'Self Acceptance'],
        emotionalHighlights: [
          {
            title: 'Finding Grounding in Stillness',
            description: 'Acknowledging personal limits and allowing restorative quiet time.',
          },
          {
            title: 'Courageous Honesty',
            description: 'Writing openly about anxieties and turning them into actionable calm.',
          },
        ],
        caringAffirmation:
          'You are doing wonderfully, even on the days that feel uncertain. Trust your pace.',
        gentleInquiry:
          'What is one small kindness you can grant yourself as you welcome the coming days?',
      };
      setWeeklySummaryData(fallbackSummary);
      if (user.id) {
        saveWeeklySummaryToFirestore(user.id, fallbackSummary).catch(console.error);
      }
    } finally {
      setIsWeeklySummaryLoading(false);
    }
  };

  const handleOpenWeeklySummary = () => {
    setIsWeeklySummaryOpen(true);
    if (!weeklySummaryData) {
      fetchWeeklySummary();
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setComposerPrompt(promptText);
  };

  // If auth is initializing, show tranquil loading state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FCF8F9] flex flex-col items-center justify-center gap-3 font-sans text-teal-900">
        <div className="w-8 h-8 border-3 border-teal-600/30 border-t-teal-700 rounded-full animate-spin" />
        <p className="text-xs font-medium text-stone-500 font-journal">Opening your sanctuary...</p>
      </div>
    );
  }

  // If user is not logged in, show calm & warm Login screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const currentTheme = THEMES[themeMode] || THEMES['midnight-black'];

  return (
    <div 
      id="nightday-app-root"
      className={`h-screen flex flex-col transition-colors duration-200 overflow-hidden ${currentTheme.bodyClass}`}
    >
      {/* Header with App Logo, Streak counter, Sanctuary/Sol navigation, Breathe, Theme Toggle & Profile Avatar */}
      <Header
        user={user}
        entries={entries}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenNewReflection={() => setActiveView('write')}
        onOpenWeeklySummary={handleOpenWeeklySummary}
        onOpenPromptDialog={() => setIsPromptModalOpen(true)}
        onOpenBreatheModal={() => setIsBreatheModalOpen(true)}
        onOpenMusicSidebar={() => setIsMusicSidebarOpen(true)}
        onOpenProfileModal={(tab = 'profile') => {
          setProfileModalTab(tab);
          setIsProfileModalOpen(true);
        }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenDiaryExport={() => setIsDiaryExportOpen(true)}
        isMusicPlaying={isMusicPlaying}
        currentTrack={currentTrack}
        onToggleMusicPlay={() => handleTogglePlay()}
        themeMode={themeMode}
        onSelectTheme={handleSelectTheme}
        onLogout={handleLogout}
        totalEntriesCount={entries.filter((e) => e.author === 'user').length}
        isHistorySidebarOpen={isSidebarOpen}
        onToggleHistorySidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Sanctuary Dashboard View */}
      {activeView === 'sanctuary' && (
        <SanctuaryDashboard
          entries={entries}
          user={user}
          themeMode={themeMode}
          onOpenNewReflection={() => setActiveView('write')}
          onSelectEntry={(entry) => setSelectedDetailEntry(entry)}
          onToggleFavorite={handleToggleFavorite}
          onDeleteEntry={handleDeleteEntry}
          onOpenWeeklySummary={handleOpenWeeklySummary}
          onOpenBreathe={() => setIsBreatheModalOpen(true)}
          onOpenInspiration={() => setIsPromptModalOpen(true)}
          onOpenExport={() => setIsDiaryExportOpen(true)}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
        />
      )}

      {/* Dedicated Full Reflection Writing Canvas with Sol AI helper (matches screenshot) */}
      {activeView === 'write' && (
        <ReflectionComposerView
          user={user}
          themeMode={themeMode}
          onBackToSanctuary={() => setActiveView('sanctuary')}
          onSubmitReflection={handleCreateNewReflection}
          isSubmitting={isReflecting}
          onOpenInspirationModal={() => setIsPromptModalOpen(true)}
        />
      )}

      {/* Companion / Conversational Feed View */}
      {(activeView === 'companion' || activeView === 'feed') && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* ChatGPT / Claude Style Retractable Sidebar Drawer */}
          <SidebarDrawer
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onToggle={() => setIsSidebarOpen((prev) => !prev)}
            entries={entries}
            selectedDateKey={selectedDateKey}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
            onNewChat={handleNewChat}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            themeMode={themeMode}
            user={user}
          />

          {/* Main Journal Screen: Feed & Floating Input */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {isEntriesLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-journal">Loading your reflections from Firestore...</p>
              </div>
            ) : (
              <JournalFeed
                entries={filteredEntries}
                allEntries={entries}
                isReflecting={isReflecting}
                themeMode={themeMode}
                user={user}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedTagFilter={selectedTagFilter}
                onSelectTagFilter={setSelectedTagFilter}
                selectedDateLabel={selectedDateLabel}
                onClearDateFilter={() => setSelectedDateKey(null)}
                onDeleteEntry={handleDeleteEntry}
                onToggleFavorite={handleToggleFavorite}
                onSelectPrompt={handleSelectPrompt}
              />
            )}

            {/* Floating Input Bar with Airy Mood Buttons */}
            <JournalInput
              onSendEntry={handleSendEntry}
              isSending={isReflecting}
              themeMode={themeMode}
              initialPrompt={composerPrompt}
              onClearInitialPrompt={() => setComposerPrompt(undefined)}
              selectedTagFilter={selectedTagFilter}
              onOpenPromptModal={() => setIsPromptModalOpen(true)}
            />
          </main>
        </div>
      )}

      {/* Modal 1: + New Reflection Modal */}
      {isNewReflectionModalOpen && (
        <NewReflectionModal
          isOpen={isNewReflectionModalOpen}
          onClose={() => setIsNewReflectionModalOpen(false)}
          onSubmit={handleCreateNewReflection}
          isSending={isReflecting}
          themeMode={themeMode}
          user={user}
        />
      )}

      {/* Modal 2: 4-7-8 Mindful Breathing Modal */}
      {isBreatheModalOpen && (
        <BreatheModal
          isOpen={isBreatheModalOpen}
          onClose={() => setIsBreatheModalOpen(false)}
          themeMode={themeMode}
        />
      )}

      {/* Modal 3: Deep Reflection & Live Dialogue Modal */}
      {selectedDetailEntry && (
        <ReflectionDetailModal
          isOpen={!!selectedDetailEntry}
          onClose={() => setSelectedDetailEntry(null)}
          entry={selectedDetailEntry}
          replies={detailReplies}
          themeMode={themeMode}
          user={user}
          onToggleFavorite={handleToggleFavorite}
          onDeleteEntry={handleDeleteEntry}
          onUpdateEntry={handleUpdateEntry}
          onSendReply={handleSendReply}
          isSendingReply={isSendingReply}
        />
      )}

      {/* Floating Quick Music Control Circle */}
      <FloatingMusicWidget
        currentTrack={currentTrack}
        isPlaying={isMusicPlaying}
        onTogglePlay={() => handleTogglePlay()}
        onStop={handleStopMusic}
        onNextTrack={handleNextTrack}
        onOpenSidebar={() => setIsMusicSidebarOpen(true)}
        themeMode={themeMode}
      />

      {/* "Summarize my week" Dialog */}
      {isWeeklySummaryOpen && (
        <WeeklySummaryModal
          isOpen={isWeeklySummaryOpen}
          onClose={() => setIsWeeklySummaryOpen(false)}
          summaryData={weeklySummaryData}
          isLoading={isWeeklySummaryLoading}
          onRegenerate={fetchWeeklySummary}
          themeMode={themeMode}
        />
      )}

      {/* Gentle Inquiries / Prompts Modal */}
      {isPromptModalOpen && (
        <PromptModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          onSelectPrompt={handleSelectPrompt}
          themeMode={themeMode}
        />
      )}

      {/* Spotify-style Music Sanctuary Sidebar Drawer */}
      <MusicPlayerSidebar
        isOpen={isMusicSidebarOpen}
        onClose={() => setIsMusicSidebarOpen(false)}
        currentMood={latestUserMood}
        themeMode={themeMode}
        currentTrack={currentTrack}
        isPlaying={isMusicPlaying}
        onTrackChange={handleTrackChange}
        onTogglePlay={handleTogglePlay}
        onStop={handleStopMusic}
      />

      {/* Diary Export / Download Modal */}
      {isDiaryExportOpen && (
        <DiaryExportModal
          isOpen={isDiaryExportOpen}
          onClose={() => setIsDiaryExportOpen(false)}
          entries={entries}
          user={user}
          themeMode={themeMode}
          selectedTagFilter={selectedTagFilter}
        />
      )}

      {/* Profile & Companion Avatar Customization Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        themeMode={themeMode}
        onSelectTheme={handleSelectTheme}
        entries={entries}
        initialTab={profileModalTab}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      {/* Security & Architecture Transparency Center Modal */}
      {isSecurityModalOpen && (
        <SecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          user={user}
          themeMode={themeMode}
        />
      )}

      {/* Subtle Save Confirmation Toast */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{savedToast}</span>
        </div>
      )}
    </div>
  );
}

