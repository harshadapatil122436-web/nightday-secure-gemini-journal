# 🌙 NightDay — Private AI Journal & Empathetic Reflection Companion


---

## 📖 Overview

**NightDay** is a full-stack daily journaling web application tailored for mindful self-reflection, emotional tracking, and memory preservation. It pairs an intuitive, distraction-free writing environment with **Luna** (an empathetic AI companion powered by Gemini) that provides constructive, warm perspectives without ever encroaching on personal journal exports.

### ✨ Key Features

- ✍️ **Distraction-Free Journal Editor**: Rich mood tags, date pickers, audio voice-dictation recording, and photo attachments.
- 🤖 **Resilient AI Companion (Luna)**: Server-side Gemini integration with automated multi-model fallback ladders (`gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash`).
- 🔒 **Zero-Trust Security Architecture**: Cloud Secret Manager integration, user-bound Firestore isolation rules, and zero client-side key leakage.
- 📖 **Keepsake Diary Exporter**: Download single entries or entire volumes as styled HTML keepsake diary books, formatted text letters, or clean Markdown files.
- 📊 **Emotional Insights & Analytics**: Visual charts for mood distributions, consistency streaks, and reflection word counts.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite + Tailwind CSS + Lucide Icons + Motion)        │
└───────────────────────────┬────────────────────────────┘
                            │ Bearer Token / HTTPS
┌───────────────────────────▼────────────────────────────┐
│                  Express Node.js Server                │
│             (Type-safe ESM/CJS bundled backend)        │
├───────────────────────────┬────────────────────────────┤
│                           │                            │
│  Google Cloud             │  Google Gemini API         │  Firebase Auth &
│  Secret Manager           │  (@google/genai SDK)       │  Cloud Firestore
│  (GEMINI_API_KEY)         │  (Empathetic Companion)   │  (Owner-bound data)
└───────────────────────────┴────────────────────────────┘
