import {
  db,
  auth,
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from '../firebase';
import { JournalEntry, UserProfile, WeeklySummaryData } from '../types';

/**
 * Helper to get fresh Firebase ID Token from current authenticated user
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const currentFbUser = auth?.currentUser;
    if (currentFbUser) {
      return await currentFbUser.getIdToken();
    }
  } catch (err) {
    console.error('[Firestore Service] Failed to obtain Firebase ID Token:', err);
  }
  return null;
}

/**
 * 1. Persistent Storage: Save Journal Entry
 * Stores created entries (content, selected moods, category, date, and timestamp)
 * in users/{uid}/journal_entries using Firestore addDoc (and setDoc for specific IDs).
 */
export async function saveJournalEntry(
  userId: string,
  entry: Partial<JournalEntry> & { content: string }
): Promise<string> {
  if (!userId) {
    throw new Error('Unauthorized: userId is required to save journal entry.');
  }

  const timestamp = entry.timestamp || new Date().toISOString();
  const dateStr = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const payload: Record<string, any> = {
    title: entry.title || '',
    content: entry.content || '',
    author: entry.author || 'user',
    mood: entry.mood || null,
    category: (entry.tags && entry.tags.length > 0 ? entry.tags[0] : null) || 'personal',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    date: dateStr,
    timestamp,
    favorite: Boolean(entry.favorite),
  };

  if (entry.imageUrl) {
    payload.imageUrl = entry.imageUrl;
  }
  if (entry.replyToId) {
    payload.replyToId = entry.replyToId;
  }

  let createdId = entry.id || '';

  // 1. Write via Client Firestore SDK using addDoc/setDoc
  if (db) {
    try {
      if (entry.id) {
        const docRef = doc(db, 'users', userId, 'journal_entries', entry.id);
        await setDoc(docRef, payload, { merge: true });
        // Also sync to legacy subcollection for compatibility
        const legacyRef = doc(db, 'users', userId, 'entries', entry.id);
        await setDoc(legacyRef, payload, { merge: true }).catch(() => {});
        createdId = entry.id;
      } else {
        const entriesCollection = collection(db, 'users', userId, 'journal_entries');
        const docRef = await addDoc(entriesCollection, payload);
        createdId = docRef.id;
        // Also write to legacy path
        const legacyRef = doc(db, 'users', userId, 'entries', createdId);
        await setDoc(legacyRef, payload, { merge: true }).catch(() => {});
      }
      console.log(`[Firestore Client SUCCESS] Saved journal entry "${createdId}" in users/${userId}/journal_entries`);
    } catch (err: any) {
      console.warn('[Firestore Client Notice] Client SDK write deferred:', err?.message);
    }
  }

  // 2. Also sync to backend API with verified ID token
  const token = await getAuthToken();
  if (token) {
    try {
      await fetch('/api/journal/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: createdId || entry.id,
          ...payload,
        }),
      });
    } catch (apiErr: any) {
      console.warn('[Firestore API Notice] Backend write deferred:', apiErr?.message);
    }
  }

  return createdId || `entry-${Date.now()}`;
}

/**
 * Compatibility alias for saveJournalEntry
 */
export async function saveEntryToFirestore(userId: string, entry: JournalEntry): Promise<void> {
  await saveJournalEntry(userId, entry);
}

/**
 * 2. Persistent Storage: Save Chat History
 * Automatically saves all AI companion conversation messages (user input and AI responses)
 * to users/{uid}/chat_messages.
 */
export async function saveChatMessage(
  userId: string,
  message: {
    id?: string;
    author: 'user' | 'ai';
    content: string;
    timestamp?: string;
    mood?: string;
    replyToId?: string;
  }
): Promise<string> {
  if (!userId) return '';

  const timestamp = message.timestamp || new Date().toISOString();
  const payload = {
    author: message.author,
    content: message.content,
    timestamp,
    mood: message.mood || null,
    replyToId: message.replyToId || null,
  };

  let msgId = message.id || '';

  if (db) {
    try {
      if (message.id) {
        const msgRef = doc(db, 'users', userId, 'chat_messages', message.id);
        await setDoc(msgRef, payload, { merge: true });
      } else {
        const chatCol = collection(db, 'users', userId, 'chat_messages');
        const docRef = await addDoc(chatCol, payload);
        msgId = docRef.id;
      }
      console.log(`[Firestore Client SUCCESS] Saved chat message in users/${userId}/chat_messages`);
    } catch (err: any) {
      console.warn('[Firestore Client Notice] Chat message write deferred:', err?.message);
    }
  }

  return msgId || `msg-${Date.now()}`;
}

