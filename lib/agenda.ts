import type { Task } from "@/lib/gtd";

/** Suggested time-of-day buckets for the time-blocked agenda layout.
 * Free text in the DB (like context/category), not a hard constraint. */
export const AGENDA_SLOTS = ["Morning", "Afternoon", "Evening", "Anytime"] as const;
export type AgendaSlot = (typeof AGENDA_SLOTS)[number];

export function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Parses a plain "YYYY-MM-DD" as a local date rather than UTC midnight,
 * so the weekday shown matches the date even near a timezone boundary. */
export function formatAgendaDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function tasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.agenda_date === date);
}

/** Open, top-level tasks not yet on any day's agenda — the pool a picker
 * offers to pull from onto today's/tomorrow's plan. */
export function unscheduledOpenTasks(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      !t.agenda_date &&
      !t.parent_task_id &&
      t.status.toLowerCase() !== "done"
  );
}
