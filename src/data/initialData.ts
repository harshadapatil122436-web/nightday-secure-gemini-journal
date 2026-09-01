import { JournalEntry, MoodConfig } from '../types';

export const MOOD_CONFIGS: MoodConfig[] = [
  { id: 'peaceful', label: 'Peaceful', emoji: '🌿', color: 'border-emerald-500/30 bg-emerald-500/10', badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', textColor: 'text-emerald-300' },
  { id: 'reflective', label: 'Reflective', emoji: '💭', color: 'border-indigo-500/30 bg-indigo-500/10', badgeBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400', textColor: 'text-indigo-300' },
  { id: 'joyful', label: 'Joyful', emoji: '☀️', color: 'border-amber-500/30 bg-amber-500/10', badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', textColor: 'text-amber-300' },
  { id: 'centered', label: 'Centered', emoji: '🧘', color: 'border-teal-500/30 bg-teal-500/10', badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400', textColor: 'text-teal-300' },
  { id: 'inspired', label: 'Inspired', emoji: '✨', color: 'border-purple-500/30 bg-purple-500/10', badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400', textColor: 'text-purple-300' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: 'border-yellow-500/30 bg-yellow-500/10', badgeBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', textColor: 'text-yellow-300' },
  { id: 'melancholy', label: 'Melancholy', emoji: '🌊', color: 'border-blue-500/30 bg-blue-500/10', badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', textColor: 'text-blue-300' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌧️', color: 'border-rose-500/30 bg-rose-500/10', badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400', textColor: 'text-rose-300' },
  { id: 'restful', label: 'Restful', emoji: '🌙', color: 'border-cyan-500/30 bg-cyan-500/10', badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400', textColor: 'text-cyan-300' },
];

export const POPULAR_TAG_SUGGESTIONS = [
  'Mindful',
  'Nature',
  'Evening Wind-down',
  'Creative',
  'Growth',
  'Morning Grounding',
  'Relationships',
  'Gratitude',
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Twilight stillness and letting go',
    author: 'user',
    content: "The evening light has settled into deep indigo through the window. Today was full of deadlines and quick conversations, but in this quiet hour, I can finally feel my breath slow down. I made a pot of chamomile tea and listened to the gentle rain tapping on the pane. It's a reminder that not everything needs an immediate solution.",
    timestamp: '2026-08-30T20:30:00.000Z',
    mood: 'peaceful',
    favorite: true,
    tags: ['Mindful', 'Nature', 'Evening Wind-down'],
    wordCount: 68,
  },
  {
    id: 'entry-1-reply',
    author: 'ai',
    content: "There is such sweet solace in that twilight hour. It sounds like making that tea and listening to the rain helped you step out of the rush and back into yourself. Letting the world wait while you catch your breath is one of the kindest things you can do tonight.",
    timestamp: '2026-08-30T20:31:00.000Z',
    replyToId: 'entry-1',
  },
  {
    id: 'entry-2',
    title: 'Morning tea and untangled thoughts',
    author: 'user',
    content: "Woke up early before the city stirred. Brewed roasted green tea in my favorite ceramic mug. I noticed a lingering hesitation about my new creative project, but as I wrote down each fear, they shrunk down to manageable steps. Starting is always the hardest part.",
    timestamp: '2026-08-29T08:15:00.000Z',
    mood: 'reflective',
    favorite: false,
    tags: ['Creative', 'Growth', 'Morning Grounding'],
    wordCount: 46,
  },
  {
    id: 'entry-2-reply',
    author: 'ai',
    content: "Pouring fears onto paper has a magical way of taking away their power. You noticed the hesitation without letting it freeze you, and breaking it down into smaller steps is true momentum. What's the very first step you feel like exploring today?",
    timestamp: '2026-08-29T08:16:00.000Z',
    replyToId: 'entry-2',
  },
  {
    id: 'entry-3',
    title: 'Unexpected laughter with an old friend',
    author: 'user',
    content: "Ran into Elena at the farmers market this morning. We grabbed peach pastries and sat on the wooden bench for almost two hours, reminiscing and laughing until our sides hurt. It felt like no time had passed at all. Deeply grateful for friendships that endure without effort.",
    timestamp: '2026-08-28T14:45:00.000Z',
    mood: 'joyful',
    favorite: true,
    tags: ['Relationships', 'Gratitude'],
    wordCount: 52,
  },
  {
    id: 'entry-3-reply',
    author: 'ai',
    content: "Those effortless, spontaneous reunions are pure medicine for the soul. The kind of friendship where you can pick right back up after months or years is rare and precious. Keep that warmth with you as you move through your weekend!",
    timestamp: '2026-08-28T14:46:00.000Z',
    replyToId: 'entry-3',
  },
];

export const GENTLE_PROMPTS = [
  "What is something small that brought a flicker of comfort to your day today?",
  "If you could unburden your mind of one worry for the next hour, which one would it be?",
  "What is a boundary or quiet moment you were proud of protecting recently?",
  "How is your body feeling right now, and what kind of care is it asking for?",
  "Describe a place or memory where you felt completely at ease.",
  "What is one truth you want to remind yourself of before you sleep tonight?",
  "What made you smile or feel understood lately?",
];
