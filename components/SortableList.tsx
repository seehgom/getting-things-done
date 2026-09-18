"use client";

import { useTransition } from "react";
import { reorderTasks } from "@/app/actions";
import { useDragReorder } from "@/lib/useDragReorder";
import TaskItem from "@/components/TaskItem";
import type { CompletedTask, Task } from "@/lib/gtd";

export type DragControls = {
  draggable: true;
  dragActive: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMoveUp?: () => void;
  onMoveToTop?: () => void;
};

/**
 * Wraps a list of tasks with manual drag-and-drop + move-up/move-to-top
 * reordering, persisted via reorderTasks(). Renders each task as a
 * TaskItem directly (rather than taking a render-prop) because a Server
 * Component can't pass a plain function across the client boundary as a
 * prop — only serializable data (arrays, plain objects, ...) is allowed,
 * so this needs to own the TaskItem rendering itself.
 */
export default function SortableList({
  items,
  categories,
  contexts,
  allTasks,
  completedByParent,
}: {
  items: Task[];
  categories: string[];
  contexts: string[];
  allTasks: Task[];
  completedByParent: Record<string, CompletedTask[]>;
}) {
  const [isPending, startTransition] = useTransition();
  const { order, dragId, handleDragStart, handleDragOver, handleDragEnd, moveUp, moveToTop } =
    useDragReorder(items, reorderTasks, startTransition);

  return (
    <>
      {order.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          categories={categories}
          contexts={contexts}
          allTasks={allTasks}
          completedChildren={completedByParent[task.id] ?? []}
          dragPending={isPending}
          drag={{
            draggable: true,
            dragActive: dragId === task.id,
            onDragStart: () => handleDragStart(task.id),
            onDragOver: (e) => handleDragOver(e, task.id),
            onDragEnd: handleDragEnd,
            onMoveUp: index > 0 ? () => moveUp(task.id) : undefined,
            onMoveToTop: index > 0 ? () => moveToTop(task.id) : undefined,
          }}
        />
      ))}
    </>
  );
}
