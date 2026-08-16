"use client";

import { useState, useTransition } from "react";
import {
  deleteHorizon,
  setHorizonStatus,
  updateHorizonAction,
} from "@/app/horizons/actions";
import type { Horizon } from "@/lib/horizons";

export default function HorizonItem({ horizon }: { horizon: Horizon }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${horizon.title}"?`)) return;
    startTransition(() => deleteHorizon(horizon.id));
  }

  function handleArchiveToggle() {
    const next = horizon.status === "Archived" ? "Active" : "Archived";
    startTransition(() => setHorizonStatus(horizon.id, next));
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateHorizonAction(formData);
      setOpen(false);
    });
  }

  return (
    <li className="rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`font-medium ${
                horizon.status === "Archived" ? "text-muted line-through" : ""
              }`}
            >
              {horizon.title}
            </span>
            {horizon.status === "Someday" && (
              <span className="rounded-full bg-card-border/60 px-2 py-0.5 text-[11px] text-muted">
                Someday
              </span>
            )}
          </div>
          {horizon.notes && (
            <p className="mt-1 text-xs text-muted">{horizon.notes}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={isPending}
            className="rounded-md px-2 py-1 text-xs text-muted hover:bg-card-border/40"
          >
            {open ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md px-2 py-1 text-xs text-danger hover:bg-danger-bg"
          >
            Delete
          </button>
        </div>
      </div>

      {!open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={isPending}
            className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
          >
            {horizon.status === "Archived" ? "Reactivate" : "Archive"}
          </button>
          {horizon.status !== "Someday" && horizon.status !== "Archived" && (
            <button
              type="button"
              onClick={() =>
                startTransition(() => setHorizonStatus(horizon.id, "Someday"))
              }
              disabled={isPending}
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
            >
              Someday / Maybe
            </button>
          )}
        </div>
      )}

      {open && (
        <form
          action={handleSave}
          className="mt-3 grid grid-cols-1 gap-2 border-t border-card-border pt-3 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={horizon.id} />
          <label className="col-span-1 flex flex-col gap-1 sm:col-span-2">
            <span className="text-[11px] text-muted">Title</span>
            <input
              name="title"
              defaultValue={horizon.title}
              required
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Status</span>
            <select
              name="status"
              defaultValue={horizon.status}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="Active">Active</option>
              <option value="Someday">Someday</option>
              <option value="Archived">Archived</option>
            </select>
          </label>
          <label className="col-span-1 flex flex-col gap-1 sm:col-span-2">
            <span className="text-[11px] text-muted">Notes</span>
            <textarea
              name="notes"
              defaultValue={horizon.notes ?? ""}
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
      )}
    </li>
  );
}