/**
 * 3. Persistent Storage: Save Weekly Summaries to users/{uid}/summaries
 */
export async function saveWeeklySummaryToFirestore(
  userId: string,
  summary: WeeklySummaryData
): Promise<void> {
  if (!userId || !summary) return;

  const payload = {
    ...summary,
    savedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const summaryId = summary.id || `summary-${Date.now()}`;
      const summaryRef = doc(db, 'users', userId, 'summaries', summaryId);
      await setDoc(summaryRef, payload, { merge: true });
      console.log(`[Firestore Client SUCCESS] Saved weekly summary to users/${userId}/summaries`);
    } catch (err: any) {
      console.warn('[Firestore Client Notice] Summary save deferred:', err?.message);
    }
  }
}

/**
 * 4. Persistent Storage: Save User Profile & Settings to users/{uid}/profile & users/{uid}
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!user?.id) return;

  const payload = {
    displayName: user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'Friend'),
    email: user.email || '',
    avatarUrl: user.avatarUrl || null,
    avatarId: user.avatarId || null,
    companionName: user.companionName || 'Luna',
    companionAvatarId: user.companionAvatarId || null,
    themePreference: user.themePreference || 'teal-quill',
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      // Save to root user doc
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, payload, { merge: true });

      // Also save to profile subcollection: users/{uid}/profile/settings
      const profileSubRef = doc(db, 'users', user.id, 'profile', 'settings');
      await setDoc(profileSubRef, payload, { merge: true });

      console.log(`[Firestore Client SUCCESS] Saved user profile for "${user.id}"`);
    } catch (err: any) {
      console.warn('[Firestore Client Notice] Profile save deferred:', err?.message);
    }
  }
}

/**
 * 5. Real-time Sync Across Sessions: Subscribe to Journal Entries
 * Uses Firestore onSnapshot listeners to load and sync all past entries instantly.
 */
export function subscribeToJournalEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!userId || !db) {
    return () => {};
  }

  try {
    // Primary query on users/{uid}/journal_entries
    const entriesRef = collection(db, 'users', userId, 'journal_entries');
    const q = query(entriesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            author: data.author === 'ai' ? 'ai' : 'user',
            title: data.title || undefined,
            content: data.content || '',
            timestamp: data.timestamp || new Date().toISOString(),
            mood: data.mood || undefined,
            tags: Array.isArray(data.tags) ? data.tags : undefined,
            imageUrl: data.imageUrl || undefined,
            favorite: Boolean(data.favorite),
            replyToId: data.replyToId || undefined,
          });
        });

        // If journal_entries is empty, check legacy entries subcollection
        if (loaded.length === 0) {
          const legacyRef = collection(db, 'users', userId, 'entries');
          const legacyQuery = query(legacyRef, orderBy('timestamp', 'asc'));
          getDocs(legacyQuery).then((legacySnap) => {
            if (!legacySnap.empty) {
              const legacyList: JournalEntry[] = [];
              legacySnap.forEach((lSnap) => {
                const d = lSnap.data();
                legacyList.push({
                  id: lSnap.id,
                  author: d.author === 'ai' ? 'ai' : 'user',
                  title: d.title || undefined,
                  content: d.content || '',
                  timestamp: d.timestamp || new Date().toISOString(),
                  mood: d.mood || undefined,
                  tags: Array.isArray(d.tags) ? d.tags : undefined,
                  imageUrl: d.imageUrl || undefined,
                  favorite: Boolean(d.favorite),
                  replyToId: d.replyToId || undefined,
                });
              });
              onUpdate(legacyList);
            } else {
              onUpdate(loaded);
            }
          }).catch(() => onUpdate(loaded));
        } else {
          onUpdate(loaded);
        }
      },
      (error) => {
        console.warn('[Firestore onSnapshot Notice] Journal entries listener:', error?.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('[Firestore Service] Failed to attach onSnapshot listener:', err);
    return () => {};
  }
}

