/**
 * Voice chat sometimes records more than one link for a single entry as
 * free text like "Skechers: https://a.example | Zappos: https://b.example"
 * instead of one URL — a plain <a href={driveLink}> breaks for those. This
 * pulls every URL out (with its label when one precedes it) so each can be
 * rendered as its own working link.
 *
 * No "server-only" import here (unlike lib/voiceNotes.ts) since this is a
 * pure function the client-side VoiceNoteItem also needs to call.
 */
export function parseLinks(raw: string | null): { label: string; url: string }[] {
  if (!raw) return [];
  return raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const labeled = part.match(/^(.*?):\s*(https?:\/\/\S+)$/);
      if (labeled) return { label: labeled[1].trim(), url: labeled[2].trim() };
      const bare = part.match(/https?:\/\/\S+/);
      return bare ? { label: "Open", url: bare[0] } : { label: part, url: "" };
    })
    .filter((l) => l.url);
}

/** The Google Drive folder Claude's voice chat uploads generated files
 * into — a fallback that always works even when an entry's own link is
 * missing or malformed. */
export const CLAUDE_ARTIFACTS_FOLDER_URL =
  "https://drive.google.com/drive/folders/1L5Y-NrbAQ1LG5MlvfCk31UHcwhbGm7C2";

const URL_PATTERN = /https?:\/\/[^\s<>"')]+/g;

/**
 * Splits free text on any URLs it contains, e.g. so a note that embeds a
 * YouTube link mid-paragraph can render that link as a real clickable
 * `<a>` instead of dead text. Trailing punctuation right after a URL
 * (".", ",", "?", …) is kept out of the link and returned as its own
 * plain segment, since prose often runs straight into it.
 */
export function splitOnUrls(text: string): { text: string; url?: string }[] {
  const segments: { text: string; url?: string }[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) segments.push({ text: text.slice(lastIndex, start) });

    const raw = match[0];
    const url = raw.replace(/[.,;:!?]+$/, "");
    segments.push({ text: url, url });
    if (url.length < raw.length) segments.push({ text: raw.slice(url.length) });

    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex) });
  return segments;
}
