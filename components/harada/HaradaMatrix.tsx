"use client";

import { useTransition } from "react";
import {
  createTaskFromItem,
  unlinkItemTask,
  updateElement,
  updateItem,
} from "@/app/harada/actions";
import type { HaradaElementWithItems, HaradaGoal, HaradaItem } from "@/lib/harada";

export default function HaradaMatrix({
  goal,
  elements,
}: {
  goal: HaradaGoal;
  elements: HaradaElementWithItems[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        8 key elements that get you to the goal, each with 8 specific action
        items. Click any cell to edit it — it saves when you click away.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {elements.map((element) => (
          <ElementPanel key={element.id} goal={goal} element={element} />
        ))}
      </div>
    </div>
  );
}

function ElementPanel({
  goal,
  element,
}: {
  goal: HaradaGoal;
  element: HaradaElementWithItems;
}) {
  const [isPending, startTransition] = useTransition();

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === (element.title ?? "")) return;
    startTransition(() => updateElement(element.id, goal.id, value));
  }

  return (
    <div className="flex flex-col rounded-xl border border-card-border bg-card p-3 shadow-sm">
      <input
        defaultValue={element.title ?? ""}
        onBlur={handleBlur}
        disabled={isPending}
        placeholder={`Element ${element.position}`}
        className="mb-2 rounded-md border border-card-border bg-background px-2 py-1.5 text-sm font-semibold outline-none focus:border-accent"
      />
      <ul className="space-y-1.5">
        {element.items.map((item) => (
          <ItemRow key={item.id} goal={goal} element={element} item={item} />
        ))}
      </ul>
    </div>
  );
}

function ItemRow({
  goal,
  element,
  item,
}: {
  goal: HaradaGoal;
  element: HaradaElementWithItems;
  item: HaradaItem;
}) {
  const [isPending, startTransition] = useTransition();

  function handleBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    if (value === (item.text ?? "")) return;
    startTransition(() => updateItem(item.id, goal.id, value));
  }

  function handleAddTask() {
    startTransition(() =>
      createTaskFromItem(item.id, goal.id, goal.title, element.title)
    );
  }

  function handleUnlink() {
    startTransition(() => unlinkItemTask(item.id, goal.id));
  }

  return (
    <li className="space-y-1">
      <textarea
        defaultValue={item.text ?? ""}
        onBlur={handleBlur}
        disabled={isPending}
        rows={2}
        placeholder={`Action ${item.position}`}
        className="w-full resize-none rounded-md border border-card-border bg-background px-2 py-1 text-xs outline-none focus:border-accent"
      />
      {item.task_id ? (
        <button
          type="button"
          onClick={handleUnlink}
          disabled={isPending}
          title="Unlink from its task (doesn't delete the task)"
          className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent hover:opacity-80"
        >
          ✓ In tasks
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddTask}
          disabled={isPending || !item.text?.trim()}
          title="Create a real task from this action item"
          className="rounded-full border border-card-border px-2 py-0.5 text-[10px] text-muted hover:bg-card-border/40 disabled:opacity-40"
        >
          + Add as task
        </button>
      )}
    </li>
  );
}
