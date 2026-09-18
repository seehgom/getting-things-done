"use client";

import { useTransition, type DragEvent, type ReactNode } from "react";
import { reorderTasks } from "@/app/actions";
import { useDragReorder } from "@/lib/useDragReorder";
import type { Task } from "@/lib/gtd";

export type DragControls = {
  draggable: true;
  dragActive: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDragEnd: () => void;
  onMoveUp?: () => void;
  onMoveToTop?: () => void;
};

/**
 * Wraps a list of tasks with manual drag-and-drop + move-up/move-to-top
 * reordering, persisted via reorderTasks(). Renders nothing of its own —
 * `children` returns each item's own element (e.g. a <TaskItem key={...}
 * .../>), so the caller keeps full control of the surrounding <ul>/<li>
 * structure and whatever other props each item needs.
 */
export default function SortableList({
  items,
  children,
}: {
  items: Task[];
  children: (task: Task, drag: DragControls, isPending: boolean) => ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const { order, dragId, handleDragStart, handleDragOver, handleDragEnd, moveUp, moveToTop } =
    useDragReorder(items, reorderTasks, startTransition);

  return (
    <>
      {order.map((task, index) =>
        children(
          task,
          {
            draggable: true,
            dragActive: dragId === task.id,
            onDragStart: () => handleDragStart(task.id),
            onDragOver: (e) => handleDragOver(e, task.id),
            onDragEnd: handleDragEnd,
            onMoveUp: index > 0 ? () => moveUp(task.id) : undefined,
            onMoveToTop: index > 0 ? () => moveToTop(task.id) : undefined,
          },
          isPending
        )
      )}
    </>
  );
}
