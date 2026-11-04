import { getTasks } from "@/lib/tasks";
import {
  formatAgendaDate,
  isoDate,
  tasksForDate,
  unscheduledOpenTasks,
} from "@/lib/agenda";
import { CATEGORY_SUGGESTIONS } from "@/lib/gtd";
import AgendaBoard from "@/components/agenda/AgendaBoard";
import DateTabs from "@/components/agenda/DateTabs";

export default async function AgendaBoardPage({
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
          Daily Agenda — Option 2: Board by category
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatAgendaDate(date)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          What you&apos;re doing {when}, split into columns so you can see
          how the day balances across Work/Home/Shopping.
        </p>
      </div>

      <DateTabs basePath="/agenda-2" when={when} />

      <AgendaBoard
        date={date}
        scheduled={scheduled}
        unscheduled={unscheduled}
        categories={categories}
      />
    </div>
  );
}
