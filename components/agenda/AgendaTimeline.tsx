"use client";

import { useRef, useState, useTransition } from "react";
import { setStatus } from "@/app/actions";
import { createAgendaTask, scheduleTask } from "@/app/agenda/actions";
import { applyManualOrder } from "@/lib/gtd";
import type { Task } from "@/lib/gtd";
import type { AgendaSlot as Slot } from "@/lib/agenda";

export default function AgendaTimeline({
  date,
  scheduled,
  unscheduled,
  categories,
  slots,
}: {
  date: string;
  scheduled: Task[];
  unscheduled: Task[];
  categories: string[];
  slots: readonly Slot[];
}) {
  return (
    <div className="space-y-4">
      <PullFromListForm date={date} unscheduled={unscheduled} slots={slots} />

      <div className="space-y-3">
        {slots.map((slot) => (
          <SlotSection
            key={slot}
            date={date}
            slot={slot}
            slots={slots}
            categories={categories}
            tasks={applyManualOrder(
              scheduled.filter((t) => (t.agenda_slot ?? "Anytime") === slot)
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SlotSection({
  date,
  slot,
  slots,
  categories,
  tasks,
}: {
  date: string;
  slot: Slot;
  slots: readonly Slot[];
  categories: string[];
  tasks: Task[];
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await createAgendaTask(formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{slot}</h3>
        <span className="rounded-full bg-card-border/40 px-2 py-0.5 text-[11px] text-muted">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="mb-2 rounded-lg border border-dashed border-card-border px-3 py-2 text-center text-[11px] text-muted">
          Nothing scheduled for this block
        </p>
      ) : (
        <ul className="mb-2 space-y-1.5">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-1.5 rounded-md border border-card-border bg-background px-2 py-1.5 text-xs"
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
              <span className="shrink-0 rounded-full border border-card-border px-1.5 py-0.5 text-[10px] text-muted">
                {task.category}
              </span>
              <select
                value={slot}
                disabled={isPending}
                onChange={(e) =>
                  startTransition(() => scheduleTask(task.id, date, e.target.value))
                }
                title="Move to a different time block"
                className="shrink-0 rounded-md border border-card-border bg-background px-1 py-0.5 text-[10px] outline-none focus:border-accent"
              >
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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

      <form ref={formRef} action={handleAdd} className="flex gap-1">
        <input type="hidden" name="agenda_date" value={date} />
        <input type="hidden" name="agenda_slot" value={slot} />
        <input
          name="task"
          placeholder={`+ add to ${slot.toLowerCase()}`}
          autoComplete="off"
          list="agenda-categories-datalist"
          className="flex-1 rounded-md border border-card-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <input
          name="category"
          list="agenda-categories"
          placeholder="Category"
          className="w-24 rounded-md border border-card-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <datalist id="agenda-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
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
  slots,
}: {
  date: string;
  unscheduled: Task[];
  slots: readonly Slot[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState("");
  const [slot, setSlot] = useState<Slot>(slots[slots.length - 1]);

  function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      await scheduleTask(selected, date, slot);
      setSelected("");
    });
  }

  if (unscheduled.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
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
      <select
        value={slot}
        onChange={(e) => setSlot(e.target.value as Slot)}
        className="rounded-md border border-card-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent sm:w-36"
      >
        {slots.map((s) => (
          <option key={s} value={s}>
            {s}
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
