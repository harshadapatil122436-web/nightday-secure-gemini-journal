/**
 * Utility to normalize line breaks and clean text strings.
 * Handles both actual newlines and escaped "\\n" sequences that may occur
 * in JSON payloads or AI-generated completions.
 */
export function formatJournalText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}