/**
 * Subscribe to Chat Messages in real-time
 */
export function subscribeToChatMessages(
  userId: string,
  onUpdate: (messages: any[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!userId || !db) {
    return () => {};
  }

  try {
    const chatRef = collection(db, 'users', userId, 'chat_messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore onSnapshot Notice] Chat messages listener:', err?.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Subscribe to Weekly Summaries in real-time
 */
export function subscribeToWeeklySummaries(
  userId: string,
  onUpdate: (summaries: WeeklySummaryData[]) => void
): () => void {
  if (!userId || !db) {
    return () => {};
  }

  try {
    const summariesRef = collection(db, 'users', userId, 'summaries');
    const q = query(summariesRef, orderBy('savedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: WeeklySummaryData[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as WeeklySummaryData);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore onSnapshot Notice] Summaries listener:', err?.message);
      }
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Loads all journal entries for a user from Firestore ordered by timestamp ascending.
 */
export async function loadEntriesFromFirestore(userId: string): Promise<JournalEntry[]> {
  if (!userId) {
    return [];
  }

  // Method 1: Client Firestore SDK
  if (db) {
    try {
      const entriesRef = collection(db, 'users', userId, 'journal_entries');
      const q = query(entriesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const entries: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          entries.push({
            id: docSnap.id,
            author: data.author === 'ai' ? 'ai' : 'user',
            title: data.title || undefined,
            content: data.content || '',
            timestamp: data.timestamp || new Date().toISOString(),
            mood: data.mood,
            tags: Array.isArray(data.tags) ? data.tags : undefined,
            imageUrl: data.imageUrl,
            favorite: Boolean(data.favorite),
            replyToId: data.replyToId,
          });
        });
        return entries;
      }
    } catch (err: any) {
      console.warn(`[Firestore Client Notice] Client SDK fetch deferred:`, err?.message);
    }
  }

  // Method 2: Authenticated Backend API
  const token = await getAuthToken();
  if (token) {
    try {
      const res = await fetch('/api/journal/entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entries)) {
          return data.entries.map((e: any) => ({
            id: e.id,
            author: e.author === 'ai' ? 'ai' : 'user',
            title: e.title || undefined,
            content: e.content || '',
            timestamp: e.timestamp || new Date().toISOString(),
            mood: e.mood,
            tags: Array.isArray(e.tags) ? e.tags : undefined,
            imageUrl: e.imageUrl,
            favorite: Boolean(e.favorite),
            replyToId: e.replyToId,
          }));
        }
      }
    } catch (apiErr: any) {
      console.warn('[Firestore API Notice] Failed loading entries from backend API:', apiErr?.message);
    }
  }

  return [];
}

/**
 * Deletes a journal entry and any corresponding companion reply from Firestore
 */
export async function deleteEntryFromFirestore(
  userId: string,
  entryId: string,
  replyToId?: string
): Promise<void> {
  if (!userId) return;

  // 1. Delete via Client SDK if available
  if (db) {
    try {
      const entryRef = doc(db, 'users', userId, 'journal_entries', entryId);
      await deleteDoc(entryRef);

      const legacyRef = doc(db, 'users', userId, 'entries', entryId);
      await deleteDoc(legacyRef).catch(() => {});

      if (replyToId) {
        const replyRef = doc(db, 'users', userId, 'journal_entries', replyToId);
        await deleteDoc(replyRef).catch(() => {});
        const legacyReply = doc(db, 'users', userId, 'entries', replyToId);
        await deleteDoc(legacyReply).catch(() => {});
      }
      console.log(`[Firestore Client SUCCESS] Deleted entry "${entryId}" for user "${userId}"`);
    } catch (err: any) {
      console.warn(`[Firestore Client Notice] Client SDK delete deferred:`, err?.message);
    }
  }

  // 2. Delete via Backend API
  const token = await getAuthToken();
  if (token) {
    try {
      await fetch(`/api/journal/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (replyToId) {
        await fetch(`/api/journal/entries/${replyToId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } catch (apiErr: any) {
      console.warn('[Firestore API Notice] Failed deleting entry via backend REST:', apiErr?.message);
    }
  }
}
