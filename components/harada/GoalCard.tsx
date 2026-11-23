"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteGoal } from "@/app/harada/actions";
import type { HaradaGoal } from "@/lib/harada";

export default function GoalCard({
  goal,
  progress,
}: {
  goal: HaradaGoal;
  progress: { filled: number; total: number };
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete the goal "${goal.title}" and its whole matrix?`)) return;
    startTransition(() => deleteGoal(goal.id));
  }

  const pct = progress.total === 0 ? 0 : Math.round((progress.filled / progress.total) * 100);

  return (
    <li className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/harada/${goal.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium hover:text-accent">{goal.title}</p>
          {goal.why && <p className="mt-0.5 truncate text-xs text-muted">{goal.why}</p>}
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-danger hover:bg-danger-bg"
        >
          Delete
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-card-border/40">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-muted">
          {progress.filled}/{progress.total} cells filled
          {goal.target_date && ` · due ${goal.target_date}`}
          {goal.status !== "Active" && ` · ${goal.status}`}
        </p>
      </div>

      <Link
        href={`/harada/${goal.id}`}
        className="mt-3 inline-block text-xs text-accent hover:underline"
      >
        Open matrix →
      </Link>
    </li>
  );
}
