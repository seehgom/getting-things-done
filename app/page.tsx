import { currentUser } from "@clerk/nextjs/server";
import FilterBar from "@/components/FilterBar";
import QuickCapture from "@/components/QuickCapture";
import Section from "@/components/Section";
import TaskItem from "@/components/TaskItem";
import { getTasks } from "@/lib/tasks";
import {
  CONTEXT_SUGGESTIONS,
  classify,
  groupByCategory,
  sortNextActions,
} from "@/lib/gtd";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; context?: string }>;
}) {
  const [user, allTasks, sp] = await Promise.all([
    currentUser(),
    getTasks(),
    searchParams,
  ]);

  const selectedCategory = sp.category?.trim() || undefined;
  const selectedContext = sp.context?.trim() || undefined;

  const categories = Array.from(
    new Set(allTasks.map((t) => t.category?.trim()).filter(Boolean))
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

  const buckets = { inbox: [], next: [], waiting: [], someday: [], done: [] } as Record<
    string,
    typeof tasks
  >;
  for (const t of tasks) buckets[classify(t)].push(t);

  const nextByCategory = groupByCategory(sortNextActions(buckets.next));
  const doneRecent = [...buckets.done]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 15);

  const firstName = user?.firstName ?? "there";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi {firstName} — {today}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Capture everything, clarify it into a next action, and trust the
          list instead of your head. That&apos;s the whole system.
        </p>
      </div>

      <FilterBar
        basePath="/"
        categories={categories}
        contexts={contextsInUse}
        selectedCategory={selectedCategory}
        selectedContext={selectedContext}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Inbox" value={buckets.inbox.length} tone="warning" />
        <StatCard label="Next Actions" value={buckets.next.length} tone="accent" />
        <StatCard label="Waiting For" value={buckets.waiting.length} tone="info" />
        <StatCard label="Someday / Maybe" value={buckets.someday.length} tone="muted" />
      </div>

      <QuickCapture categories={categories} contexts={contextOptions} />

      <Section
        icon="📥"
        title="Inbox"
        description="Captured but not yet clarified — no urgency, importance, or due date set. Ask: is it actionable? What's the next physical action?"
        count={buckets.inbox.length}
      >
        {buckets.inbox.length === 0 ? (
          <EmptyState text="Inbox zero. Nothing waiting to be clarified." />
        ) : (
          <ul className="space-y-2">
            {buckets.inbox.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="⚡"
        title="Next Actions"
        description="Clarified, actionable items — grouped by context, sorted by importance and urgency."
        count={buckets.next.length}
      >
        {nextByCategory.size === 0 ? (
          <EmptyState text="No active next actions. Clarify something from your Inbox." />
        ) : (
          <div className="space-y-4">
            {Array.from(nextByCategory.entries()).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {items.map((t) => (
                    <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        icon="⏳"
        title="Waiting For"
        description="Things you're expecting from someone else. Review these on your own schedule instead of trusting memory."
        count={buckets.waiting.length}
      >
        {buckets.waiting.length === 0 ? (
          <EmptyState text="Nothing pending on other people right now." />
        ) : (
          <ul className="space-y-2">
            {buckets.waiting.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="🌒"
        title="Someday / Maybe"
        description="Not committed to right now — reviewed periodically so 'not now' doesn't quietly become 'never'."
        count={buckets.someday.length}
        defaultOpen={false}
      >
        {buckets.someday.length === 0 ? (
          <EmptyState text="Nothing parked for someday." />
        ) : (
          <ul className="space-y-2">
            {buckets.someday.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon="✅"
        title="Recently Done"
        count={buckets.done.length}
        defaultOpen={false}
      >
        {doneRecent.length === 0 ? (
          <EmptyState text="Nothing completed yet." />
        ) : (
          <ul className="space-y-2">
            {doneRecent.map((t) => (
              <TaskItem key={t.id} task={t} categories={categories} contexts={contextOptions} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "warning" | "info" | "muted";
}) {
  const toneClass = {
    accent: "text-accent",
    warning: "text-warning",
    info: "text-info",
    muted: "text-muted",
  }[tone];
  return (
    <div className="rounded-xl border border-card-border bg-card px-4 py-3 shadow-sm">
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
      {text}
    </p>
  );
}
