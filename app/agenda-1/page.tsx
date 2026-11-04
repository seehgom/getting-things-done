import { getTasks } from "@/lib/tasks";
import {
  formatAgendaDate,
  isoDate,
  tasksForDate,
  unscheduledOpenTasks,
} from "@/lib/agenda";
import { applyManualOrder, CATEGORY_SUGGESTIONS } from "@/lib/gtd";
import AgendaChecklist from "@/components/agenda/AgendaChecklist";
import DateTabs from "@/components/agenda/DateTabs";

export default async function AgendaListPage({
  searchParams,
}: {
  searchParams: Promise<{ when?: string }>;
}) {
  const [allTasks, sp] = await Promise.all([getTasks(), searchParams]);
  const when = sp.when === "tomorrow" ? "tomorrow" : "today";
  const date = isoDate(when === "tomorrow" ? 1 : 0);

  const scheduled = applyManualOrder(tasksForDate(allTasks, date));
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
          Daily Agenda — Option 1: Checklist
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatAgendaDate(date)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          A plain, drag-to-reorder list of what you&apos;re doing {when}.
          Checking a task off moves it to History, same as everywhere else.
        </p>
      </div>

      <DateTabs basePath="/agenda-1" when={when} />

      <AgendaChecklist
        date={date}
        scheduled={scheduled}
        unscheduled={unscheduled}
        categories={categories}
      />
    </div>
  );
}
