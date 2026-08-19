import Link from "next/link";
import Section from "@/components/Section";
import { getCompletedTasks } from "@/lib/tasks";
import {
  countBy,
  filterCompletedByRange,
  HISTORY_RANGES,
  resolveHistoryRange,
  type CompletedTask,
} from "@/lib/gtd";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const [completed, sp] = await Promise.all([getCompletedTasks(), searchParams]);

  const range = resolveHistoryRange(sp.range);
  const inRange = filterCompletedByRange(completed, range.days);

  const byCategory = countBy(inRange, (t) => t.category?.trim() || "Uncategorized");
  const byMode = countBy(
    inRange,
    (t) => t.offense_defense?.trim() || "Unclassified"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Every task you mark Done moves out of your active list and lands
          here. Use it to see what you actually got done — and whether it
          skewed Work, Home, or Shopping, and Offense (moving something
          forward) or Defense (keeping a commitment from slipping).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {HISTORY_RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/history?range=${r.key}`}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              r.key === range.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-card-border text-muted hover:bg-card-border/40"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={range.label} value={inRange.length} tone="accent" />
        <StatCard label="All time" value={completed.length} tone="muted" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Breakdown title="By category" rows={byCategory} total={inRange.length} />
        <Breakdown
          title="By offense / defense"
          rows={byMode}
          total={inRange.length}
        />
      </div>

      <Section
        icon="✅"
        title="Completed tasks"
        description={`${range.label}, most recent first.`}
        count={inRange.length}
      >
        {inRange.length === 0 ? (
          <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
            Nothing completed in this window yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {inRange.map((t) => (
              <CompletedRow key={t.id} task={t} />
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
  tone: "accent" | "muted";
}) {
  const toneClass = tone === "accent" ? "text-accent" : "text-muted";
  return (
    <div className="rounded-xl border border-card-border bg-card px-4 py-3 shadow-sm">
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { key: string; count: number }[];
  total: number;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-muted">Nothing to show yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const pct = total === 0 ? 0 : Math.round((r.count / total) * 100);
            return (
              <li key={r.key} className="text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{r.key}</span>
                  <span className="text-muted">
                    {r.count} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-card-border/50">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CompletedRow({ task }: { task: CompletedTask }) {
  return (
    <li className="rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium">{task.task}</span>
        <span className="rounded-full border border-card-border px-2 py-0.5 text-[11px] text-muted">
          {task.category}
        </span>
        {task.context && (
          <span className="rounded-full border border-card-border bg-card-border/30 px-2 py-0.5 text-[11px] text-muted">
            @{task.context}
          </span>
        )}
        {task.offense_defense && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              task.offense_defense === "Offense"
                ? "bg-accent/15 text-accent"
                : "bg-info-bg text-info"
            }`}
          >
            {task.offense_defense}
          </span>
        )}
        <span className="ml-auto text-[11px] text-muted">
          {new Date(task.completed_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      {task.notes && <p className="mt-1 text-xs text-muted">{task.notes}</p>}
    </li>
  );
}
