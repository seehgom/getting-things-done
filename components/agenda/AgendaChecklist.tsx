"use client";

import { useRef, useState, useTransition } from "react";
import { reorderTasks, setStatus } from "@/app/actions";
import { createAgendaTask, scheduleTask } from "@/app/agenda/actions";
import { useDragReorder } from "@/lib/useDragReorder";
import type { Task } from "@/lib/gtd";

export default function AgendaChecklist({
  date,
  scheduled,
  unscheduled,
  categories,
}: {
  date: string;
  scheduled: Task[];
  unscheduled: Task[];
  categories: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const { order, dragId, handleDragStart, handleDragOver, handleDragEnd, moveUp, moveToTop } =
    useDragReorder(scheduled, reorderTasks, startTransition);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-card-border bg-card p-3 shadow-sm">
        <p className="mb-2 text-xs font-medium text-muted">
          {order.length} task{order.length === 1 ? "" : "s"} planned
        </p>
        {order.length === 0 ? (
          <p className="rounded-lg border border-dashed border-card-border px-3 py-4 text-center text-xs text-muted">
            Nothing on the agenda yet — pull a task from your list or add one
            below.
          </p>
        ) : (
          <ul className="space-y-2">
            {order.map((task, index) => (
              <li
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragOver={(e) => handleDragOver(e, task.id)}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 rounded-lg border border-card-border bg-background px-3 py-2 text-sm ${
                  dragId === task.id ? "opacity-40" : ""
                }`}
              >
                <span aria-hidden className="cursor-grab text-muted" title="Drag to reorder">
                  ⠿
                </span>
                <input
                  type="checkbox"
                  checked={false}
                  disabled={isPending}
                  onChange={() => startTransition(() => setStatus(task.id, "Done"))}
                  className="h-4 w-4 accent-accent"
                  title="Mark done"
                />
                <span className="min-w-0 flex-1 truncate">{task.task}</span>
                <span className="shrink-0 rounded-full border border-card-border px-2 py-0.5 text-[11px] text-muted">
                  {task.category}
                </span>
                {index > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveToTop(task.id)}
                      disabled={isPending}
                      title="Move to top"
                      className="shrink-0 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-card-border/40"
                    >
                      ⤒
                    </button>
                    <button
                      type="button"
                      onClick={() => moveUp(task.id)}
                      disabled={isPending}
                      title="Move up"
                      className="shrink-0 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-card-border/40"
                    >
                      ↑
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => startTransition(() => scheduleTask(task.id, null))}
                  disabled={isPending}
                  title="Remove from this day's agenda"
                  className="shrink-0 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-card-border/40"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PullFromListForm date={date} unscheduled={unscheduled} />
      <QuickAddForm date={date} categories={categories} />
    </div>
  );
}

function PullFromListForm({
  date,
  unscheduled,
}: {
  date: string;
  unscheduled: Task[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState("");

  function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      await scheduleTask(selected, date);
      setSelected("");
    });
  }

  if (unscheduled.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-card-border bg-card p-3 shadow-sm">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="flex-1 rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent"
      >
        <option value="">Pull a task from your list…</option>
        {unscheduled.map((t) => (
          <option key={t.id} value={t.id}>
            {t.task} ({t.category})
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || !selected}
        className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
      >
        Add to this day
      </button>
    </div>
  );
}

function QuickAddForm({
  date,
  categories,
}: {
  date: string;
  categories: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createAgendaTask(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-card-border bg-card p-3 shadow-sm sm:flex-row"
    >
      <input type="hidden" name="agenda_date" value={date} />
      <input
        name="task"
        required
        placeholder="Add a new task for this day…"
        autoComplete="off"
        className="flex-1 rounded-md border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
      />
      <input
        name="category"
        list="agenda-categories"
        placeholder="Category"
        className="rounded-md border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent sm:w-36"
      />
      <datalist id="agenda-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-md border border-card-border px-3 py-1.5 text-sm hover:bg-card-border/40 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
