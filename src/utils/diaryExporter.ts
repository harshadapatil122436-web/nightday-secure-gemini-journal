import { JournalEntry, UserProfile, ThemeMode } from '../types';
import { MOOD_CONFIGS } from '../data/initialData';

/**
 * Formats a single reflection into an authentic, personal Keepsake Diary Page (HTML)
 * Styled with realistic lined stationery paper, clean date/time headers, and real diary writing look.
 */
export function generateSingleReflectionDiaryHtml(
  entry: JournalEntry,
  user: UserProfile
): string {
  const userName = user.name || 'My';
  const date = new Date(entry.timestamp);
  const fullDateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const moodConfig = entry.mood ? MOOD_CONFIGS.find((m) => m.id === entry.mood) : null;

  const moodBadge = moodConfig
    ? `<span class="mood-stamp">${moodConfig.emoji} ${moodConfig.label}</span>`
    : '';

  const tagsHtml =
    entry.tags && entry.tags.length > 0
      ? `<div class="tags-row">${entry.tags
          .map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`)
          .join(' ')}</div>`
      : '';

  const photoHtml = entry.imageUrl
    ? `<div class="polaroid-photo">
        <img src="${entry.imageUrl}" alt="Diary Memory" />
        <div class="polaroid-caption">${escapeHtml(fullDateStr)}</div>
      </div>`
    : '';

  const paragraphs = entry.content
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(entry.title || 'Personal Reflection')} — ${escapeHtml(userName)}'s Diary</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-desk: #1e1b18;
      --paper-cream: #faf6ee;
      --paper-line: rgba(180, 160, 140, 0.32);
      --margin-line: rgba(225, 95, 105, 0.45);
      --ink-dark: #231b17;
      --teal-accent: #0f766e;
      --tape-color: rgba(230, 215, 185, 0.85);
      --companion-bg: #f4efe4;
      --companion-border: #d9cfbe;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-desk);
      background-image: radial-gradient(#2d2822 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--ink-dark);
      font-family: 'Lora', Georgia, serif;
      min-height: 100vh;
      padding: 30px 15px 60px 15px;
      display: flex;
      justify-content: center;
    }

    .diary-page-wrapper {
      width: 100%;
      max-width: 820px;
    }

    /* Screen toolbar */
    .no-print-toolbar {
      position: sticky;
      top: 15px;
      z-index: 100;
      background: #171513;
      border: 1px solid #3d352e;
      padding: 12px 20px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 24px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
      color: #eae5df;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
    }

    .no-print-toolbar button {
      background: #0d9488;
      color: #ffffff;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s;
    }

    .no-print-toolbar button:hover {
      background: #0f766e;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(13,148,136,0.4);
    }

    /* Real Diary Book Page */
    .diary-page {
      background: var(--paper-cream);
      box-shadow: 0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.12);
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    /* Left Spine Accent */
    .diary-page::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 16px;
      background: linear-gradient(to right, #09403d, #0d5f5a 60%, #063330);
      box-shadow: 2px 0 6px rgba(0,0,0,0.25);
      z-index: 10;
    }

    /* Lined Notebook Paper Content */
    .diary-content {
      padding: 50px 50px 70px 65px;
      position: relative;
      background-image: linear-gradient(var(--paper-line) 1px, transparent 1px);
      background-size: 100% 34px;
      line-height: 34px;
    }

    /* Red Margin Line */
    .diary-content::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 70px;
      width: 2px;
      background-color: var(--margin-line);
      z-index: 2;
    }

    /* Header Meta Row */
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 2px dashed rgba(180, 160, 140, 0.45);
      margin-bottom: 24px;
    }

    .date-badge {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: #1a1512;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-badge {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #7d6e64;
    }

    .mood-stamp {
      background: #f0e7d8;
      border: 1px solid #d4c5b0;
      padding: 3px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #3f332a;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* Entry Title */
    .entry-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: #171310;
      line-height: 1.3;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }

    /* Entry Body (Handwritten / Classic Serif Flow) */
    .entry-body {
      font-size: 18px;
      color: #241c18;
      line-height: 34px;
      letter-spacing: 0.005em;
      margin-bottom: 28px;
    }

    .entry-body p {
      margin-bottom: 18px;
      text-indent: 20px;
    }

    .entry-body p:first-of-type {
      text-indent: 0;
    }

    /* Polaroid Attached Photo */
    .polaroid-photo {
      background: #ffffff;
      padding: 12px 12px 24px 12px;
      border-radius: 3px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06);
      max-width: 340px;
      margin: 20px 0 28px 0;
      transform: rotate(-1.5deg);
      border: 1px solid #e2d9cc;
      position: relative;
    }

    .polaroid-photo::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 36%;
      width: 80px;
      height: 20px;
      background: var(--tape-color);
      transform: rotate(2.5deg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      border-left: 2px dashed rgba(0,0,0,0.1);
      border-right: 2px dashed rgba(0,0,0,0.1);
    }

    .polaroid-photo img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 2px;
    }

    .polaroid-caption {
      font-family: 'Caveat', cursive;
      font-size: 16px;
      color: #554433;
      text-align: center;
      margin-top: 10px;
    }

    /* Tags Row */
    .tags-row {
      margin-top: 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag-chip {
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #635348;
      background: rgba(220, 205, 185, 0.55);
      border: 1px solid rgba(190, 175, 155, 0.6);
      padding: 2px 10px;
      border-radius: 6px;
      font-weight: 500;
    }

    /* Companion Note Card */
    .companion-note-card {
      margin-top: 35px;
      background: var(--companion-bg);
      border: 1px solid var(--companion-border);
      border-left: 4px solid var(--teal-accent);
      border-radius: 10px;
      padding: 22px 24px;
      position: relative;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }

    .companion-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px dashed rgba(190, 175, 155, 0.7);
    }

    .companion-avatar-badge {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #0f766e;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 6px rgba(15,118,110,0.3);
    }

    .companion-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      color: #171310;
    }

    .companion-subtitle {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f766e;
    }

    .companion-body {
      font-size: 16px;
      color: #2b231f;
      line-height: 28px;
      font-style: italic;
    }

    /* Diary Sign-off Footer */
    .diary-signoff {
      margin-top: 45px;
      padding-top: 25px;
      border-top: 2px solid rgba(180, 160, 140, 0.45);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .signoff-meta {
      font-size: 12px;
      color: #8c7b70;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .signature-box {
      font-family: 'Caveat', cursive;
      font-size: 28px;
      color: #1e1612;
      border-top: 1px solid #735d4f;
      padding-top: 4px;
      min-width: 160px;
      text-align: center;
      font-weight: 700;
    }

    /* Print / PDF Styling */
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .diary-page {
        box-shadow: none !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .diary-page::before {
        display: none !important;
      }
      .diary-content {
        padding: 30px 40px !important;
      }
    }
  </style>
</head>
<body>
  <div class="diary-page-wrapper">
    <!-- Floating Toolbar -->
    <div class="no-print-toolbar">
      <span>📖 <strong>${escapeHtml(userName)}'s Personal Diary</strong> — ${escapeHtml(fullDateStr)}</span>
      <button onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <!-- The Realistic Diary Page -->
    <main class="diary-page">
      <div class="diary-content">
        <!-- Date, Time & Mood -->
        <header class="entry-header">
          <div class="date-badge">
            <span>${escapeHtml(fullDateStr)}</span>
            <span class="time-badge">· ${escapeHtml(timeStr)}</span>
          </div>
          ${moodBadge}
        </header>

        <!-- Title -->
        <h1 class="entry-title">${escapeHtml(entry.title || 'Personal Reflection')}</h1>

        <!-- Polaroid Memory (if photo attached) -->
        ${photoHtml}

        <!-- Entry Thoughts -->
        <div class="entry-body">
          ${paragraphs}
        </div>

        <!-- Tags -->
        ${tagsHtml}

        <!-- Classic Signature Signoff -->
        <footer class="diary-signoff">
          <div class="signoff-meta">
            From NightDay Personal Sanctuary
          </div>
          <div class="signature-box">
            — ${escapeHtml(userName)}
          </div>
        </footer>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/**
 * Formats a single reflection into a clean vintage plain-text diary entry (.txt)
 */
export function generateSingleReflectionDiaryText(
  entry: JournalEntry,
  user: UserProfile
): string {
  const userName = user.name || 'My';
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const moodConfig = entry.mood ? MOOD_CONFIGS.find((m) => m.id === entry.mood) : null;
  const moodStr = moodConfig ? `${moodConfig.emoji} ${moodConfig.label}` : 'None';
  const tagsStr = entry.tags && entry.tags.length > 0 ? entry.tags.map((t) => `#${t}`).join(' ') : 'None';

  let doc = '';
  doc += `╔════════════════════════════════════════════════════════════════════════════╗\n`;
  doc += `║                         PERSONAL DIARY ENTRY                               ║\n`;
  doc += `╚════════════════════════════════════════════════════════════════════════════╝\n\n`;
  doc += `Author:    ${userName}\n`;
  doc += `Date:      ${dateStr}\n`;
  doc += `Time:      ${timeStr}\n`;
  doc += `Mood:      ${moodStr}\n`;
  doc += `Tags:      ${tagsStr}\n`;
  doc += `Title:     ${entry.title || 'Personal Reflection'}\n`;
  doc += `────────────────────────────────────────────────────────────────────────────\n\n`;
  doc += `Dear Diary,\n\n`;
  doc += `${entry.content.trim()}\n\n`;
  doc += `────────────────────────────────────────────────────────────────────────────\n`;
  doc += `                                                    — ${userName}\n`;
  doc += `════════════════════════════════════════════════════════════════════════════\n`;

  return doc;
}

