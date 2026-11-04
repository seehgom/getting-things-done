"use client";

import { useRef, useState, useTransition } from "react";
import { reorderTasks, setStatus } from "@/app/actions";
import { createAgendaTask, scheduleTask } from "@/app/agenda/actions";
import { useDragReorder } from "@/lib/useDragReorder";
import { applyManualOrder } from "@/lib/gtd";
import type { Task } from "@/lib/gtd";

export default function AgendaBoard({
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
  return (
    <div className="space-y-4">
      <PullFromListForm date={date} unscheduled={unscheduled} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Column
            key={category}
            date={date}
            category={category}
            tasks={applyManualOrder(
              scheduled.filter((t) => t.category === category)
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  date,
  category,
  tasks,
}: {
  date: string;
  category: string;
  tasks: Task[];
}) {
  const [isPending, startTransition] = useTransition();
  const { order, dragId, handleDragStart, handleDragOver, handleDragEnd } =
    useDragReorder(tasks, reorderTasks, startTransition);
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await createAgendaTask(formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-card-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{category}</h3>
        <span className="rounded-full bg-card-border/40 px-2 py-0.5 text-[11px] text-muted">
          {order.length}
        </span>
      </div>

      {order.length === 0 ? (
        <p className="mb-2 rounded-lg border border-dashed border-card-border px-2 py-3 text-center text-[11px] text-muted">
          Nothing here yet
        </p>
      ) : (
        <ul className="mb-2 space-y-1.5">
          {order.map((task) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1.5 rounded-md border border-card-border bg-background px-2 py-1.5 text-xs ${
                dragId === task.id ? "opacity-40" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={false}
                disabled={isPending}
                onChange={() => startTransition(() => setStatus(task.id, "Done"))}
                className="h-3.5 w-3.5 accent-accent"
                title="Mark done"
              />
              <span className="min-w-0 flex-1 truncate">{task.task}</span>
              <button
                type="button"
                onClick={() => startTransition(() => scheduleTask(task.id, null))}
                disabled={isPending}
                title="Remove from this day's agenda"
                className="shrink-0 rounded-md px-1 text-muted hover:bg-card-border/40"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={handleAdd} className="mt-auto flex gap-1">
        <input type="hidden" name="agenda_date" value={date} />
        <input type="hidden" name="category" value={category} />
        <input
          name="task"
          placeholder="+ add"
          autoComplete="off"
          className="flex-1 rounded-md border border-card-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-md border border-card-border px-2 py-1 text-xs hover:bg-card-border/40 disabled:opacity-50"
        >
          Add
        </button>
      </form>
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
