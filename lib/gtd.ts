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
  offense_defense: string | null;
  /** A GTD "project" is just a task promoted to hold other tasks as its
   * actions (see `parent_task_id`) — there's no separate projects table. */
  is_project: boolean;
  /** Set on an action that belongs to a project — points at the project's
   * own task id. */
  parent_task_id: string | null;
  /** For an action (parent_task_id set): is this the one action ready to
   * do right now? A project with no such action reads as Someday/Maybe —
   * see projectBucket(). */
  is_next_action: boolean;
  created_at: string;
  updated_at: string;
};

/** A task that's been marked Done and moved out of `tasks` into the
 * `completed_tasks` archive — see lib/tasks.ts#getCompletedTasks. */
export type CompletedTask = Task & { completed_at: string };

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
 * "Offense" (proactively moving a goal forward) vs "Defense" (keeping
 * existing commitments from slipping) — a second, orthogonal way to
 * classify a task alongside `category`. Unlike category/context this is a
 * fixed two-option classification rather than open-ended free text.
 */
export const OFFENSE_DEFENSE_OPTIONS = ["Offense", "Defense"] as const;

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

export function childrenOf(taskId: string, tasks: Task[]): Task[] {
  return tasks.filter((t) => t.parent_task_id === taskId);
}

/**
 * A project's own bucket isn't taken from its own urgency/importance/due
 * date — it's derived from its actions. An explicit Done/Waiting status on
 * the project itself still wins; otherwise a project with at least one
 * ready (not done/waiting) action flagged `is_next_action` is doable now
 * ("next"), and a project with no such action reads as Someday/Maybe.
 */
export function projectBucket(project: Task, tasks: Task[]): Bucket {
  const own = classify(project);
  if (own === "done" || own === "waiting") return own;
  const hasReadyNextAction = tasks.some(
    (t) =>
      t.parent_task_id === project.id &&
      t.is_next_action &&
      classify(t) !== "done" &&
      classify(t) !== "waiting"
  );
  return hasReadyNextAction ? "next" : "someday";
}

/** classify() for a plain task, projectBucket() for one promoted to a
 * project — use this wherever a task list is bucketed for display. */
export function effectiveBucket(task: Task, tasks: Task[]): Bucket {
  return task.is_project ? projectBucket(task, tasks) : classify(task);
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

/** Preset windows for the History page's performance breakdown. */
export const HISTORY_RANGES = [
  { key: "7d", label: "Last week", days: 7 },
  { key: "30d", label: "Last month", days: 30 },
  { key: "90d", label: "Last 3 months", days: 90 },
  { key: "180d", label: "Last 6 months", days: 180 },
  { key: "365d", label: "Last year", days: 365 },
  { key: "all", label: "All time", days: null },
] as const;

export type HistoryRangeKey = (typeof HISTORY_RANGES)[number]["key"];

export function resolveHistoryRange(key?: string) {
  return HISTORY_RANGES.find((r) => r.key === key) ?? HISTORY_RANGES[1];
}

export function filterCompletedByRange(
  tasks: CompletedTask[],
  days: number | null
): CompletedTask[] {
  if (days === null) return tasks;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return tasks.filter((t) => new Date(t.completed_at).getTime() >= cutoff);
}

/** Groups tasks by a key, sorted by count descending. */
export function countBy<T>(
  items: T[],
  keyFn: (item: T) => string
): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}
