"use client";

import { useState, useTransition } from "react";
import {
  deleteTask,
  setCategory,
  setNextAction,
  setOffenseDefense,
  setStatus,
  setTaskProject,
  touchTask,
  updateTaskAction,
} from "@/app/actions";
import {
  CATEGORY_SUGGESTIONS,
  isOverdue,
  LEVEL_OPTIONS,
  OFFENSE_DEFENSE_OPTIONS,
  STATUS_OPTIONS,
  type Project,
  type ProjectStatus,
  type Task,
} from "@/lib/gtd";

function levelBadgeClass(level: string | null) {
  const v = (level || "").toLowerCase();
  if (v === "high") return "bg-danger-bg text-danger";
  if (v === "medium-high") return "bg-warning-bg text-warning";
  if (v === "medium") return "bg-info-bg text-info";
  if (v === "low") return "bg-card-border/60 text-muted";
  return "hidden";
}

export default function TaskItem({
  task,
  categories,
  contexts,
  projects = [],
  projectStatusById,
  defaultOpen = false,
}: {
  task: Task;
  categories: string[];
  contexts: string[];
  projects?: Project[];
  projectStatusById?: Map<string, ProjectStatus>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isPending, startTransition] = useTransition();
  const overdue = isOverdue(task) && task.status.toLowerCase() !== "done";
  const project = task.project_id
    ? projects.find((p) => p.id === task.project_id)
    : undefined;
  const projectStatus = task.project_id
    ? projectStatusById?.get(task.project_id)
    : undefined;

  function quickStatus(status: string) {
    startTransition(() => setStatus(task.id, status));
  }

  function quickCategory(category: string) {
    startTransition(() => setCategory(task.id, category));
  }

  function quickOffenseDefense(value: string) {
    startTransition(() =>
      setOffenseDefense(task.id, task.offense_defense === value ? null : value)
    );
  }

  function quickProject(projectId: string) {
    startTransition(() => setTaskProject(task.id, projectId || null));
  }

  function quickMakeNextAction() {
    startTransition(() => setNextAction(task.id, true));
  }

  function handleTouch() {
    startTransition(() => touchTask(task.id));
  }

  function handleDelete() {
    if (!confirm(`Delete "${task.task}"?`)) return;
    startTransition(() => deleteTask(task.id));
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateTaskAction(formData);
      setOpen(false);
    });
  }

  return (
    <li className="rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
            {project && (
              <span className="rounded-full bg-card-border/40 px-2 py-0.5 text-[11px] text-muted">
                📁 {project.name}
              </span>
            )}
            {task.is_next_action && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                ★ Next for project
              </span>
            )}
            {task.importance && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${levelBadgeClass(
                  task.importance
                )}`}
              >
                Importance: {task.importance}
              </span>
            )}
            {task.urgency && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${levelBadgeClass(
                  task.urgency
                )}`}
              >
                Urgency: {task.urgency}
              </span>
            )}
            {task.due_date && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  overdue ? "bg-danger-bg text-danger" : "bg-card-border/60 text-muted"
                }`}
              >
                {overdue ? "Overdue " : "Due "}
                {task.due_date}
              </span>
            )}
          </div>
          {task.notes && (
            <p className="mt-1 text-xs text-muted">{task.notes}</p>
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
          {task.status.toLowerCase() !== "done" && (
            <button
              type="button"
              onClick={() => quickStatus("Done")}
              disabled={isPending}
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground"
            >
              ✓ Done
            </button>
          )}
          {task.status.toLowerCase() !== "waiting" && (
            <button
              type="button"
              onClick={() => quickStatus("Waiting")}
              disabled={isPending}
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
            >
              Waiting For
            </button>
          )}
          {task.status.toLowerCase() !== "someday" && (
            <button
              type="button"
              onClick={() => quickStatus("Someday")}
              disabled={isPending}
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
            >
              Someday / Maybe
            </button>
          )}
          {task.status.toLowerCase() !== "open" && (
            <button
              type="button"
              onClick={() => quickStatus("Open")}
              disabled={isPending}
              className="rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40"
            >
              Reactivate
            </button>
          )}
          <button
            type="button"
            onClick={handleTouch}
            disabled={isPending}
            className="rounded-md border border-card-border px-2 py-1 text-xs text-muted hover:bg-card-border/40"
            title="Mark as reviewed without changing anything"
          >
            Still relevant
          </button>
        </div>
      )}

      {!open && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted">Classify:</span>
          {CATEGORY_SUGGESTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => quickCategory(c)}
              disabled={isPending}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                task.category === c
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-card-border text-muted hover:bg-card-border/40"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="mx-1 text-card-border">|</span>
          {OFFENSE_DEFENSE_OPTIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => quickOffenseDefense(o)}
              disabled={isPending}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                task.offense_defense === o
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-card-border text-muted hover:bg-card-border/40"
              }`}
            >
              {o}
            </button>
          ))}
          {projects.length > 0 && (
            <>
              <span className="mx-1 text-card-border">|</span>
              <span className="text-[11px] text-muted">Project:</span>
              <select
                value={task.project_id ?? ""}
                onChange={(e) => quickProject(e.target.value)}
                disabled={isPending}
                className="rounded-full border border-card-border bg-background px-2 py-0.5 text-[11px] outline-none focus:border-accent"
              >
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {!open && project && projectStatus === "Someday/Maybe" && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md bg-warning-bg px-2 py-1 text-[11px] text-warning">
          <span>
            &ldquo;{project.name}&rdquo; has no next task yet — it reads as
            Someday/Maybe.
          </span>
          {!task.is_next_action && (
            <button
              type="button"
              onClick={quickMakeNextAction}
              disabled={isPending}
              className="ml-auto shrink-0 rounded-full border border-warning px-2 py-0.5 font-medium hover:bg-warning/15"
            >
              Make this the next task
            </button>
          )}
        </div>
      )}

      {open && (
        <form
          action={handleSave}
          className="mt-3 grid grid-cols-2 gap-2 border-t border-card-border pt-3 sm:grid-cols-4"
        >
          <input type="hidden" name="id" value={task.id} />
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-4">
            <span className="text-[11px] text-muted">Task</span>
            <input
              name="task"
              defaultValue={task.task}
              required
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Category</span>
            <input
              name="category"
              defaultValue={task.category}
              list="known-categories"
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Status</span>
            <select
              name="status"
              defaultValue={STATUS_OPTIONS.includes(
                task.status as (typeof STATUS_OPTIONS)[number]
              )
                ? task.status
                : "Open"}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Importance</span>
            <select
              name="importance"
              defaultValue={task.importance ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l || "none"} value={l}>
                  {l || "—"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Urgency</span>
            <select
              name="urgency"
              defaultValue={task.urgency ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l || "none"} value={l}>
                  {l || "—"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Due date</span>
            <input
              type="date"
              name="due_date"
              defaultValue={task.due_date ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Context</span>
            <input
              name="context"
              defaultValue={task.context ?? ""}
              list="known-contexts"
              placeholder="e.g. Desk"
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Offense / Defense</span>
            <select
              name="offense_defense"
              defaultValue={task.offense_defense ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="">—</option>
              {OFFENSE_DEFENSE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Project</span>
            <select
              name="project_id"
              defaultValue={task.project_id ?? ""}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end pb-1.5">
            <input
              type="checkbox"
              name="is_next_action"
              defaultChecked={task.is_next_action}
              className="h-3.5 w-3.5"
            />
            <span className="text-[11px] text-muted">
              Next task for this project
            </span>
          </label>
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-4">
            <span className="text-[11px] text-muted">Notes</span>
            <textarea
              name="notes"
              defaultValue={task.notes ?? ""}
              rows={2}
              className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <div className="col-span-2 flex gap-2 sm:col-span-4">
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
          <datalist id="known-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <datalist id="known-contexts">
            {contexts.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </form>
      )}
    </li>
  );
}
