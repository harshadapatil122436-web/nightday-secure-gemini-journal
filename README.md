# 🌙 NightDay — Private AI Journal & Empathetic Reflection Companion

<div align="center">

![NightDay Banner](https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop)

**A private, distraction-free journaling space powered by Google Gemini, Google Cloud Secret Manager, and Firebase Firestore.**  
*Write authentic personal reflections, track mood trends, receive empathetic companion feedback, and export real keepsake diary editions.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Google Gemini API](https://img.shields.io/badge/Gemini%20API-3.6%20Flash-orange?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

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
