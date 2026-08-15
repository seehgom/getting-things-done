import FilterBar from "@/components/FilterBar";
import Section from "@/components/Section";
import TaskItem from "@/components/TaskItem";
import { getTasks } from "@/lib/tasks";
import {
  CATEGORY_SUGGESTIONS,
  CONTEXT_SUGGESTIONS,
  classify,
  isOverdue,
  isStale,
} from "@/lib/gtd";

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; context?: string }>;
}) {
  const [allTasks, sp] = await Promise.all([getTasks(), searchParams]);

  const selectedCategory = sp.category?.trim() || undefined;
  const selectedContext = sp.context?.trim() || undefined;

  const categoriesInUse = Array.from(
    new Set(allTasks.map((t) => t.category?.trim()).filter(Boolean))
  ).sort();
  const categories = Array.from(
    new Set([...CATEGORY_SUGGESTIONS, ...categoriesInUse])
  ).sort();
  const contextsInUse = Array.from(
    new Set(
      allTasks
        .map((t) => t.context?.trim())
        .filter((c): c is string => Boolean(c))
    )
  ).sort();
  const contextOptions = Array.from(
    new Set([...CONTEXT_SUGGESTIONS, ...contextsInUse])
  ).sort();

  const tasks = allTasks.filter(
    (t) =>
      (!selectedCategory || t.category === selectedCategory) &&
      (!selectedContext || t.context === selectedContext)
  );

  const notDone = tasks.filter((t) => classify(t) !== "done");
  const overdue = notDone.filter(isOverdue);
  const stale = notDone.filter((t) => isStale(t) && !isOverdue(t));
  const waiting = tasks.filter((t) => classify(t) === "waiting");
  const someday = tasks.filter((t) => classify(t) === "someday");
  const inbox = tasks.filter((t) => classify(t) === "inbox");

  const allClear =
    overdue.length === 0 &&
    stale.length === 0 &&
    waiting.length === 0 &&
    inbox.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Weekly Review
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Allen calls this the linchpin of the whole system: get current,
          then get creative. Clear what&apos;s stalled, check what
          you&apos;re waiting on, and decide whether anything parked for
          someday deserves to move. Skipping this is what lets an
          otherwise-good system quietly go stale.
        </p>
      </div>

      {allClear && (
        <p className="rounded-lg border border-card-border bg-card px-4 py-3 text-sm text-muted">
          Everything&apos;s current — no overdue items, no stalled next
          actions, nothing waiting on a follow-up, and nothing left
          unclarified in the inbox. Mind like water.
        </p>
      )}

      <FilterBar
        basePath="/review"
        categories={categories}
        contexts={contextsInUse}
        selectedCategory={selectedCategory}
        selectedContext={selectedContext}
      />

      <Section
        icon="🔥"
        title="Overdue"
        description="Past their due date and not done. Reschedule, do them, or explicitly park them."
        count={overdue.length}
      >
        {overdue.length === 0 ? (
          <Empty text="Nothing overdue." />
        ) : (
          <ul className="space-y-2">
            {overdue.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="🧊"
        title="Stalled Next Actions"
        description="Open or Inbox items untouched for 7+ days. Often the 'next action' is actually vague — rewrite it as a single concrete step, per Allen's example of 'sort out vendor contract' becoming 'email vendor to request updated contract draft.'"
        count={stale.length}
      >
        {stale.length === 0 ? (
          <Empty text="Nothing has gone stale this week." />
        ) : (
          <ul className="space-y-2">
            {stale.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="⏳"
        title="Waiting For — check in?"
        description="Things you delegated or are expecting from someone else. Decide if any follow-ups are due."
        count={waiting.length}
      >
        {waiting.length === 0 ? (
          <Empty text="Nothing pending on other people." />
        ) : (
          <ul className="space-y-2">
            {waiting.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="🌒"
        title="Someday / Maybe — anything ready?"
        description="Skim for anything that now feels like the right time to promote to an active next action."
        count={someday.length}
        defaultOpen={someday.length > 0}
      >
        {someday.length === 0 ? (
          <Empty text="Nothing parked for someday." />
        ) : (
          <ul className="space-y-2">
            {someday.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="📥"
        title="Still Unclarified"
        description="Captured but never processed into a next action, category, or someday decision."
        count={inbox.length}
        defaultOpen={inbox.length > 0}
      >
        {inbox.length === 0 ? (
          <Empty text="Inbox is fully processed." />
        ) : (
          <ul className="space-y-2">
            {inbox.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
      {text}
    </p>
  );
}
