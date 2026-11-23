"use client";

import { useState, useTransition } from "react";
import { updateGoal } from "@/app/harada/actions";
import type { HaradaGoal } from "@/lib/harada";

const STATUS_OPTIONS = ["Active", "Achieved", "Archived"] as const;

export default function GoalHeader({ goal }: { goal: HaradaGoal }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateGoal(goal.id, {
        title: String(formData.get("title") ?? "").trim(),
        why: String(formData.get("why") ?? "").trim() || null,
        target_date: String(formData.get("target_date") ?? "").trim() || null,
        status: String(formData.get("status") ?? "Active"),
        notes: String(formData.get("notes") ?? "").trim() || null,
      });
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{goal.title}</h1>
            {goal.why && <p className="mt-1 text-sm text-muted">{goal.why}</p>}
            <p className="mt-1 text-xs text-muted">
              {goal.status}
              {goal.target_date && ` · due ${goal.target_date}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
          >
            Edit
          </button>
        </div>
        {goal.notes && <p className="mt-2 text-xs text-muted">{goal.notes}</p>}
      </div>
    );
  }

  return (
    <form
      action={handleSave}
      className="grid grid-cols-1 gap-2 rounded-xl border border-card-border bg-card p-4 shadow-sm sm:grid-cols-2"
    >
      <label className="col-span-1 flex flex-col gap-1 sm:col-span-2">
        <span className="text-[11px] text-muted">Goal</span>
        <input
          name="title"
          defaultValue={goal.title}
          required
          className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>
      <label className="col-span-1 flex flex-col gap-1 sm:col-span-2">
        <span className="text-[11px] text-muted">Why it matters</span>
        <input
          name="why"
          defaultValue={goal.why ?? ""}
          className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-muted">Target date</span>
        <input
          type="date"
          name="target_date"
          defaultValue={goal.target_date ?? ""}
          className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-muted">Status</span>
        <select
          name="status"
          defaultValue={goal.status}
          className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-1 flex flex-col gap-1 sm:col-span-2">
        <span className="text-[11px] text-muted">Notes</span>
        <textarea
          name="notes"
          defaultValue={goal.notes ?? ""}
          rows={2}
          className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
      </label>
      <div className="col-span-1 flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-card-border px-3 py-1.5 text-xs hover:bg-card-border/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
