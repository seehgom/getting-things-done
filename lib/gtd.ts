export type Task = {
  id: string;
  category: string;
  task: string;
  notes: string | null;
  urgency: string | null;
  importance: string | null;
  due_date: string | null;
  date_added: string;
  status: string;
  context: string | null;
  created_at: string;
  updated_at: string;
};

export type Bucket = "inbox" | "next" | "waiting" | "someday" | "done";

export const STATUS_OPTIONS = ["Open", "Waiting", "Someday", "Done"] as const;
export const LEVEL_OPTIONS = ["", "Low", "Medium", "Medium-High", "High"] as const;

/**
 * GTD "context" is the tool/location a task requires, distinct from
 * `category` (an area of focus like Work/Home/Shopping). These are the
 * canonical suggestions offered alongside whatever contexts are already
 * in use, so the field doesn't start out empty.
 */
export const CONTEXT_SUGGESTIONS = [
  "Desk",
  "Computer",
  "Phone",
  "Errands",
  "Home",
  "Anywhere",
] as const;

/**
 * Canonical `category` suggestions, offered alongside whatever categories
 * are already in use so Work/Home/Shopping filters are always available
 * even before any task has been tagged with them.
 */
export const CATEGORY_SUGGESTIONS = ["Work", "Home", "Shopping"] as const;

/**
 * GTD's clarify step maps every captured item onto one of five outcomes.
 * We derive that outcome from the free-text `status` field (set by voice
 * dictation or the UI) plus whether urgency/importance/due_date have been
 * set at all — an item with none of those is still raw, unclarified input.
 */
export function classify(t: Task): Bucket {
  const s = (t.status || "").toLowerCase();
  if (s.includes("done") || s.includes("complete")) return "done";
  if (s.includes("waiting")) return "waiting";
  if (s.includes("someday") || s.includes("maybe")) return "someday";
  if (!t.urgency && !t.importance && !t.due_date) return "inbox";
  return "next";
}

const LEVEL_WEIGHT: Record<string, number> = {
  high: 3,
  "medium-high": 2.5,
  medium: 2,
  low: 1,
};

function levelWeight(v: string | null): number {
  if (!v) return 0;
  return LEVEL_WEIGHT[v.toLowerCase()] ?? 0;
}

export function isOverdue(t: Task): boolean {
  if (!t.due_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return t.due_date < today;
}

/** Higher score = more deserving of attention right now. */
export function priorityScore(t: Task): number {
  let score = levelWeight(t.importance) * 10 + levelWeight(t.urgency) * 3;
  if (isOverdue(t)) score += 100;
  return score;
}

export function sortNextActions(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const diff = priorityScore(b) - priorityScore(a);
    if (diff !== 0) return diff;
    const ad = a.due_date ?? "9999-99-99";
    const bd = b.due_date ?? "9999-99-99";
    return ad.localeCompare(bd);
  });
}

export function groupByCategory(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const key = t.category?.trim() || "Uncategorized";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

export function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function isStale(t: Task, days = 7): boolean {
  const bucket = classify(t);
  if (bucket !== "next" && bucket !== "inbox") return false;
  return daysSince(t.updated_at) >= days;
}
