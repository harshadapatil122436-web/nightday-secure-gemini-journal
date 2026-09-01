import { JournalEntry } from '../types';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  hasWrittenToday: boolean;
  totalDaysWithEntries: number;
  streakDates: string[]; // List of YYYY-MM-DD
  message: string;
}

/**
 * Calculates user journaling daily streak based on entry timestamps
 */
export function calculateJournalStreak(entries: JournalEntry[]): StreakInfo {
  // Only consider user authored entries
  const userEntries = entries.filter((e) => e.author === 'user');

  if (userEntries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasWrittenToday: false,
      totalDaysWithEntries: 0,
      streakDates: [],
      message: 'Write your first diary entry to start your daily streak!',
    };
  }

  // Extract unique sorted date strings (YYYY-MM-DD in local time)
  const uniqueDatesSet = new Set<string>();
  userEntries.forEach((entry) => {
    try {
      const d = new Date(entry.timestamp);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      uniqueDatesSet.add(dateKey);
    } catch {
      // ignore invalid dates
    }
  });

  const sortedDates = Array.from(uniqueDatesSet).sort().reverse(); // Newest first
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const hasWrittenToday = uniqueDatesSet.has(todayKey);

  // Calculate current active streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If not written today, start checking from yesterday to see if streak is still alive
  if (!hasWrittenToday) {
    if (uniqueDatesSet.has(yesterdayKey)) {
      checkDate = yesterday;
    } else {
      // Streak broken (0 days or just needs writing today)
      currentStreak = 0;
    }
  }

  if (hasWrittenToday || uniqueDatesSet.has(yesterdayKey)) {
    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (uniqueDatesSet.has(key)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let tempStreak = 0;
  const chronologicalDates = Array.from(uniqueDatesSet).sort(); // Oldest first

  for (let i = 0; i < chronologicalDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(chronologicalDates[i - 1]);
      const curr = new Date(chronologicalDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // Encouragement messages
  let message = '';
  if (hasWrittenToday) {
    if (currentStreak === 1) {
      message = "You've written today! Great start to your daily streak.";
    } else if (currentStreak < 7) {
      message = `Awesome! ${currentStreak} days in a row. Keep the momentum going!`;
    } else {
      message = `Incredible dedication! 🔥 ${currentStreak} days consecutive streak.`;
    }
  } else {
    if (currentStreak > 0) {
      message = `Write today's reflection to keep your ${currentStreak}-day streak alive!`;
    } else {
      message = "Write today's entry to ignite your journaling streak.";
    }
  }

  return {
    currentStreak,
    longestStreak,
    hasWrittenToday,
    totalDaysWithEntries: uniqueDatesSet.size,
    streakDates: sortedDates,
    message,
  };
}