/**
 * Formats journal entries into an authentic, personal Daily Diary Book (HTML)
 * Styled with realistic lined stationery paper, clean date/time headers, and pure diary writing.
 */
export function generateHtmlDiary(
  entries: JournalEntry[],
  user: UserProfile,
  title: string = 'Daily Diary'
): string {
  const userName = user.name || 'My';
  const exportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const entriesHtml = sortedEntries
    .map((entry) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const moodConfig = entry.mood ? MOOD_CONFIGS.find((m) => m.id === entry.mood) : null;

      const moodBadge = moodConfig
        ? `<span class="mood-stamp">${moodConfig.emoji} ${moodConfig.label}</span>`
        : '';

      const tagsHtml =
        entry.tags && entry.tags.length > 0
          ? `<div class="tags-row">${entry.tags
              .map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`)
              .join(' ')}</div>`
          : '';

      const photoHtml = entry.imageUrl
        ? `<div class="polaroid-photo">
            <img src="${entry.imageUrl}" alt="Diary Memory" />
            <div class="polaroid-caption">${escapeHtml(dateStr)}</div>
          </div>`
        : '';

      return `
        <article class="diary-entry">
          <div class="entry-header">
            <div class="entry-meta">
              <span class="entry-date">${escapeHtml(dateStr)}</span>
              <span class="entry-dot">•</span>
              <span class="entry-time">${escapeHtml(timeStr)}</span>
            </div>
            ${moodBadge}
          </div>
          
          ${photoHtml}

          <div class="entry-body">
            <p>${escapeHtml(entry.content).replace(/\n/g, '<br/>')}</p>
          </div>

          ${tagsHtml}
        </article>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(userName)}'s Daily Diary</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Lora:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-desk: #23201d;
      --paper-cream: #faf7f0;
      --paper-line: rgba(180, 160, 140, 0.35);
      --margin-line: rgba(225, 95, 105, 0.4);
      --ink-dark: #221c1a;
      --gold-accent: #0f766e;
      --tape-color: rgba(230, 215, 185, 0.7);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-desk);
      background-image: radial-gradient(#342f2a 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--ink-dark);
      font-family: 'Lora', Georgia, serif;
      min-height: 100vh;
      padding: 30px 15px;
      display: flex;
      justify-content: center;
    }

    .diary-book {
      width: 100%;
      max-width: 820px;
      background: var(--paper-cream);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      margin-bottom: 40px;
    }

    /* Spine Accent on Left */
    .diary-book::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 14px;
      background: linear-gradient(to right, #09403d, #0d5f5a 60%, #063330);
      box-shadow: 2px 0 5px rgba(0,0,0,0.25);
      z-index: 10;
    }

    /* Red Margin Line on Lined Notebook */
    .diary-content {
      padding: 45px 45px 65px 55px;
      position: relative;
      background-image: linear-gradient(var(--paper-line) 1px, transparent 1px);
      background-size: 100% 32px;
      line-height: 32px;
    }

    .diary-content::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 65px;
      width: 2px;
      background-color: var(--margin-line);
      z-index: 2;
    }

    /* Actions Bar (Screen only) */
    .no-print-toolbar {
      position: sticky;
      top: 15px;
      z-index: 100;
      background: #191816;
      border: 1px solid #3d3731;
      padding: 10px 18px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      margin: 0 auto 25px auto;
      max-width: 820px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      color: #eae5df;
      font-family: sans-serif;
      font-size: 13px;
    }

    .no-print-toolbar button {
      background: #0d9488;
      color: #ffffff;
      border: none;
      padding: 7px 18px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .no-print-toolbar button:hover {
      background: #0f766e;
      transform: scale(1.02);
    }

    /* Diary Cover / Header */
    .diary-header {
      text-align: center;
      padding-bottom: 25px;
      margin-bottom: 35px;
      border-bottom: 2px dashed rgba(180, 160, 140, 0.6);
      position: relative;
    }

    .diary-title {
      font-family: 'Playfair Display', serif;
      font-size: 34px;
      font-weight: 700;
      color: #1e1b18;
      margin-bottom: 6px;
      line-height: 1.2;
    }

    .diary-subtitle {
      font-style: italic;
      color: #786658;
      font-size: 16px;
    }

    /* Diary Entry Articles */
    .diary-entry {
      margin-bottom: 42px;
      padding-bottom: 24px;
      border-bottom: 1px dotted rgba(180, 160, 140, 0.7);
      page-break-inside: avoid;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
    }

    .entry-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .entry-date {
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #1c1815;
    }

    .entry-dot {
      color: #a89a8e;
      font-size: 14px;
    }

    .entry-time {
      color: #7e6f64;
      font-size: 13px;
      font-family: sans-serif;
    }

    .mood-stamp {
      background: #f0e8dc;
      border: 1px solid #d8cbba;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-family: sans-serif;
      color: #4a3e35;
    }

    .entry-body {
      font-size: 17px;
      color: #241d1a;
      line-height: 32px;
      letter-spacing: 0.01em;
    }

    /* Attached Polaroid Photo */
    .polaroid-photo {
      background: #ffffff;
      padding: 10px 10px 22px 10px;
      border-radius: 3px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
      max-width: 300px;
      margin: 16px 0 20px 0;
      transform: rotate(-1.5deg);
      border: 1px solid #e0d8cc;
      position: relative;
    }

    .polaroid-photo::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 35%;
      width: 75px;
      height: 18px;
      background: var(--tape-color);
      transform: rotate(2deg);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 2px dashed rgba(0,0,0,0.1);
      border-right: 2px dashed rgba(0,0,0,0.1);
    }

    .polaroid-photo img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 2px;
    }

    .polaroid-caption {
      font-family: 'Caveat', cursive;
      font-size: 15px;
      color: #554433;
      text-align: center;
      margin-top: 8px;
    }

    /* Tags Row */
    .tags-row {
      margin-top: 12px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .tag-chip {
      font-size: 11px;
      font-family: sans-serif;
      color: #6e5e52;
      background: rgba(220, 205, 185, 0.45);
      padding: 1px 8px;
      border-radius: 4px;
    }

    /* Signature Sign-off */
    .diary-signoff {
      margin-top: 50px;
      padding-top: 25px;
      border-top: 2px solid rgba(180, 160, 140, 0.5);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .signature-box {
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: #2b221d;
      border-top: 1px solid #735d4f;
      padding-top: 4px;
      min-width: 160px;
      text-align: center;
    }

    /* Print & PDF Layout */
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .diary-book {
        box-shadow: none !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .diary-book::before {
        display: none !important;
      }
      .diary-content {
        padding: 20px !important;
      }
      .diary-entry {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 820px;">
    <!-- Screen-only toolbar for 1-click printing & saving as PDF -->
    <div class="no-print-toolbar">
      <span>📖 <strong>${escapeHtml(userName)}'s Daily Diary</strong> (${sortedEntries.length} entries)</span>
      <div style="display: flex; gap: 8px;">
        <button onclick="window.print()">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>

    <!-- The Realistic Lined Diary Book -->
    <main class="diary-book">
      <div class="diary-content">
        <!-- Header / Cover Title -->
        <header class="diary-header">
          <h1 class="diary-title">${escapeHtml(userName)}'s Daily Diary</h1>
          <p class="diary-subtitle">Personal reflections & memories</p>
        </header>

        <!-- Chronological Diary Entries -->
        <section class="diary-entries-flow">
          ${entriesHtml || '<p style="text-align:center; padding: 40px; color: #887766;">No entries written yet.</p>'}
        </section>

        <!-- Signature Signoff -->
        <footer class="diary-signoff">
          <div style="font-size: 12px; color: #8a7a70;">
            Exported on ${exportDate}
          </div>
          <div class="signature-box">
            — ${escapeHtml(userName)}
          </div>
        </footer>
      </div>
    </main>
  </div>
</body>
</html>`;
}

/**
 * Formats journal entries into a clean vintage plain-text diary file (.txt)
 */
export function generatePlainTextDiary(entries: JournalEntry[], user: UserProfile): string {
  const userName = user.name || 'My';
  const exportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let doc = '';
  doc += `========================================================================\n`;
  doc += `                              DAILY DIARY                               \n`;
  doc += `========================================================================\n`;
  doc += `Author:      ${userName}\n`;
  doc += `Exported:    ${exportDate}\n`;
  doc += `Total:       ${sortedEntries.length} entries\n`;
  doc += `========================================================================\n\n`;

  sortedEntries.forEach((entry, idx) => {
    const d = new Date(entry.timestamp);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const moodStr = entry.mood ? `[Mood: ${entry.mood.toUpperCase()}]` : '';
    const tagsStr = entry.tags && entry.tags.length > 0 ? `[Tags: #${entry.tags.join(', #')}]` : '';

    doc += `------------------------------------------------------------------------\n`;
    doc += `[#${idx + 1}] ${dateStr} • ${timeStr}  ${moodStr} ${tagsStr}\n`;
    doc += `------------------------------------------------------------------------\n`;
    if (entry.imageUrl) {
      doc += `[Attached Photo: Yes]\n`;
    }
    doc += `\n${entry.content.trim()}\n\n`;
  });

  doc += `========================================================================\n`;
  doc += `                         END OF DIARY                                   \n`;
  doc += `========================================================================\n`;

  return doc;
}

/**
 * Formats journal entries into a clean Markdown journal (.md)
 */
export function generateMarkdownDiary(entries: JournalEntry[], user: UserProfile): string {
  const userName = user.name || 'My';
  const exportDate = new Date().toISOString();

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let md = `---
title: "${userName}'s Daily Diary"
exported_at: "${exportDate}"
total_entries: ${sortedEntries.length}
---

# 📖 ${userName}'s Daily Diary

---

`;

  sortedEntries.forEach((entry) => {
    const d = new Date(entry.timestamp);
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const moodConfig = entry.mood ? MOOD_CONFIGS.find((m) => m.id === entry.mood) : null;
    const moodStr = moodConfig ? ` • ${moodConfig.emoji} *${moodConfig.label}*` : '';

    md += `### ${dateStr} • ${timeStr}${moodStr}\n\n`;

    if (entry.imageUrl) {
      md += `![Diary Memory](${entry.imageUrl})\n\n`;
    }

    md += `${entry.content.trim()}\n\n`;

    if (entry.tags && entry.tags.length > 0) {
      md += `*Tags:* ${entry.tags.map((t) => `\`#${t}\``).join(' ')}\n\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Triggers a direct file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
