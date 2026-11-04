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

export default async function AgendaTimelinePage({
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
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Daily Agenda — Option 3: Time-blocked schedule
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatAgendaDate(date)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Lay {when}&apos;s tasks across Morning/Afternoon/Evening instead of
          one flat list — good if you think in blocks of the day rather than
          by category.
        </p>
      </div>

      <DateTabs basePath="/agenda-3" when={when} />

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
