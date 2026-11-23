import { getTasks } from "@/lib/tasks";
import {
  AGENDA_SLOTS,
  formatAgendaDate,
  isoDate,
  tasksForDate,
  unscheduledOpenTasks,
} from "@/lib/agenda";
import { CATEGORY_SUGGESTIONS } from "@/lib/gtd";
import AgendaTimeline from "@/components/agenda/AgendaTimeline";
import DateTabs from "@/components/agenda/DateTabs";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ when?: string }>;
}) {
  const [allTasks, sp] = await Promise.all([getTasks(), searchParams]);
  const when = sp.when === "tomorrow" ? "tomorrow" : "today";
  const date = isoDate(when === "tomorrow" ? 1 : 0);

  const scheduled = tasksForDate(allTasks, date);
  const unscheduled = unscheduledOpenTasks(allTasks);
  const categoriesInUse = Array.from(
    new Set(allTasks.map((t) => t.category?.trim()).filter(Boolean))
  ).sort();
  const categories = Array.from(
    new Set([...CATEGORY_SUGGESTIONS, ...categoriesInUse])
  ).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatAgendaDate(date)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {when === "today" ? "Today" : "Tomorrow"}&apos;s plan, laid out
          across Morning/Afternoon/Evening/Anytime. Pull a task from your
          list or quick-add a new one straight onto a block; checking one
          off completes it the same way as everywhere else in the app.
        </p>
      </div>

      <DateTabs basePath="/agenda" when={when} />

      <AgendaTimeline
        date={date}
        scheduled={scheduled}
        unscheduled={unscheduled}
        categories={categories}
        slots={AGENDA_SLOTS}
      />
    </div>
  );
}
